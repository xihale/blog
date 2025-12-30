---
title: "霞鹜文楷-EveryWhere"
pubDate: "2025-12-30"
description: "我很喜欢霞鹜文楷，所以我在几乎所有设备上都尝试配置这个字体"
---

## zFont3

这是我前段时间发现的，用下来很不错，挺稳定的，我猜测原理是通过文件/网络劫持并让系统误认字体文件，然后通过系统配置字体；

目前我在我的 HyperOS 2/3、 HarmonyOS 3 上采取这个方案

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

## 博客（自动裁切字体）

网上有很多方案，但是我是自己弄了一套很简单的，放到构建流程中直接就可以用了

主要调用 pyftsubset，脚本在 <https://github.com/xihale/blog/blob/astro/scripts/subset-font.ts> ，方便融入 bun 工作流

## 与其他字体合并

考虑到 等宽字体 + Nerd 表情需求，也可以把别的字体与其合并、覆盖

项目地址：<https://github.com/xihale/LXGW-JB-nerd>
