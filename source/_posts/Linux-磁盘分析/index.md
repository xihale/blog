---
date: 2021-11-20
title: Linux-磁盘分析
tags: linux
categories: linux
---

## 前言

`linux`占空间过大,需要软件进行分析

## 开始

安装`ncdu`

```shell
sudo apt install ndcu
```

检测空间

```shell
sudo ncdu -x /
```

