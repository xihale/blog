---
title: 浅谈斜率优化
date: 2023-08-24 09:43:41
tags: 
  - learn
  - dp
  - optimize
category: oi
katex:
  enable: true
---

## Start up

斜率优化就是 将无法分离的参数 转化为斜率进行单调队列优化  

{% note info modern %}  
假设现在题目要求最小值  
{% endnote %}  

直白点, 就是 $f_i=min\{Y_j-K_iX_j\}+\Delta$  
{% note info modern %}  
先不要理会变量名称  
下标的意思是含有的有关参数(就是要传入, 参与计算/推导的参数)  
$comp$ 函数内带有有关 i 的变量, 并且他和 有关 $j$ 的变量混合在一起, 无法使用常规方法
{% endnote %}

但是不难发现, 假设现在来推导单调队列中的更优解  
设 $j$ 为对头, $k$ 为 $j$ 下一个元素  
排除队头:
$$
\begin{split}
Y_j-K_iX_j &\geq Y_k-K_iX_k \\
K_i(X_k-X_j) &\geq Y_k-Y_j\\
K_i &\geq \frac{Y_k-Y_j}{X_k-X_j}
\end{split}
$$

推导出的不等式跟 $K_i$ 有关  

队尾:  
如果把每个单调队列中的状态看作一个点的话, 用 凸包 的思想 维护  
因为只有上/下凸壳上的点才能取到更优的 $K_i$, 参照排除队头的推导式不难看出  

## Example

{% hideToggle <a href="https://www.luogu.com.cn/problem/P3628" target="_blank">特别行动队 - luogu</a> %}

## 题目描述

你有一支由 $n$ 名预备役士兵组成的部队，士兵从 $1$ 到 $n$ 编号，你要将他们拆分成若干特别行动队调入战场。出于默契的考虑，同一支特别行动队中队员的编号**应该连续**，即为形如 $(i, i + 1, \cdots i + k)$的序列。所有的队员都应该属于且仅属于一支特别行动队。

编号为 $i$ 的士兵的初始战斗力为 $x_i$ ，一支特别行动队的初始战斗力 $X$ 为队内士兵初始战斗力之和，即 $X = x_i + x_{i+1} + \cdots + x_{i+k}$。

通过长期的观察，你总结出对于一支初始战斗力为 $X$ 的特别行动队，其修正战斗力 $X'= aX^2+bX+c$，其中 $a,~b,~c$ 是已知的系数（$a < 0$）。 作为部队统帅，现在你要为这支部队进行编队，使得所有特别行动队的修正战斗力之和最大。试求出这个最大和。

## 输入格式

输入的第一行是一个整数 $n$，代表士兵的人数。

输入的第二行有三个用空格隔开的整数，依次代表 $a,~b,~c$，即修正战斗力的系数。

输入的第三行有 $n$ 个用空格隔开的整数，第 $i$ 个整数代表编号为 $i$ 的士兵的初始战斗力 $x_i$。

## 输出格式

输出一行一个整数，代表最大的所有特别行动队战斗力之和。

## 样例 #1

### 样例输入 #1

```
4 
-1 10 -20 
2 2 3 4
```

### 样例输出 #1

```
9
```

## 提示

#### 样例输入输出 $1$ 解释

你有 $4$ 名士兵，$x_1 = 2,~x_2 = 2,~x_3 = 3,~x_4=4$。修正战斗力公式中的参数为  $a = -1,~b = 10,~c = -20$。

此时，最佳方案是将士兵组成 $3$ 个特别行动队：第一队包含士兵 $1$ 和士兵 $2$，第二队包含士兵 $3$，第三队包含士兵 $4$。特别行动队的初始战斗力分别为 $4,~3,~4$，修正后的战斗力分别为 $-4^2 + 10 \times 4 -20 = 4$，$-3^2 + 10 \times 3 - 20 = 1$，$-4^2 + 10 \times 4 -20 = 4$。修正后的战斗力和为 $4 + 1 + 4 = 9$，没有其它方案能使修正后的战斗力和更大。

#### 数据范围与约定

对于 $20\%$ 的数据，$n \leq 10^3$。

对于 $50\%$ 的数据，$n \leq 10^4$

对于 $100\%$ 的数据，$1 \leq n \leq 10^6$，$-5 \leq a \leq -1$，$-10^7 \leq b \leq 10^7$，$-10^7 \leq c \leq 10^7$，$1 \leq x_i \leq 100$。

{% endhideToggle %}

## Important

1. 思路主要在推式子, 推出式子后只需要推导下如何弹出 队头队尾 即可完成  
2. 如果要转除法为乘法, 注意乘负数后要变号以及乘法后的溢出问题  

## Code

```cpp
#include <iostream>
#include <limits>

using namespace std;

constexpr int Max=1e6+6;

typedef long long ll;

int q[Max], tail=0, head=1;
ll s[Max], f[Max];

ll sqr(const ll &x){ return x*x; }

int main(){

  int n,a,b,c;
  cin>>n>>a>>b>>c;

  for(int i=1;i<=n;++i)
    cin>>s[i], s[i]+=s[i-1];

  auto dy=[&a,&b,&c](const int &x, const int &y){
    return f[x]+a*s[x]*s[x]-b*s[x]+c-(f[y]+a*s[y]*s[y]-b*s[y]+c);
  };
  auto dx=[&a](const int &x, const int &y){
    return 2*a*(s[x]-s[y]);
  };

  q[++tail]=0;
  for(int i=1;i<=n;++i){
    // 乘负数*1
    while(head<tail and s[i]*dx(q[head], q[head+1])>=dy(q[head], q[head+1])) ++head;
    auto const &j=q[head];
    f[i]=f[j]+a*sqr(s[i]-s[j])+b*(s[i]-s[j])+c;
    // 乘负数*2
    while(head<tail and dy(q[tail-1], q[tail])*dx(q[tail], i)>=dy(q[tail], i)*dx(q[tail-1], q[tail])) --tail;
    q[++tail]=i;
  }
  cout<<f[n]<<'\n';

  return 0;
}
```
