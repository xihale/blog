---
title: delete objs in json
date: 2023-08-25 19:56:22
tags: javascript
---

> 转自: [解决 TypeError: Converting circular structure to JSON - JSON.stringify 报错
> ](https://blog.csdn.net/qq_17627195/article/details/118543310)

```js
let cache = []; // 去重数组
let json_str = JSON.stringify(hexo, function (key, value) {
  if (typeof value === "object" && value !== null) {
    if (cache.indexOf(value) !== -1) return;
    cache.push(value);
  }
  return value;
});
cache = null; //释放cache
```
