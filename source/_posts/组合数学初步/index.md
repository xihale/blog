---
title: 组合数学初步
date: 2023-08-26 08:23:08
tags: 
  - [learn]
  - [math]
  - [permutations]
category: math
katex:
  enable: true
---

## Preface
组合数学真是有趣

## 排列数
单看一个元素, 他可以排在任意 $n$ 个位置上  
第二个元素: 排在除第一个之外的 $n-1$ 个位置  
如此这般  

$$
A_n^n=n!
$$

任取 $k$ 个元素: 那就是减去其余 $n-k$ 个元素的全排列  
在此, 我们算出全部的排列, 除去蓝色的重复的情况, 剩下的就是红色的了  

$\textcolor{red}{\blacksquare\blacksquare}\textcolor{blue}{\blacksquare\blacksquare\blacksquare}$

$$
A_n^k=\frac{n!}{(n-k)!}
$$

## 组合数

同理  
$\textcolor{red}{\blacksquare\blacksquare}\textcolor{blue}{\blacksquare\blacksquare\blacksquare}$

我们把蓝色减掉之后还不够, 红色部分重复了, 那就再把红色部分除一下, 把多余的合并为一个即可  

$$
\binom{n}{k}=\frac{n!}{k!(n-k)!}
$$

## 常见计数方法

### 特殊优先处理

{% note info modern %}  
中间指蓝色, 排头排尾为红色
$\textcolor{red}{\blacksquare}\textcolor{blue}{\blacksquare\blacksquare\blacksquare}\textcolor{red}{\blacksquare}$
{% endnote %}  

在特殊条件加持下, 优先处理这一块就好:  
1. 在前面放一个钩子, 最后处理特殊条件
  $Source \Rightarrow Common \Rightarrow Special$
  e.g. 5个人排列, AB相邻
    1. 首先将 AB 转化为一个人
    2. 然后 计算 4 个人的排列数 $A_4^4=4!=24$
    3. 再处理 AB 的情况, $Ans=A_4^4\cdot 2=48$


2. 直接优先处理特殊条件, 然后再去处理 一般情况
  e.g. 5个人排列, A不在排头, B不在排尾
    分类讨论 A
    1. 放在 中间 3 个位置 $\Rightarrow$ B: 3种
    2. 放在 排尾 $\Rightarrow$ B: 4种
    其余任意排  
    综合: $(3\cdot 3+1\cdot 4)\cdot A_3^3=13\cdot A_3^3=78$


### 容斥原理

简单来说就是先什么都不管地 $+/-$ 然后再去处理重复或者缺少的情况, 最终处理到所有集合的交集

$$
\begin{aligned}
\left|\bigcup_{i=1}^{n}S_i\right|=&\sum_{i}|S_i|-\sum_{i<j}|S_i\cap S_j|+\sum_{i<j<k}|S_i\cap S_j\cap S_k|-\cdots\\
&+(-1)^{m-1}\sum_{a_i<a_{i+1} }\left|\bigcap_{i=1}^{m}S_{a_i}\right|+\cdots+(-1)^{n-1}|S_1\cap\cdots\cap S_n|
\end{aligned}
$$

e.g. 5个人排列, A不在排头, B不在排尾, AB不相邻
- AB分别在 排头排尾: $A_3^3$
- A在排头: $4\cdot A_3^3$
- B在排尾: $4\cdot A_3^3$
综合: $A_5^5-2\cdot 4\cdot A_3^3+A_3^3=13\cdot A_3^3=78$
- AB相邻: 3种情况(AB在中间+A在排尾+B在排头)
  AB在中间: $2\cdot A_2^2$
综合: $A_5^5-2\cdot 4\cdot A_3^3+A_3^3-2\cdot A_2^2-2=72$

## Catalan

[浅谈 Catalan 数](http://localhost:4000/%E6%B5%85%E8%B0%88-Catalan-%E6%95%B0/)

## 错位排列

### 定义

对于 $n$ 个元素, 其中 $a_i$ 不在 第 $i$ 位(原位)  

### 解法

考虑容斥原理, 设 $S_i$ 为 i 在原位的情况  
$D_n=n!-|\cup_{i=1}^{n} S_i|$

首先是 $\sum|S_i|$ 随便挑一个数固定, 剩下数任意排, $\sum|S_i|=\binom{n}{1}\cdot (n-1)!$  
然后是 $\sum|S_i\cap S_j|$ 显然, $\sum|S_i\cap S_j|=\binom{n}{2}\cdot (n-2)!$  
最后是 $\sum|S_{i_1}\cap \cdots \cap S_{i_k}|=\binom{n}{k}\cdot (n-k)!=\frac{n!}{k!}$

那么原式就是
$$
\begin{split}
D_n&=n!-\sum|S_i|+\sum|S_i\cap S_j|-\cdots+(-1)^n\sum|S_{i_1}\cap \cdots \cap S_{i_n}|\\
&=n!-n!+\cdots+(-1)^n\frac{n!}{n!}\\
&=n!\cdot(1-\frac{1}{1!}+\frac{1}{2!}-\cdots+\frac{1}{3!}+\cdots+(-1)^n\frac{1}{n!}) 
\end{split}
$$

## 第二类 Stirling 数

### 定义

$S(n,k)$ 表示将 $n$ 个元素划分为 $k$ 个无序(不可辨认)非空盒子里面的方法数  

{% note info modern %}  
$S(n,1)=S(n,n)=1, n\geq 1$
{% endnote %}  

考虑分治  
首先考虑第 $1$ 个元素
- 单独分入一个盒子: $S(n-1,k-1)$
- 否则与其他一起分入盒子(随机选择): $k\cdot S(n-1,k)$
综合: $S(n,k)=S(n-1,k-1)+k\cdot S(n-1,k)$

## 计数技巧

### 列方程

在有多重方法求得解(方程)时, 列出 $k$ 个方程, 直至问题可解

e.g 一颗二叉树中 $7$ 个节点有 $2$ 个儿子, 求有多少叶子节点?
考虑二叉树的性质 $S_i$ 为 有 $i$ 个儿子的节点数  

那么可以列出以下方程: 
- 从构成角度出发: $S=S_0+S_1+S_2$
- 从贡献角度出发: $S=1+S_1+2\cdot S_2$

解这两个方程得 $S_0=S_2+1$

{% hideToggle 扩展 %}
$$
\begin{cases}
S=S_0+S_1+\cdots+S_k\\
S=1+S_1+2\cdot S_2+3\cdot S_3+\cdots+k\cdot S_k
\end{cases}
$$
$$
S_0=S_2+2\cdot S_3+\cdots+(k-1)\cdot S_k+1
$$
{% endhideToggle %}