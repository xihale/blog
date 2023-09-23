---
title: 初等数论
tags:
  - learn
  - elementary
category:
  - OI
  - math
katex:
  enable: true
date: 2023-09-23 18:45:47
---

## 初等数论的魔力

初等数论以接近纯粹理性的思考(同时又可以与现实挂钩)使我深深沉醉

### 欧拉线性筛

这是普通筛法的改良版本, 可以保证筛且仅筛一次

{% note info modern %}
设 $a=\Pi p_i^{q_i}, p_i<p_{i+1}$
核心就是遍历素数表的时候, 一旦搜索到 $p_0$ (最小的那个组成素数) 就退出
{% endnote %}

#### 伪代码

```python
for i in range(2,n):
  if not_prime[i]:
    primes.push(i)
  for j in prime:
    not_prime[i*j]=true
    if i%j==0:
      break
```

#### 举例说明
~~我所想到的证明方法都太复杂(或者说属实是 abstract )所以不写出来了~~
let $i=2\cdot 3\cdot 5$
首先我们考虑搜索的顺序, 根据筛法, 不难得出 $i$ 的推导过程是 $5\Rightarrow3\cdot 5\Rightarrow 2\cdot 3\cdot 5$(省略了 $2\cdot 5$ 等一系列中间的无关过程)
假如现在搜索到了 $2$ 但是没有退出
那么下一个元素就是 $next=2\cdot 3^2\cdot 5$
但是其实 $3^2\cdot 5$ 已经在前面一步搜索过了(由 $3\cdot 5$ 推导出), 也就是说目前这个 $next$ 其实是重复的(由 $3^2\cdot 5$ 推导出)!

也就是说, 搜索到最小的 $p_0$ 其实就没有必要继续搜索了

