---
title: 炮兵阵地
date: 2023-08-25 09:45:03
tags: 
  - dp
  - optimize
category: OI
katex:
  enable: true
---

## 推导
### dp
因为他的炮击范围有点长(两个格子, 横跨两行)
所以得用 $i$ 表示当前行, $j$ 表示当前行的状态, $k$ 表示 `i-1`行的状态, $l$ 表示 `i-2`行的状态  

{% note info modern %}  
`getSta`: 获取二进制状态中 `1` 的数量
{% endnote %}  
那么转移方程就是: $dp_{i,j,k}=max\{dp_{i-1,k,l}+getSta(j)\}$

## 实现
我没有使用其他题解的 枚举+剪枝 的方法, 而是直向着可行方案走  
~~应该是状态压缩中比较优的了(482ms): [Record](https://www.luogu.com.cn/record/122642808)~~  

{% note info modern %}  
`~`: 取反码  
如果需要删除第 `k+1` 位那么只需要 `x&~(1<<k)`  
{% endnote %}  

### 变量说明
{% note info modern %}  
`je[]`: judge 相当于压缩后的地图  
`je`: judge 相当于压缩后的一行  
{% endnote %}  

### 寻找下一状态
```cpp
// 当没有下一种状态时返回 false 否则 返回 true 以及修改 sta 为最新状态
bool getNextSta(u_int16_t &sta, const u_int16_t &je){
  // 首先从右到左找到当前状态第一个炮台 
  u_int16_t low=lowbit(sta);
  // 此处如果 sta 等于 0 那么就是从 最左边 尝试插入(查找第一个状态)
  // 否则从最右边节点的右3格开始尝试插入
  u_int16_t lowB=!sta?(1<<(m-1)):low>>3;
  // try addition - 尝试在它右边添加一个炮台
  // 找到它右边2格外的平原
  while(lowB and !(lowB&je) ) lowB>>=1;
  if(lowB) return sta|=lowB; // true
  // try movement - 添加炮台尝试失败, 把它向右移动
  do{
    // 首先删除当前这个炮台, 并把当前炮台向右移动一格, 尝试插入 
    sta&=~low, low>>=1;
    while(low and !(low&je) ) low>>=1;
    // 可以转移到 low 直接转移 
    if(low) return sta|=low; // true
    low=lowbit(sta); // 寻找下一个可移动的
  }while(low);
  return false;
}
```

### 开始 dp

接下来就简单了, 跟其他题解差不了多少  

首先推导转移方程  
当前行的状态需要上两行的状态进行 judge  
当然, 第一行得初始化  

~~代码短, 但是有点复杂, 看不懂带入数据在脑子里跑一下~~

```cpp
u_int16_t x=0;
u_int16_t ans=0;
while(getNextSta(x, je[0]))
  ans=max(ans, dp[0][x][0]=getSta(x)); 

for(int i=1;i<n;++i){
  u_int16_t sta=0;
  // 换成 do 规避 judge=0 问题
  do{
    u_int16_t x1=0;
    do{
      if(sta&x1) continue;
      u_int16_t x2=0;
      do{
        if(!(x1&x2||sta&x2))
          ans=max(ans, dp[i&1][sta][x1]=max(dp[i&1][sta][x1], dp[!(i&1)][x1][x2]+getSta(sta)));
      }while(getNextSta(x2, je[i-2]));
    }while(getNextSta(x1, je[i-1]));
  }while(getNextSta(sta, je[i]));
}
```

## 完整代码
```cpp
#include <iostream>
#include <bitset>
#include <sys/types.h>

using std::cin, std::cout, std::max;

constexpr int nMax=103, mMax=10, staMax=1<<mMax;

int dp[2][staMax][staMax];
u_int16_t je[nMax];
u_int8_t Sta[staMax];
int n,m;

inline u_int16_t lowbit(const u_int16_t &x){return x&-x;}
bool getNextSta(u_int16_t &sta, const u_int16_t &je){
  u_int16_t low=lowbit(sta), lowB=!sta?(1<<(m-1)):low>>3;
  // try addition
  while(lowB and !(lowB&je) ) lowB>>=1;
  if(lowB) return sta|=lowB; // true
  // try movement
  do{
    sta&=~low, low>>=1;
    while(low and !(low&je) ) low>>=1;
    if(low) return sta|=low;
    low=lowbit(sta);
  }while(low);
  return false;
}

u_int8_t getSta(u_int16_t sta){
  if(Sta[sta]) return Sta[sta];
  u_int8_t cnt=0;
  auto s=sta;
  while(s) s&=~lowbit(s), ++cnt;
  return Sta[sta]=cnt;
}

int main(){

  std::ios::sync_with_stdio(false);
  cin.tie(nullptr), cout.tie(nullptr);
  
  cin>>n>>m;
  char ch;
  for(int i=0;i<n;i++)
    for(int j=0;j<m;j++)
      cin>>ch, je[i]|=(ch=='P')?(1<<(m-j-1)):0;

  u_int16_t x=0;
  u_int16_t ans=0;
  while(getNextSta(x, je[0]))
    ans=max(ans, dp[0][x][0]=getSta(x));

  for(int i=1;i<n;++i){
    u_int16_t sta=0;
    // 换成 do 规避 judge=0 问题
    do{
      u_int16_t x1=0;
      do{
        if(sta&x1) continue;
        u_int16_t x2=0;
        do{
          if(!(x1&x2||sta&x2))
            ans=max(ans, dp[i&1][sta][x1]=max(dp[i&1][sta][x1], dp[!(i&1)][x1][x2]+getSta(sta)));
        }while(getNextSta(x2, je[i-2]));
      }while(getNextSta(x1, je[i-1]));
    }while(getNextSta(sta, je[i]));
  }

  cout<<ans<<'\n';

  return 0;
}

```