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