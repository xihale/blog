---
title: Manjaro - 高漫M6
date: 2023-11-18 20:47:35
tags:
  - manjaro
  - drawing
---

## Preface

最近有点想画画, 并且有一个数位板设计网页也方便!

## Start with 高漫M6

{% note info modern %}  
因为 这个板子性价比比较高, 所以就用这个了  
Reference: [在Linux上完美使用高漫M6数位板 - Eslzzyl](https://www.cnblogs.com/eslzzyl/p/17114636.html)  
{% endnote %}

### 安装依赖

{% note info modern %}
dkms是用来外挂linux内核驱动的一个工具。我们用dkms来外挂Digimend驱动。
{% endnote %}

```shell
sudo pacman -S dkms linux-headers
```

### 安装驱动

#### clone

{% note info modern %}
这里我们使用 `inochisa` 提供的版本: [digimend-kernel-drivers](https://github.com/inochisa/digimend-kernel-drivers/tree/huion-kd200)
{% endnote %}

```shell
git clone git@github.com:inochisa/digimend-kernel-drivers.git -b huion-kd200
```

#### install

{% note info modern %}  
这里如果报错, 则先运行(在 `digimend-kernel-drivers` 目录下), 删除一下 cached 文件等  
```shell
make dkms_uninstall
```
{% endnote %}

```shell
cd digimend-kernel-drivers
make dkms_install
```

### 重启内核模块

{% note info modern %}
直接 `reboot` 重启电脑也行
{% endnote %}

```shell
sudo modprobe -r hid-kye hid-uclogic hid-polostar hid-viewsonic
```

### 测试

安装一个笔记软件 `Xournal++` 试着写一写
{% note info modern %}
设置里面可以调整各项参数(比如高亮光标位置, 这样更好看清)
{% endnote %}
```shell
sudo pacman -S xournalpp
```

