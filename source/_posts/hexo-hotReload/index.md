---
title: hexo-hotreload
date: 2023-08-25 11:24:43
tags: hexo
---

## Preface

`hexo serve` 连热重载都没有...
找不到可用的, 准备自己写

## 技术栈
后端监听文件 `generate` 事件, 通过 Websocket 发送信号

## Start up

### 安装插件

Github: [hexo-hotreload](https://github.com/xihale/hexo-hotreload)

```shell
npm i hexo-hotreload
```

### 插入代码

{% note danger modern %}  
插入代码操作只在 `0.0.1` 版本中需要使用  
更高版本已实现自动插入  
{% endnote %}

在你想要进行热更新的页面插入

{% note info modern %}  
你可以在 `url` 框内键入 `javascript:` 并粘贴下面的内容  
也可以直接将这些粘贴到 `调试控制台` 中  
{% endnote %}  

```javascript
var h1=document.getElementsByTagName("h1"),article=document.querySelector("div.e-content")??document.getElementsByTagName("article")[0],title="";for(let k in h1)if(h1[k].className?.includes("title"))title=h1[k].innerText;if(title==="")throw new Error("Not find title, no article");var ws=new WebSocket("ws://localhost:3000");ws.addEventListener("open",function(){console.log("Connect Ok");ws.send(title)});ws.addEventListener("message",e=>{article.innerHTML=e.data});
```
