---
date: 2022-02-09
title: ES6新特性 - promise
args: javascript
catogories: 编程
---

## 序

有时候要写函数用到了异步，但是又想强行使他同步执行

这时候就可以用到 `Promise` 了

## 言

### 基础

首先，一个简单的 `Promise` 定义是这样的: 

```javascript
new Promise((resolve,reject)=>{ // 这里的 resolve 接收 成功 后返回的值, reject 接收 失败 后返回的值 
    // 注意: resolve 触发 then 方法 reject 触发 catch 方法
    if(...){
        resolve(funtion(){return 1});
    }else if(...){
        resolve(2);
	}else{
        reject(3);
    }
})
```

> 这里我喜欢把 resolve 写成 solve ，把 reject 写成 throwerr ，这是不要紧的

### 进阶

然后是进阶的用法: 搭配 `async` 和 `await` 实现同步操作

```javascript
// 这里很简单在执行的 await 函数外套一个 async 就行了
async funtion(){
    await new Promise((solve,throwerr)=>{
        ...
    })
    //这样的话，就不用写 then 了
    ...
}
```



### examples: 

#### resolve + then

```javascript
new Promise((solve,throwerr)=>{
    setTimeout(function(){
        solve(alert(1))
    },1500)
}).then(_=>{alert(2)})
```

#### reject + catch

```javascript
new Promise((solve,throwerr)=>{
   	setTimeout(function(){
        throwerr("...")
    },1500)
}).catch(err=>{console.log("error: ",err)})
```

#### resolve + await

```javascript
function sleep(time){
    return new Promise((solve,throwerr)=>{
        setTimeout(solve,time)
    })
}
(async _=>{
    await sleep(1500) // 原地等待 1500 ms
    console.log("sleep over") // 等待结束后执行
})()
```

