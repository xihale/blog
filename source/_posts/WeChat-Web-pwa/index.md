---
title: WeChat Web(pwa)
date: 2024-03-09 18:29:53
tags:
  - arch
  - javascript
---

## Preface

微信在 `Linux` 的各种版本都不好用, 不过我平常也不太用得到, 网页端就足以满足我的需求了

## Content

### Over the limitation of wechat web

#### Original

你可以选择直接使用原作者的方法, 去下载他的 `Release` 打包好的文件, 然后解压到一个目录里, 打开开发者模式, 将那个目录拖动到 `extension page` 里即可 

> 仓库地址[wechat-need-web](https://github.com/lqzhgood/wechat-need-web)

#### mine

我用 `chromium` 将这个文件夹打包成 `crx` 格式了, 直接拖动安装即可

https://github.com/xihale/wechat-need-web/releases/download/1.1.1/wechat_need.crx

### Pwa(Optional)

夹在众多页面里面太难看了, 所以我写了个浇水代码(`油猴脚本`), 让浏览器将其识别成 `pwa` 应用了
其实 `pwa` 的好处好有很多, 实在是闲得没事干就去加一下

有空就直接加在 `wechat-need-web` 插件里面, 那样也省事

[wechat-pwa @ greasyfork](https://greasyfork.org/zh-CN/scripts/489391-wechat-pwa)
