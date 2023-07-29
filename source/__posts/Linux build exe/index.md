---
date: 2022-02-07
title: 在Linux下编译exe文件
tag: c++
category:
- [编程]
- [linux]
---

## 序

在 `linux` 下编写 `c++` ，然后又想直接编译成 `exe` 发布 ( 懒得去 `windows平台`重新编译了 )

## 言

这里使用 `交叉编译器` 实现编译 `exe文件`

1. 安装 `mingw-w64` 包

   >  各个系统有不同的安装命令，此处演示 `Ubuntu(Debian)系`

   ```shell
   sudo apt install mingw-w64
   ```

2. 使用 `mingw-w64` 编译

   > 其中内置的编译命令太多了，此处仅演示 `默认` 版本的 `g++ 编译器` ，其中 `main.cpp` 是需要编译的源文件

   ```shell
   i686-w64-mingw32-g++ main.cpp -o main.exe
   ```

   