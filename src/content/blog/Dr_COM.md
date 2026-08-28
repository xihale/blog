---
title: "绕过校园网多设备检测"
pubDate: "2025-09-13"
description: "校园网突破指南：利用 UA3F 和 MAC 地址修改绕过 Dr.COM 多设备限制"
tags: ["技术"]
draft: false
---

## Reference

- [UA3F 与 Clash 从零开始的部署教程](https://sunbk201public.notion.site/UA3F-Clash-16d60a7b5f0e457a9ee97a3be7cbf557)
- [使用友善 R2S 打造 GDUT 专属软路由 不再受学校设备限制](https://bili33.top/posts/Openwrt-on-friendlyarm-R2S/)

## 引入

近年来随着生育潮等问题，
加上多数大学本科教育批款少、本科生不受重视等问题，
大学中从基础设施到基本教育都是叫人一言难尽。

具体原因我不清楚，
但事实是学校的网络基础设施对学生的限制特别多，
包括历史遗留问题和有意为之的“设障”。

本文针对学校基于 Dr.COM 对多设备进行限制的问题。

## 方案

以下方案都是 [GamerNoTitle](https://bili33.top/) 告诉我的，
他进行了大量的探索，
并无私地将这些分享出来，
让我的网络环境跟上一层楼。

### UA 修改

Dr.COM 本质上是通过 UA 对多设备进行检测（识别 UA 中的设备信息）。

所以我们可以通过修改 HTTP 报文中的 UA 信息，
达到绕过多设备检测的目的。

具体的方案有：

- [ua2f](https://github.com/Zxilly/UA2F)
  这个是使用 c 语言写的，
  由于种种原因，目前为止还没有支持多线程，
  考虑到性能问题，我没有使用这个方案。
  如果要使用这个方案可能需要自己编译。
- [ua3f](https://github.com/SunBK201/UA3F)
  这个是基于 Go 语言的，
  Go 是出了名的网络相关的基础设施，
  我用了一下，
  还是很好用的，具体来说，没有什么问题。

### 特殊方案

不知道是某些学校自己设置的问题还是 Dr.COM 的问题；
也许根本不是问题，
login 之后前几秒会有一个 `mac <-> UA` 白名单绑定的操作；
我个人猜测是由于某些程序自己配有相应的 UA
（并且这些软件一般一直在发送请求），
如果严格限制 UA 会导致很多问题，
所以在最开始的一段时间就有了如此操作。

> 之后有时间我再具体检测一下。

具体来讲，其实只要修改 mac 地址，
重新 login 即可。

### IPv6 NAT6

> 这个问题并非所有人都有，请根据实际情况判断。

校园网通常只给每个端口分配一个 `/64` 的 IPv6 地址，
不提供前缀委派（PD），
导致 OpenWrt 无法通过默认的 SLAAC 给 LAN 侧设备分发公网 IPv6 地址。

方案是 **NAT6**（类似 IPv4 的 NAT）：
LAN 设备使用 ULA 私有地址（`fd00:aacc:721:...`），
通过 IPv6 MASQUERADE 转换为 WAN 侧公网 IPv6 出去。

#### 1. 配置 RA 和 DHCPv6

```bash
uci set dhcp.lan.ra='server'
uci set dhcp.lan.dhcpv6='server'
uci set dhcp.lan.ndp='disabled'
uci set dhcp.lan.ra_default='1'
uci set dhcp.lan.ra_lifetime='7200'
uci set dhcp.lan.ra_management='1'    # SLAAC + DHCPv6 混合模式（Android 不支持纯 DHCPv6）
uci set dhcp.lan.ra_maxinterval='30'  # 缩短 RA 间隔，确保 WiFi 设备能收到
uci set dhcp.lan.ra_mininterval='10'
uci set dhcp.lan.ra_hop_limit='64'
```

#### 2. 开启防火墙 IPv6 NAT（masq6）

fw4（nftables）下，设置 `masq6` 后会自动生成 IPv6 MASQUERADE 规则：

```bash
# 先确认 wan zone 的 config name（通常是 cfg03dc81 或类似）
uci show firewall | grep "zone.*\.name='wan'"

# 开启 masq6
uci set firewall.cfg03dc81.masq6='1'
```

#### 3. 给 br-lan 添加公网 IPv6 地址（/128）

这是关键步骤。odhcpd 会检查 LAN 接口是否有公网地址，
如果没有就强制把 RA lifetime 设为 0，LAN 设备不会配置 IPv6 默认网关。

用 `/128` 而非 `/64`，这样只生成主机路由，不会和 WAN 侧路由冲突：

```bash
# 查看 WAN 口获取到的公网 IPv6 前缀
ip -6 addr show dev eth0 | grep 'scope global'

# 假设前缀为 2001:da8:2018:2232::/64，给 br-lan 添加 /128 地址
uci set network.lan.ip6addr='2001:da8:2018:2232::1/128'
uci set network.lan.ip6assign='60'
uci commit network
```

> **注意**：`2001:da8:2018:2232::1/128` 需要替换为你实际 WAN IPv6 前缀。

#### 4. 修复 DNS：添加 IPv6 上游 DNS

校园网 DNS 通常不返回 AAAA 记录，
需要在 dnsmasq 中添加支持 IPv6 的公共 DNS：

```bash
uci add_list dhcp.@dnsmasq[0].server='2400:3200::1'
uci add_list dhcp.@dnsmasq[0].server='2001:4860:4860::8888'
uci set dhcp.@dnsmasq[0].noresolv='1'
```

#### 5. 提交并重启

```bash
uci commit dhcp
uci commit firewall
/etc/init.d/firewall restart
/etc/init.d/network restart
/etc/init.d/dnsmasq restart
```

完成后 LAN 侧设备会获取到 ULA 地址（如 `fd00:aacc:1122:...`），
出站流量通过 NAT6 转换为 WAN 侧公网 IPv6，
可以正常访问 IPv6 网站。

#### 6. 验证

```bash
# 在 OpenWrt 上检查 LAN 设备 IPv6 邻居
ip -6 neigh show dev br-lan

# 在 LAN 设备上检查 IPv6 地址
ip -6 addr show

# 测试 IPv6 连通性
ping -6 -c 3 2001:4860:4860::8888
curl -6 -sS https://test6.ustc.edu.cn | head -3
```

#### 注意事项

- **手机等移动设备可能需要关闭 WiFi 再重新打开**才能获取到 IPv6 地址。`ra_maxinterval='30'` 已尽量缩短 RA 间隔。
- **如果 Linux 设备无法获取 IPv6 地址**，可能是代理软件（如 dae）开启了 `forwarding` 导致内核自动禁用 `accept_ra`。修复：`sysctl -w net.ipv6.conf.<接口>.accept_ra=2`，或创建 NetworkManager dispatcher 脚本：

```bash
cat > /etc/NetworkManager/dispatcher.d/pre-up.d/ipv6-accept-ra << 'EOF'
#!/bin/sh
[ "$1" = "wlo1" ] && [ "$2" = "pre-up" ] && sysctl -w net.ipv6.conf.wlo1.accept_ra=2
EOF
chmod +x /etc/NetworkManager/dispatcher.d/pre-up.d/ipv6-accept-ra
```

有关用到的一些脚本，
开源了，建议配合 `direnv` 使用。
（Fork 自 GamerNoTitle，感谢 GamerNoTitle 的无私奉献和思路分享！）

建议使用 go lang 重写版，<https://github.com/xihale/kc-go/>

[xihale/WrtScript](https://github.com/xihale/WrtScript)
[GamerNoTitle/WrtScript](https://github.com/GDUTMeow/WrtScript)
