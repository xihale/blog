---
title: sudoku
tags:
  - [learn]
category:
  - [算法]
katex:
  enable: true
date: 2023-08-30 10:14:10
---

## Preface

使用了 `dancing links` 算法, 算法讲义请参考 {% post_link dancing-links %}  
以下默认大家已经会 `dancing links` 了

## Start up

~~其实 `dancing links` 最难就是数学建模了~~

首先我们列举出数独的规则
1. 每一行有且只有一次 $[1,9]$
2. 每一列有且只有一次 $[1,9]$
3. 每一块(宫)有且只有一次 $[1,9]$

还有个隐藏规则
4. 不能有空位, 每一个位置都得有数(~~真是不显然的显然呢~~)

然后我们考虑将这些规则转化为一个枚举矩阵, 每一行代表一个状态(一个格子中的状态), 那么最终取 `81` 格子即可生成答案

类似于 `dp` 的 状态压缩, 我们将每个状态用一串 `01` 串表示, `1` 则代表选择这个状态, 那么题目的规则就可以抽象为 `r` 行 `c` 列的 枚举矩阵, 最终答案就是找到 `1` 个有 `81` 行且满足精确覆盖的最终矩阵

我们用行来表示一个格子的状态, 则需要 $O(9*9*9)=O(729)$ 的空间  
{% note info modern %}
解释: 因为是 `01` 枚举矩阵, 当然, 每个格子应该有 `9` 个状态: $[1,9]$  
当然有些状态题目给了, 他们只占用 $O(1)$
{% endnote %}
列则简单, 直接将四个规则填充进去即可, 需要 $\Theta(9*9*4)=\Theta(324)$ 的空间

具体实现: 首先枚举每一行的 `pos`(正如上面所讲的, `pos` 需要包含的信息是 `行,列,值`)
{% note info modern %}
因为这些值的范围都是 $[1,9]$ 我们直接以 $x*9+y$ 来存储多个信息即可
{% endnote %}

{% note info modern %}
我的坐标是从 $0$ 开始的
{% endnote %}

这里提一下 `position` 这块得额外 `+1`, 否则就会出现第 $81$ 列的 `siz` 始终为 $0$ 的情况, 不方便后续程序处理, 所以我们后移一位, 从 $1$ 出发(不过别忘了这是为了占位而$+1$, 生成答案时要减去!)  
枚举 块(宫) 那里可能得自己理解一下, 他的基本数学算子是: $(\lfloor{\frac{r}{3}}\rfloor*9+\lfloor{\frac{c}{3}}\rfloor)*9+v$ (毕竟只有 $9$ 个块(宫), 只需要跟前面一样的空间就可以啦)

```cpp
int pos=r*81+c*9+v;
_insert(pos, r*9+v); // value in col
_insert(pos, 81*1+c*9+v); // value in row
_insert(pos, 81*2+r/3*27+c/3*9+v); // value in block
_insert(pos, 81*3+r*9+c+1); // position 
```

## Code

```cpp
#include <cstdlib>
#include <iostream>

using namespace std;

int ans[9][9];

class DancingLinks{
private:
  static constexpr int Max=2916+6, ansMax=9*9+6; // 4 "1" in every line
  struct node{
    int u,d,l,r;
  }nd[Max];
  int first[Max], siz[Max], col[Max], cnt=0;
  // record the ans
  int row[Max], stk[ansMax];

  void remove(const int &c){ // 删除第 c 列(自然地, 会删除相关行) 注意保持当前列的状态以便恢复 (这里的删除不是求解, 而是删除冲突)
    nd[nd[c].l].r=nd[c].r, nd[nd[c].r].l=nd[c].l; // 暂时移除
    for(int u=nd[c].d;u!=c;u=nd[u].d) // 枚举行
    for(int v=nd[u].l;v!=u;v=nd[v].l) // 枚举列
      nd[nd[v].d].u=nd[v].u, nd[nd[v].u].d=nd[v].d, --siz[col[v]];
  }
  void recover(const int &c){
    nd[nd[c].l].r=nd[nd[c].r].l=c;
    for(int u=nd[c].d;u!=c;u=nd[u].d) // 枚举行
    for(int v=nd[u].l;v!=u;v=nd[v].l) // 枚举列
      nd[nd[v].d].u=nd[nd[v].u].d=v, ++siz[col[v]];
  }
  void _insert(const int &r, const int &c){ // 简单插入
    col[++cnt]=c, row[cnt]=r, ++siz[c];
    nd[cnt].d=nd[c].d, nd[nd[c].d].u=cnt, nd[c].d=cnt, nd[cnt].u=c; // up and down
    if(!first[r]) first[r]=nd[cnt].l=nd[cnt].r=cnt;
    else{
      nd[cnt].l=nd[first[r]].l, nd[cnt].r=first[r]; // self
      nd[first[r]].l=cnt; // right
      first[r]=cnt;
      // nd[cnt].r=nd[first[r]].r, nd[nd[first[r]].r].l=cnt;
      // nd[cnt].l=first[r], nd[first[r]].r=cnt;
    }

  }

public:
  static constexpr int r=729, c=324;
  void build(){
    for(int i=0;i<=c;++i)
      nd[i]={i,i,i-1,i+1};
    nd[0].l=c, nd[(cnt=c)].r=0;
  }
  
  void insert(const int &r, const int &c, const int &v){ // 插入
    int pos=r*81+c*9+v;
    _insert(pos, r*9+v); // value in col
    _insert(pos, 81*1+c*9+v); // value in row
    _insert(pos, 81*2+r/3*27+c/3*9+v); // value in block
    _insert(pos, 81*3+r*9+c+1); // position 为了占位而加一, 生成答案时要减去!
  }

  void solve(const int &dep){
    int u=nd[0].l, v, c=u;
    if(!u){
      for(int i=1;i<dep;++i)
        ans[(stk[i]-1)/81][(stk[i]-1)/9%9]=(stk[i]-1)%9+1;
      for(int i=0;i<9;++i, cout.put('\n'))
        for(int j=0;j<9;++j)
          cout<<ans[i][j]<<" ";
      exit(0);
    }
    while(u){
      if(siz[c]>siz[u]) c=u;
      u=nd[u].l;
    } // 启发? 当前列 冲突较少

    // 枚举当且列下可行的行
    // 先将当前列删除, 以递归求解
    remove(c);
    for(u=nd[c].d;u!=c;u=nd[u].d){
      stk[dep]=row[u]; // record ans
      for(v=nd[u].l;v!=u;v=nd[v].l) remove(col[v]);
      solve(dep+1);
      for(v=nd[u].l;v!=u;v=nd[v].l) recover(col[v]);
    }
    recover(c);
  }
}dlx;

int main(){
  dlx.build();

  for(int i=0;i<9;++i) for(int j=0;j<9;++j){
    cin>>ans[i][j];
    if(!ans[i][j]) for(int k=1;k<=9;++k) dlx.insert(i, j, k);
    else dlx.insert(i, j, ans[i][j]);
  }

  dlx.solve(1);

  return 0;
}
```