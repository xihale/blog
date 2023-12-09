---
title: linux - 安装驱动后无法启动
date: 2023-12-09 19:03:24
tags:
  - drive
categories:
  - linux
---

## Preface

手贱安装了 一些 `video-xxx` 驱动, 结果电脑无法启动 

{% note info modern %}  
Reference: [Manjaro Linux 更新后无法启动问题](https://www.cnblogs.com/oloroso/p/14229315.html)  
{% endnote %}  

## Solution

### Live Environment

随便找一个 `linux live` 环境进入(建议使用轻量的 `arch iso`)

### partition file

首先要找到你的系统分区

```shell
lsblk -f | grep ext4
```

{% note info modern %}
替代方案:
1. `sudo fdisk -l`  
2. `sudo sfdisk -l`
3. `sudo cfdisk` (~~甚至可以用 `cfdisk`, 如果你想的话~~)  
{% endnote %}

### mount

自己随便找一个文件夹 `mount`, 我就照我的习惯写了


```shell
mkdir manjaro
mount /dev/sda2 manjaro
```

### chroot

直接进入你的 `system`!

```shell
chroot manjaro
```

### Restore

最后的步骤, 直接用 `mhwd` 删除导致无法开机的驱动即可

先找到驱动名字
```shell
mhwd --listinstalled
```

{% note info modern %}  
Output e.g.  
这里导致我无法启动的驱动分别是 `video-modesetting` 和 `video-vesa`, 那么就删除这两个即可
```
---------------------------------------------------
NAME               VERSION     FREEDRIVER   TYPE
---------------------------------------------------
video-linux        2018.05.04  true         PCI
video-modesetting  2020.01.13  true         PCI
video-vesa         2017.03.12  true         PCI
```
{% endnote %}

```shell
mhwd -r pci video-modesetting video-vesa
```

### reboot

完结撒花🎉! (~~这个 emoji 居然叫 `拉炮彩带`~~)