---
title: scrcpy
date: 2023-11-05 09:23:57
tags:
  - android
  - software
---

## install

```shell
paru -S scrcpy
```

## connect

在手机上操作你的 `USB调试`  
检查是否连接:

```shell
adb device
```

## start

```shell
scrcpy
```

<!-- ## WiFi 

默认端口号是 `5555`, 我们直接设置 `5555` 即可, 然后想办法知道手机的 `ip` 地址进行 `connect` 即可

{% note info modern %}
查询手机 `ip`
```shell
adb shell ip -f inet addr show wlan0
```
{% endnote %}

```shell
adb tcpip 5555
adb connect 192.168.0.101
```

断开 `usb` 连接
 -->
