---
title: xsocket
date: 2023-05-26 22:40:12
tags:
description: 这是一篇以前文章的翻版，我将使用更加先进的技术去实现一个基于系统函数的跨平台 socket 库的设计
---

## 前言
之前写的那个库真的是的太烂了，所以埋了一个坑，现在终于要准备开始填了(最近看了本书)

## 接口设计
> 我不准备使用 `template` 进行参数传递实现 `protocol-independent`, 因为这会限制一些本来很好处理的操作
```cpp
namespace xt{
namespace socket{
    // Definitions
    // ...

    // class
    class socket{
    private: socket_t sockfd; // it refers to socket file descriptor
    public: // functions
        // 构造
    }
}
}
```