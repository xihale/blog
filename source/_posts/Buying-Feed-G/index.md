---
title: Buying Feed G
date: 2023-08-20 16:40:28
tags: learn competition
katex:
  enable: true
---

# Preface
Click to go: [Buying Feed G](https://www.luogu.com.cn/problem/P4544)

# Problem
{% hideToggle 题目描述 %}

约翰开车来到镇上，他要带$K$吨饲料回家。运送饲料是需要花钱的，如果他的车上有$X$吨饲料，每公里就要花费$X^2$元，开车D公里就需要$D\times  X^2$元。约翰可以从$N$家商店购买饲料，所有商店都在一个坐标轴上，第$i$家店的位置是$X_i$，饲料的售价为每吨$C_i$元，库存为$F_i$。

约翰从坐标$X=0$开始沿坐标轴正方向前进，他家在坐标$X=E$上。为了带$K$吨饲料回家，约翰最少的花费是多少呢？假设所有商店的库存之和不会少于$K$。

举个例子，假设有三家商店，情况如下所示：

|坐标|$X=1$|$X=3$|$X=4$|$E=5$|
|:-:|:-:|:-:|:-:|:-:|
|库存|$1$|$1$|$1$|
|售价|$1$|$2$|$2$|

如果$K=2$，约翰的最优选择是在离家较近的两家商店购买饲料，则花在路上的钱是$1+4=5$，花在商店的钱是$2+2=4$，共需要$9$元。

## 输入格式

第$1$行:三个整数$K,E,N$ 第$2..N+1$行:第$i+1$行的三个整数代表,$X_i,F_i,C_i$.

## 输出格式

一个整数,代表最小花费

## 样例 #1

### 样例输入 #1

```
2 5 3
3 1 2
4 1 2
1 1 1
```

### 样例输出 #1

```
9
```

## 提示

$1 \leq K \leq 10000 , 1 \leq E \leq 500 , 1 \leq N \leq 500$

$0 < Xi < E, 1 \leq Fi \leq 10000, 1 \leq C_i \leq 10^7$
{% endhideToggle %}

# Solution
首先是输入顺序问题, 加个排序即可

## 分析转移方程
这里一维不好处理(有好多量)  
所以我们用二维  

我们用 $i,j$ 分别表示 到达第 $i$ 个商店时拥有 $j$ 吨饲料数量最优解  
$f_{i,j}=min\{f_{i-1,k}+k^2\cdot \Delta x+(j-k)\cdot C\}$

时间复杂度: 枚举 $i,j,k$ 即 $O(N^3)=O(1.25e8)$

## 单调队列优化
复杂度明显超了, 考虑优化  
我们首先要进行参数分离, 把右边关于 $i$ 的全部移出来, 方便维护单调队列(~~不然就是斜率优化了~~)

$f_{i,j}=min\{f_{i-1,k}+k^2\cdot \Delta x-k\cdot C\}+j\cdot C$  
这下清净了, 直接套模板维护 $min$ 即可

## 其他
不难看出, 转移总是从 $i-1\to i$ 可以状态压缩  
具体实现方法:

用 `MonoQue` 顶点更新: $f_{i,q.top()}$  
然后把 $j$ 插入供下一层 $j$ 使用即可  

其他细节看代码了...

## 具体实现 

```cpp
#include <cstring>
#include <iostream>
#include <algorithm>

using namespace std;

constexpr int kMax=1e4+15, Max=5e2+15;

typedef long long ll;
ll dp[Max][kMax];
struct Point{
  ll x, w, v;
  bool operator<(const Point& rhs) const{
    return x<rhs.x;
  }
}p[Max];

class MonoQue{
private:
  int a[kMax<<1];
  int head, tail;
public:
  void clear(){ head=tail=0; }
  bool empty(){ return head==tail; }
  void pop(){ ++head; }
  void pop_back(){ --tail; }
  int back(){ return a[tail-1]; }
  int top(){ return a[head]; }
  void push(int x){ a[tail++]=x; }
}q;

int main(){
  
  ll k,e,n,i,j;
  ll M=0;
  cin>>k>>e>>n;

  p[0]={0,0,0};
  for(int i=1;i<=n;++i)
    cin>>p[i].x>>p[i].w>>p[i].v;
  p[n+1]={e,0,0};
  sort(p,p+n+2);

  auto calc=[&i](int k){
    return dp[i-1][k]+k*k*(p[i].x-p[i-1].x)-k*p[i].v;
  };
  memset(dp, 0x3f, sizeof dp); // 带 min 运算, 设初值
  dp[0][0]=0;

  // 单调队列, 在开始第 i 的 j 轮前传入 i-1 的第 j 轮
  for(i=1;i<=n+1;++i){
    q.clear();
    M=min(k, M+p[i].w);
    for(j=0;j<=M;++j){ // j=0 传入一个空值, 避免特判
      while(!q.empty() and j-q.top()>p[i].w)
        q.pop();
      auto V=calc(j);
      while(!q.empty() and calc(q.back())>=V)
        q.pop_back();
      q.push(j);
      dp[i][j]=calc(q.top())+j*p[i].v; // 必定有值 
    }
  }
  cout<<dp[n+1][k]<<'\n';

  return 0;
}
```
