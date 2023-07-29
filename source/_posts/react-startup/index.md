<<<<<<< Updated upstream
---
=======
>>>>>>> Stashed changes

title: react-startup
date: 2023-06-18 12:36:42
tags:
    - react
    - web
---

# 前言
想学一下 `element-ui`, 结果好像得搞搞 `vue`, 那就学一下 `React` 吧

{% note info %}
本教程默认使用 `cnpm`, 可以使用 `alias cnpm=npm` 来避免冲突
{% endnote %}
# 基本
首先安装 `react-scripts`
```shell
sudo cnpm i -g react-scripts
```

{% note info %}
The operators of `react-scripts`:
1. start: 创建一个 server (hot-update)
2. build
3. ...
{% endnote %}

创建一个 `node` 项目, 并安装依赖
```shell
cnpm init
mkdir public src
cnpm i react react-dom
```

基本的东西都完成了, 当然, 现在你需要自己处理一些东西
首先创建基本文件(这是一个最简单的形式)

```html public/index.html
<root></root>
```

```js src/index.js
import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";

const root = createRoot(document.getElementById("root"));
root.render( <h1>Hello React!</h1> );
```

基本操作到此为止

# 开始
## 分模块
只需要写一些 `.jsx`(Recommanded)/`js` 文件然后在 `index.js` 中 `import` 和使用 即可

```js src/components/MyBtn.jsx
const MyBtn=({text})=>{
    const [count, setCount] = useState(0);
    return <button style={{color: red}} onClick={setCount(count+1)}> {text} : {count} </button>;
};
export default MyBtn;
```

```js src/index.js
import MyBtn from 'components/MyBtn.jsx';
root.render( <MyBtn text={"123"} /> );
```

> 此处包含了很多信息(信息熵很大,*笑*)
1. `模块化` (*这个自己取查吧*)
2. 在调用组件(`function`)的时候可以直接以 `html-label` 调用
    {% note warning %}
    这里要注意，调用的组件的定义是: 以 `html-label` `Object` 为返回值的函数
    {% endnote %}
3. 使用 `js` 中的变量参与渲染: 用 `{}` 标注这是外部的变量
4. 传参
    1. 发送的是 `Object`, 所以接收的时候要使用 `{}` 来接收
    2. 发送的时候直接写为 `html-label` 的 `Attribute`
5. `State`: 这是一个很有意思的东西, 用来创建一个组件内的快照, 当 setXx 被调用时会更新 `count` 和依赖其的 `dom`

# 进阶
## 使用 `antd` 框架
```shell
cnpm i antd
```

```js
import { Button } from "antd";
```
