---
date: 2022-8-15
title: 动态修改Referer欺骗服务器
tag: 
  - electron
  - referer
---

## 前言
在做`js(electron)`版本的蓝奏解析时,发现要修改`referer`发送请求,但是`chrome`内核不允许这样做

## 开始

> 依赖: `ipcMain`,`ipcRenderer`

在主进程创建窗口后添加: 

```js
ipcMain.on('lanzou',(event,args) => {
  session.defaultSession.webRequest.onBeforeSendHeaders({urls: ["*://*/*"]}, (details, callback)=> {
    details.requestHeaders['referer'] = args;
    callback({requestHeaders: details.requestHeaders});
  });
});
```

在渲染进程内添加:

```js
ipcRenderer.send('lanzou',url);
```

> 注: `lanzou`是通讯的`key`,可以替换
>
> `*://*/*`是匹配的`url` 可修改
>
> 此方法会影响其他子进程,不过影响不大,主要看你改了啥,如果只是`referer`或`ua`应该不会又啥影响

