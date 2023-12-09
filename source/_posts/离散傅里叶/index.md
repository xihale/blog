---
title: 离散傅里叶
tags:
  - [learn]
category:
  - [算法]
katex:
  enable: true
date: 2023-09-23 19:06:49
---

## 前言

本文仅作为简单的离散傅里叶的简单推导

## 点值表示法

设 $f(x)=\sum a_ix^i$  
如何快速计算卷积?  

下面的证明写得不好, 只是简单写写...

考虑将这个多项式用点值表示
$$
\{v_i, f(v_i)\}
$$
只需要证明这种表示方法是 充分必要 的

感性证明: 多项式函数由 $n-1$ 个方程即可 充分必要 地表示  
我们带值其实就是列了 $n-1$ 个系数方程, 最终可以求出 $n$ 个系数

那么 $\{v_i, f(v_i)\cdot g(v_i)\}$ 可以反推回 $f\ast g$ 吗?  

其实就是要证明 $f(v_i)\cdot g(v_i)=(f\ast g)(v_i)$
走到这一步其实就呼之欲出了, $AB=C$ 这种结构的多项式计算, 分开来先算 $A$ 和 $B$ 或者是直接算 $C$ 不只有顺序的区别吗?

## 快速求点值

考虑分治  
这里需要一些符合分治的特殊性质  

考虑 复数域 的 单位根

### 单位根定义

$$
w_n^k=\cos\frac{2\pi k}{n}+i \sin\frac{2\pi k}{n}(=e^{\frac{2\pi ki}{n}})
$$

考虑到大多数人应该都没有接触过 欧拉 用 $e$ 来表示的单位根(一个经典的应用是 $e^{\pi i}+1=0$), 并且三角函数表示比较简单易懂, 以下全部使用三角函数表示法证明

{% note info modern %}
为了防止混淆, 上下标不用 $i$ 表示, 以下的 $i$ 的定义为 $i^2=-1$
{% endnote %}

首先我们的目标是求:
$$
\{f(w_n^k)\}
$$

对于
$$
f(x)=a_0+a_1x^1+\cdots +a_nx^n
$$
{% note info modern %}
为了分治的方便起见, $\log_2 n\in \mathbb{N}^+$

{% endnote %}

### 左右直接拆分

先考虑暴力拆分

$$
\begin{split}
f(x)&=(a_0+\cdots+a_{\frac{n}{2}-1}x^{
\frac{n}{2}-1})+(a_{\frac{n}{2}}x^{\frac{n}{2}}+\cdots a_nx^n)\\
&=(a_0+\cdots+a_{\frac{n}{2}-1}x^{
\frac{n}{2}-1})+x^{\frac{n}{2}}(a_{\frac{n}{2}}x^{0}+\cdots a_nx^{\frac{n}{2}-1})
\end{split}
$$

{% note info modern %}
想不出此处的 $x^{\frac{n}{2}}$ 该叫什么好, 便叫他 转移系数 啦
{% endnote %}
不难看出, 此处附带的转移系数是 $x^{\frac{n}{2}}$
每个转移阶段都不一样, 不方便!

#### 积偶拆分
考虑更方便的做法(使转移系数恒定为 $x$) 
不难发现积偶数是隔一个元素出现一次的, 很好地满足了这个性质

设 
$$
\begin{split}
F(x^2)&=a_0+a_2x^2+\cdots+a_nx^n\\
G(x^2)&=a_1+a_3x^2+\cdots+a_nx^n
\end{split}
$$
至于为什么传入的是 $x^2$, 是为了方便, 更多的思考, 请自行斟酌  

有
$$
f(x)=F(x^2)+xG(x^2)
$$

那么有

$$
f(w_n^k)=F(w_n^{2k})+w_n^k G(w_n^{2k})
$$

单位根是处在一个圆上的, 不难发现, 圆上下对应了的值是完全相反的, 如何利用这一点来求值?(此处以中心对称出发)
考虑 $w_n^{k+\frac{n}{2}}$  
有
$$
f(w_n^{k+\frac{n}{2}})=F(w_n^{2k+n})+w_n^{k+\frac{n}{2}} G(w_n^{2k+n})
$$

统一下形式

首先研究 $w_n^k$ 与 $w_n^{k+\frac{n}{2}}$ 的关系
$$
\begin{split}
w_n^{k+\frac{n}{2}}&=\cos\frac{2\pi (k+\frac{n}{2})}{n}+i \sin\frac{2\pi (k+\frac{n}{2})}{n}\\
&=\cos(\frac{2\pi k}{n}+\pi)+i \sin(\frac{2\pi k}{n}+\pi)\\
&=-\cos\frac{2\pi k}{n}-i \sin\frac{2\pi k}{n}\\
&=-w_n^k
\end{split}
$$

然后研究 $w_n^{2k+n}$ 如何转化为 只缩小 $n$ (进行分治) 的结果
$$
\begin{split}
w_n^{2k+n}&=\cos\frac{2\pi (2k+n)}{n}+i \sin\frac{2\pi (2k+n)}{n}\\
&=\cos\frac{2\pi k}{\frac{n}{2}}+i \sin\frac{2\pi k}{\frac{n}{2}}\\
&=w_{\frac{n}{2}}^{k}
\end{split}
$$

恭喜! 成功统一了结构!  
有
$$
\begin{split}
f(w_n^k)&=F(w_{\frac{n}{2}}^{k})+w_n^k G(w_{\frac{n}{2}}^{k})\\
f(w_n^{k+\frac{n}{2}})&=F(w_{\frac{n}{2}}^{k})-w_n^k G(w_{\frac{n}{2}}^{k})
\end{split}
$$
这下算出 $F, G$ 可以用两次了!
此单步的时间复杂度是: $T(n)=2T(\frac{n}{2})+1=O(\log_2 n)$