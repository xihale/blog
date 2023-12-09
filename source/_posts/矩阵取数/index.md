---
title: 矩阵取数
date: 2023-08-26 15:18:11
tags: 
  - [interregional]
  - [dp]
  - [learn]
category:
  - [算法]
katex:
  enable: true
---

## Preface

这是一道独特的 dp 题

## Start up

读题其实还是可以联想到 `区间dp` 的(~~我一直没想到~~)  
但是, 显而易见, 这和平常打的 `区间dp` 有点不同  

分析题面可知, 他的状态转移是从边缘到中间的, 这点就和 平常的 `区间dp` 合并子区间 不一样  
~~但毕竟还是区间问题, 除了 `区间dp` 好像也没有什么其他办法, 就只能从这里下手了...~~

那状态就很简单 $dp_{l,r}$

剩下就是如何转移的问题了

目前在 $dp_{l,r}$, 为了方便, 我们思考如何转移到这  
~~并没有区间合并的操作~~
根据题意, 我可以从左边选一块, 也可以从右边选一块, 取最大值即可  

如此这般, 方程就出来了 $dp_{l,r}=\max \{dp_{l-1,r}+a_{l-1}\cdot 2^t, dp_{l,r+1}+a_{r+1}\cdot 2^t\}$  
此时, $t$ 为当前状态的取数次数  

{% note info modern %}
这里使用 __int128  
在 移位的时候别直接用 $a[]$, 用 __128(1) 移位再乘是最省事的(~~不然就得处理输入事件了~~)  
{% endnote %}

## Code

```cpp
#include <iostream>
#include <cstring>

using namespace std;

constexpr int Max=82, len=39; // 128*log10(2)+1

int n,m;
__int128 ans=0, _1=1;
__int128 dp[Max][Max];
int a[Max];

void solve(){

  for(int i=1;i<=m;++i)
    cin>>a[i];

  memset(dp, 0, sizeof(dp));
  for(int siz=m-2;siz>=0;--siz){
    for(int l=1;l+siz<=m;++l){
      int r=l+siz;
      dp[l][r]=max(dp[l-1][r]+(a[l-1]*_1<<(m-siz-1)),dp[l][r+1]+(a[r+1]*_1<<(m-siz-1)));
    }
  }
  
  __int128 Ans=0;
  for(int i=1;i<=m;++i)
    Ans=max(Ans, dp[i][i]+(a[i]*_1<<(m)));
  ans+=Ans;

}

int main(){

  cin>>n>>m;
  for(int i=0;i<n;++i) solve();

  static char str[len], p=0;
  while(ans)
    str[++p]=ans%10+'0', ans/=10;
  if(p==0) str[++p]='0';
  for(int i=p;i>=1;--i) cout<<str[i];
  cout<<'\n';

  return 0;
}
```
