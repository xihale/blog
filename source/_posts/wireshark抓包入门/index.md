---
date: 2022-02-06
title: wireshark抓包入门
tag: wireshark
category: 网络
---

## 序

使用 `tcpdump` 已经满足不了日益增长的抓包需求了

这时得使用更加强大的工具 `wireshark` 进行底层抓包了

这是官网: [Wireshark](https://www.wireshark.org/)([如果实在太卡点击这里,自己搭建了个万能镜像站](https://github.xihale.workers.dev/-----https://www.wireshark.org/),不过别滥用)

## 言

### 安装(installing)

#### Linux

使用包管理器即可,不同系统的安装命令可能不同，这里演示 `Ubuntu系` 的安装方法

```shell
sudo apt install wireshark # 使用包管理器进行安装
sudo groupadd wireshark # 添加一个 wireshark 用户组
sudo chgrp wireshark /usr/bin/dumpcap # 将底层抓包命令 dumpcap 规划到 wireshark 用户组内 ( 获取执行权 )
sudo chmod 4755 /usr/bin/dumpcap # 设置 wireshark 用户组拥有 root 权限
```

这里还有一步，请把 `xihale` 改为你自己的用户名!

```shell
sudo gpasswd -a xihale wireshark # 将自己加入到 wireshark 用户组以执行 wireshark
```

#### Windows

去到这里: https://www.wireshark.org/#download或[镜像站](https://github.xihale.workers.dev/-----https://www.wireshark.org/#download)

下载安装包安装即可