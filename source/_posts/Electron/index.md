---
title: $filedir
date: 2022-8-15
---
---
title: Electron
tags: electron
categories: 
- [编程]
- [桌面软件]
---

## 前言

这篇文章是赶出来的,所以写的不是很好

主要是讲了如何创建一个 Electron 项目

> 注意: `Win`下的终端要用`cmd`

## 开始

最好先搞个`cnpm`

```shell
npm install -g cnpm --registry=https://registry.npm.taobao.org
```

然后下载`Electron`

```shell
cnpm install -g electron && cnpm install -g electron-forge
```

如果执行成功,那就是安装好了

然后 `进入项目目录` 执行`init`

``` shell
electron-forge init && cd node_modules\electron && npm install
```

最后,完成了项目的编写可以:

1. 调试

 ```shell
 electron-forge start
 ```
2. 运行
 ```shell
 electron .
 ```

## 打包

1. 最优方案

   首先安装`electron-packager`

   ```shell
   npm install electron-packager
   ```

   然后把这个加到`package.json`里的`scripts`里

   ```shell
   "packager": "electron-packager ./ programName --platform=win32 --out=./OutApp "
   ```

   最后运行

   ```shell
   npm run packager
   ```

   

2. 官方方案(很慢)

   ```shell
   npm run make
   ```

   如果失败了就先运行下面的代码(自行创建`app`文件夹)

   ```shell
   //在根目录下
   npm uninstall electron-store --save //卸载electron-store这个包
   cd app && npm install electron-store --save //在app目录下安装这个包，包的信息会添加到这个目录下的package.json
   
   //回到根目录
   npm run make//成功打包了！！！！
   ```



## 注意事项

```js
//请使用 CommonJS 的格式写 require 而不是ES6
const {app} = require('electron')
//错误写法,这可能会编译不过
import {app} from 'electron'
```

