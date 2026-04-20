---
title: "霞鹜文楷-EveryWhere"
pubDate: "2025-12-30"
description: "我很喜欢霞鹜文楷，所以我在几乎所有设备上都尝试配置这个字体"
tags: ["技术"]
---

## zFont3

这是我前段时间发现的，用下来很不错，挺稳定的，我猜测原理是通过文件/网络劫持并让系统误认字体文件，然后通过系统配置字体；

目前我在我的 HyperOS 2/3、HarmonyOS 3 上采取这个方案

## MIUI 14

我参考别的模块写了一个模块，没试过 zFont3; 这个模块在 HyperOS 会失效；

地址：<https://github.com/xihale/LXGW-font-magisk-module>

## Koreader(Kindle)

这个分为 书籍字体和界面字体

### 书籍字体

首先要把字体文件传到 /mnt/us/fonts 下；

接着书籍配置选中这个字体；必要时得配置强制使用这个字体（忽略书籍 CSS 配置等）

### 界面字体

需要写一个 patch 脚本

koreader/patches/2-font-override.lua

```lua
local Font = require("ui/font")
for k, v in pairs(Font.fontmap) do
 if v == "NotoSans-Regular.ttf" then
  Font.fontmap[k] = "LXGWWenKai-Regular.ttf" -- change to your preferred font
 elseif v == "NotoSans-Bold.ttf" then
  Font.fontmap[k] = "LXGWWenKai-Regular.ttf" -- change to your preferred font
 end
end
```

## 博客（动态切片字体）

以前我使用一套基于 `pyftsubset` 的构建脚本在 CI 环境下动态裁剪字体子集，但那套方案非常依赖 Python 环境，且在处理大字体文件时会极大地拖慢 CI 构建速度。

现在我改用了 **`lxgw-wenkai-webfont`** 方案。它基于 CSS 的 `unicode-range` 属性，将庞大的字体文件预先切分为数百个微小的切片。浏览器在渲染页面时，会根据实际出现的字符自动下载对应的切片。

这种方案不仅实现了 **零构建开销**，还避免了由于动态内容（如用户留言、搜索结果）导致子集缺失的问题。配置起来也非常简单，直接在 Astro 组件中引入对应的 CSS 即可：

```astro
import "lxgw-wenkai-webfont/lxgwwenkai-regular.css";
```

## 与其他字体合并

考虑到 等宽字体 + Nerd 表情需求，也可以把别的字体与其合并、覆盖

项目地址：<https://github.com/xihale/LXGW-JB-nerd>
