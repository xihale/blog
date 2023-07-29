---
date: 2022-05-22
title: 通过无备案域名搭建在国内服务器上的网站
args: javascript
catogories: 编程
---

## 序

从前，网站只要把端口改掉就能实现访问，但是现在不行了...

而身为一个初中生，并没有资格去执行严苛的域名备案制度，我也无奈

不过，身为一个热血青少年，想要拥有自己的网站(BLOG)也是理所当然的

> 注: 本文不违法任何有关网站搭建的法律(目前来说)
>
> 请不要使用此方法去做任何违法规则的事，作者概不负责
>
> 此方法优缺点
>
> 优点：可以支持80端口代理访问
>
> 缺点：IP段不支持`https`

## 言

### 分析

服务商的服务器限制在更底层，因为我们买的服务器一般不是物理机，所以相当于是虚拟机了，也就是说我们根本无法通过修改服务器的配置去防止域名被拦截，所以这条路不通!

而众所周知，服务商限制的是域名的备案与否，这与IP段访问是没什么关系的

（所以你想说，我在说废话吗？）

不，这里贴出我的解决方案

> 具体可以实现的功能: url实时刷新，url间接访问
>
> 有点晦涩难懂...看效果(这是我用这个方法搭建的站): [Public - xihale](https://o.xurl.ga/)

### 搭建教程

1. 首先把这段代码加入到要代理的页面(实现url刷新的基本)

   关于这个，如果是php伪静态的话建议加在主题文件内(防止干扰其他页面的问题,`OneManager`就遇到了这个问题)

   > 此处为简洁版，如果网站本身用 history 刷新机制站请移步 [网站本身用 history 刷新机制](#网站本身用 history 刷新机制[)

   ```html
   <script>
       top.postMessage(location.pathname+location.search+location.hash, "*");
   </script>
   ```

2. 然后自己用国外服务器搭建一个`代理站`填入`index.html`(记得把`Page`变量改为要代理的页面)

   > 注: 这里改链接为锚点形式是为了方便单文件读取
   >
   > 这里的源码不一定是最新的，最新源码请移步 [Website_proxy](https://github.com/xihale/websites_proxy)

   ```html
   <!DOCTYPE html>
   <html>
       <head>
           <meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
           <title>Website_proxy</title>
           <style>
               html{
                   height: 100%;
                   width: 100%;
               }
               iframe{
                   position: absolute;
                   top: 0;
                   left: 0;
                   height: 100%;
                   width: 100%;
                   border: none;
               }
           </style>
       </head>
       <body>
           <iframe id="page" src=""></iframe>
           <script>
               const Page=`https://xihale.top/`;
               document.getElementById("page").src=Page+location.hash.slice(1);
               window.addEventListener("load",()=>{
                   window.addEventListener("message",(e)=>{
                       console.log(e.data);
                       window.history.pushState({},0,location.origin+'#'+e.data);
                   });
               });
           </script>
       </body>
   </html>
   ```

3. 然后访问代理页面就相当于正常访问源站了

### cookie 跨站问题

1. 首先得去注册 `ip` 的证书

2. 用`https`访问站点，并把代理代码中的`Page`变量改为 `https` 格式

3. 在配置文档( `https` 申明处 )中加入 `Set-Cookie: Secure;SameSite=None;`配置

这里用 `apache` 的 `example` :

```
Header always edit Set-Cookie ^(.*)$ "$1;Secure;SameSite=None;"
```

### 网站本身用 history 刷新机制

这里重写 `history` 刷新机制，添加 `addHistoryListen` 功能

> 解决方案来自: [0.0君47079](https://juejin.cn/user/2541726614175479)大佬的文章[JavaScript如何实现history路由变化监听](https://juejin.cn/post/6844903790508933133)

```
<script>
class Dep {                  // 订阅池
    constructor(name){
        this.id = new Date() //这里简单的运用时间戳做订阅池的ID
        this.subs = []       //该事件下被订阅对象的集合
    }
    defined(){              // 添加订阅者
        Dep.watch.add(this);
    }
    notify() {              //通知订阅者有变化
        this.subs.forEach((e, i) => {
            if(typeof e.update === 'function'){
                try {
                   e.update.apply(e)  //触发订阅者更新函数
                } catch(err){
                    console.warr(err)
                }
            }
        })
    }
    
}
Dep.watch = null;

class Watch {
    constructor(name, fn){
        this.name = name;       //订阅消息的名称
        this.id = new Date();   //这里简单的运用时间戳做订阅者的ID
        this.callBack = fn;     //订阅消息发送改变时->订阅者执行的回调函数     
    }
    add(dep) {                  //将订阅者放入dep订阅池
       dep.subs.push(this);
    }
    update() {                  //将订阅者更新方法
        var cb = this.callBack; //赋值为了不改变函数内调用的this
        cb(this.name);          
    }
}

var addHistoryMethod = (function(){
        var historyDep = new Dep();
        return function(name) {
            if(name === 'historychange'){
                return function(name, fn){
                    var event = new Watch(name, fn)
                    Dep.watch = event;
                    historyDep.defined();
                    Dep.watch = null;       //置空供下一个订阅者使用
                }
            } else if(name === 'pushState' || name === 'replaceState') {
                var method = history[name];
                return function(){
                    method.apply(history, arguments);
                    historyDep.notify();
                }
            }
            
        }
}())

window.addHistoryListener = addHistoryMethod('historychange');
history.pushState =  addHistoryMethod('pushState');
history.replaceState =  addHistoryMethod('replaceState');

window.addHistoryListener('history',function(){
    top.postMessage("history "+location.pathname+location.search+location.hash, "*");
});

const title_change= new MutationObserver(function(mutations) {top.postMessage("title "+mutations[0].target.innerText, "*");})

title_change.observe(document.querySelector('title'), { characterData: true, subtree: true, childList: true })

top.postMessage("title "+document.title, "*");

</script>
```

