---
title: hexo plugin dev
date: 2023-07-29 16:32:20
tags: hexo
---

# Preface
`hexo` 的 `api` 做得太烂了

# 踩坑

## 插件

### 在 `node_modules` 创建插件文件夹(`hexo-*`)  
{% note info modern %}  
建议使用软链接  
{% endnote %}  

### 新建文件

{% note info modern index.js  %}  
 
```js index.js
"use struct";

hexo.extend.filter.register(
  "after_post_render",
  data=>{
    console.log("plugins dev");
    return data;
  },
  30
); 
```
{% endnote %} 

{% note info modern package.json  %}  
 
```json package.json
{
  "name": "hexo-*",
  "version": "0.0.1",
  "main": "index.js"
}

```
{% endnote %}  

### 添加"钩子"
在博客根目录的 `package.json` 中 `dependencies` 中添加 `"hexo-*": ">=0.0.1"`

### 测试
运行 `hexo g`  
查看是否输出 `plugins dev`  

### 注意事项
- 每次写好插件文件都得 **重新** `clean+generate`, 否则无效  
- 文件是伪热更新的, 所以只有修改文件才会触发 `serve` 的 `generate` 事件
