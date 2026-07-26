---
title: "斐波那契：矩阵快速幂、通项与扩域"
pubDate: "2026-07-25"
description: "从递推矩阵出发，整理斐波那契的 O(log n) 求法：矩阵快速幂、对角化通项公式，以及用扩域做精确整数运算。"
tags: ["技术"]
draft: false
math: true
---

平凡的，我们有斐波那契数列：

$$
F_0 = 0,\quad F_1 = 1,\quad F_{n+1} = F_n + F_{n-1}\ (n \ge 1)
$$

## 递推的矩阵形式

$$
\begin{pmatrix} F_{n+1} \\ F_n \end{pmatrix}
=
\begin{pmatrix} 1 & 1 \\ 1 & 0 \end{pmatrix}
\begin{pmatrix} F_n \\ F_{n-1} \end{pmatrix}
$$

记

$$
A =
\begin{pmatrix} 1 & 1 \\ 1 & 0 \end{pmatrix}
$$

则

$$
\begin{pmatrix} F_{n+1} \\ F_n \end{pmatrix}
=
A^n
\begin{pmatrix} F_1 \\ F_0 \end{pmatrix}
=
A^n
\begin{pmatrix} 1 \\ 0 \end{pmatrix}
$$

因此算 $F_n$ 等价于算 $A^n$ 。

## 复杂度模型

我们约定：

- 设 $M(t)$ 为两个 $t$ 位整数相乘的代价；$M$ 单调非降。
- $F_n \sim \lambda_1^n / \sqrt{5}$（$\lambda_1$ 是其中一个特征值，证明过程见后文），故 $F_n$ 的二进制位数

$$
N := \bigl\lfloor\log_2 F_n\bigr\rfloor + 1 = n\log_2\lambda_1 + O(1) = \Theta(n).
$$

- 二进制快速幂算 $g^n$（按最优左→右计数）：恰做 $\lfloor\log_2 n\rfloor$ 次平方，以及 $\mathrm{popcount}(n)-1$ 次一般乘，环乘法次数为

$$
\mu(n) := \lfloor\log_2 n\rfloor + \mathrm{popcount}(n) - 1.
$$

于是

$$
\lfloor\log_2 n\rfloor \le \mu(n) \le 2\lfloor\log_2 n\rfloor,
$$

即 $\mu(n) = \Theta(\log n)$。

- 矩阵快速幂时，中间矩阵的各元素的位数都不超过 $F_{n+1}$，与 $F_n$ 同阶位数，故其中的大整数乘按 $M(N)$ 计代价。
- 扩域法的中间量是 $Y_n = F_n\cdot 2^{n-1}$，位数

$$
N' := N + (n-1) = n(1+\log_2\lambda_1) + O(1) = \Theta(n),
$$

大整数乘按 $M(N')$ 计——与 $M(N)$ 同阶，但常数更大，位数比 $N'/N\to 2.44$（详见 §位数比的解析效应）。

## 1. 矩阵快速幂

对 $A$ 做二进制快速幂得 $A^n$，再右乘 $(1,0)^\top$，读出第二分量即 $F_n$。

$2\times 2$ 矩阵朴素乘法恰含 **$8$ 次** 元素乘法（$4$ 个点积，各 $2$ 次乘）。故整数乘次数为 $8\,\mu(n)$，总代价

$$
\Theta\bigl(8\,M(N)\,\mu(n)\bigr) = \Theta\bigl(M(N)\log n\bigr).
$$

这是最直接的精确 $O(\log n)$ 次环运算算法。

## 2. 特征值与对角化

目标是把 $A$ 对角化成 $A = PDP^{-1}$，得到

$$
A^n = (PDP^{-1})^n = PD^n P^{-1}.
$$

因为对角阵的幂次有一条极优雅的性质：$D = \mathrm{diag}(a,b)$ 时 $D^n = \mathrm{diag}(a^n, b^n)$。
这可以极大地减轻运算负担。

### 特征方程

$$
A\vec{x} = \lambda\vec{x}
\quad\Rightarrow\quad
(A - \lambda I)\vec{x} = 0
\quad\Rightarrow\quad
\det(A - \lambda I) = 0
$$

$$
\begin{vmatrix}
1-\lambda & 1 \\
1 & -\lambda
\end{vmatrix}
= (1-\lambda)(-\lambda) - 1 = 0
$$

即

$$
\lambda^2 - \lambda - 1 = 0.
$$

解得两个特征值

$$
\lambda_1 = \frac{1+\sqrt{5}}{2},\qquad
\lambda_2 = \frac{1-\sqrt{5}}{2}.
$$

易见 $\lambda_1 > 1$，$|\lambda_2| < 1$，且 $\lambda_1 + \lambda_2 = 1$，$\lambda_1\lambda_2 = -1$，$\lambda_1 - \lambda_2 = \sqrt{5}$。

### 特征向量

由 $(A - \lambda I)\vec{x} = 0$，第二行给出 $x_1 = \lambda x_2$，取特解

$$
\vec{x}_1 =
\begin{pmatrix} \lambda_1 \\ 1 \end{pmatrix},\quad
\vec{x}_2 =
\begin{pmatrix} \lambda_2 \\ 1 \end{pmatrix}.
$$

令 $P$ 的列为这两个特征向量：

$$
P =
\begin{pmatrix}
\lambda_1 & \lambda_2 \\
1 & 1
\end{pmatrix},\quad
D =
\begin{pmatrix}
\lambda_1 & 0 \\
0 & \lambda_2
\end{pmatrix}.
$$

则 $AP = PD$，即 $A = PDP^{-1}$。

### 求逆并推出通项

$$
\det(P) = \lambda_1 - \lambda_2 = \sqrt{5},
$$

$$
P^{-1}
=
\frac{1}{\sqrt{5}}
\begin{pmatrix}
1 & -\lambda_2 \\
-1 & \lambda_1
\end{pmatrix}.
$$

于是

$$
\begin{pmatrix} F_{n+1} \\ F_n \end{pmatrix}
=
P D^n P^{-1}
\begin{pmatrix} 1 \\ 0 \end{pmatrix}.
$$

先算

$$
P^{-1}
\begin{pmatrix} 1 \\ 0 \end{pmatrix}
=
\frac{1}{\sqrt{5}}
\begin{pmatrix} 1 \\ -1 \end{pmatrix},\quad
D^n P^{-1}
\begin{pmatrix} 1 \\ 0 \end{pmatrix}
=
\frac{1}{\sqrt{5}}
\begin{pmatrix} \lambda_1^n \\ -\lambda_2^n \end{pmatrix},
$$

再左乘 $P$：

$$
\begin{pmatrix} F_{n+1} \\ F_n \end{pmatrix}
=
\frac{1}{\sqrt{5}}
\begin{pmatrix}
\lambda_1 & \lambda_2 \\
1 & 1
\end{pmatrix}
\begin{pmatrix}
\lambda_1^n \\
-\lambda_2^n
\end{pmatrix}
=
\frac{1}{\sqrt{5}}
\begin{pmatrix}
\lambda_1^{n+1} - \lambda_2^{n+1} \\
\lambda_1^n - \lambda_2^n
\end{pmatrix}.
$$

得到 **Binet 公式**（对一切整数 $n\ge 0$ 精确成立）：

$$
F_n
=
\frac{\lambda_1^n - \lambda_2^n}{\sqrt{5}}
=
\frac{1}{\sqrt{5}}
\left(
\left(\frac{1+\sqrt{5}}{2}\right)^n
-
\left(\frac{1-\sqrt{5}}{2}\right)^n
\right).
$$

### 最近整数形式

把它改写成

$$
\frac{\lambda_1^n}{\sqrt{5}} - F_n
=
\frac{\lambda_2^n}{\sqrt{5}},
$$

即

$$
\left|
\frac{\lambda_1^n}{\sqrt{5}} - F_n
\right|
=
\left|
\frac{\lambda_2^n}{\sqrt{5}}
\right|<{\frac{1}{2}}.
$$

即 $F_n$ 就是距 $\lambda_1^n/\sqrt{5}$ 的**唯一**最近整数。

### 浮点快速幂

在浮点语义下，对 $\lambda_1^n$ 做快速幂再除以 $\sqrt{5}$、四舍五入，环运算次数仍是 $\mu(n)=\Theta(\log n)$，每次是机器浮点乘——**这是有明确适用范围的精确算法**：当浮点算出的 $\widetilde{x}$ 仍落在 $(F_n-1/2,\ F_n+1/2)$ 内时，四舍五入就得到 $F_n$。

能力边界由精度决定。IEEE-754 binary64 有效位数约 $53$ bit；$\lambda_1^n / \sqrt{5}$ 的量级约为 $F_n$，相对误差一旦大到使 $\widetilde{x}$ 跨过半整数边界，四舍五入就会错。后文实测：对本机 `f64` 快速幂实现，与精确值一致到 $n \le 75$，从 $n=76$ 起失准。

因此：小 $n$ 用浮点 Binet 最省事；要任意大的精确 $F_n$，必须离开浮点，改做整数算术。下一节正是通项在整数环上的落地。

## 3. 扩域

已知 $\forall n,\ F_n \in \mathbb{Z}$，Binet 里的 $\sqrt{5}$ 最终消掉。把计算放进环 $\mathbb{Z}[\sqrt{5}]$，全程整数，就不受浮点精度限制。

设

$$
d_1 = 1 + \sqrt{5},\quad
d_2 = 1 - \sqrt{5},
$$

则 $\lambda_1 = d_1/2$，$\lambda_2 = d_2/2$，且

$$
F_n
=
\frac{1}{\sqrt{5}}
\left(
\left(\frac{d_1}{2}\right)^n
-
\left(\frac{d_2}{2}\right)^n
\right).
$$

运算法则类似复数：把 $\sqrt{5}$ 当作「虚部」单位（$\sqrt{5}^2 = 5$）。

$d_1$、$d_2$ 共轭，故类似地，存在 $X_n, Y_n \in \mathbb{Z}$ 使

$$
d_1^n = X_n + Y_n\sqrt{5},\qquad
d_2^n = X_n - Y_n\sqrt{5}.
$$

于是

$$
\lambda_1^n - \lambda_2^n
=
\frac{d_1^n - d_2^n}{2^n}
=
\frac{2 Y_n \sqrt{5}}{2^n}
=
\frac{Y_n \sqrt{5}}{2^{n-1}},
$$

$$
F_n
=
\frac{\lambda_1^n - \lambda_2^n}{\sqrt{5}}
=
\frac{Y_n}{2^{n-1}}.
$$

算法：快速幂算 $d_1^n = X_n + Y_n\sqrt{5}$，取出系数 $Y_n$，再除以 $2^{n-1}$。因 $F_n \in \mathbb{Z}$，$Y_n$ 必被 $2^{n-1}$ 整除；实现时用整数除法。

### 拓展：环乘法的整数乘次数

设 $\alpha = a + b\sqrt{5}$，$\beta = c + d\sqrt{5}$。朴素乘法

$$
\alpha\beta = (ac + 5bd) + (ad + bc)\sqrt{5}
$$

恰需 **$4$** 次整数乘。但是，我们发现用一次分配律可以利用上之前计算的 $ac$ 和 $bd$，这样可以减少一次乘法，代价是两次加法：

$$
ad + bc = (a+b)(c+d) - ac - bd,
$$

得到

$$
\alpha\beta
=
\bigl(ac + 5bd\bigr)
+
\bigl((a+b)(c+d) - ac - bd\bigr)\sqrt{5},
$$

恰需 **$3$** 次大整数乘（$ac$、$bd$、$(a+b)(c+d)$）；其中 $\times 5$ 用移位加法 $5v=(v\ll 2)+v$，不计入大整数乘。

平方更简单：

$$
(a + b\sqrt{5})^2 = (a^2 + 5b^2) + 2ab\sqrt{5},
$$

也是 **$3$** 次（$a^2$、$b^2$、$ab$）。

中间量位数是 $N'=\log_2(Y_n)=\log_2(F_n\cdot 2^{n-1})=N+n-1$，故总代价

$$
\Theta\bigl(3\,M(N')\,\mu(n)\bigr) = \Theta\bigl(M(N')\log n\bigr).
$$

与矩阵的 $\Theta\bigl(8\,M(N)\,\mu(n)\bigr)$ 同属 $\Theta(M(n)\log n)$。单看乘法次数时 $3<8$，但 $N'>N$，**乘次数优势会被更大的中间位数吃掉**——这跟乘法的效率息息相关，具体分析见下。

### 位数比的解析效应

两种算法的总代价分别是 $8\,\mu(n)\,M(N)$ 与 $3\,\mu(n)\,M(N')$。环乘次数 $\mu(n)$ 在比值中消去，关键是 $M(N')/M(N)$。**假设乘法代价是 $\alpha$-次多项式增长**：

$$
M(t) = \Theta(t^\alpha),\qquad \alpha \ge 1.
$$

则位数比的效应可以解析地写出来：

$$
\frac{M(N')}{M(N)} = \left(\frac{N'}{N}\right)^\alpha,\qquad
\frac{T_{\mathrm{ext}}}{T_{\mathrm{matrix}}} = \frac{3}{8}\left(\frac{N'}{N}\right)^\alpha.
$$

$n\to\infty$ 时求位数比的极限（$N=\log_2(F_n)+O(1)=\log_2(\lambda_1^n)+O(1)=n\log_2\lambda_1+O(1)$， $N'=n(1+\log_2\lambda_1)+O(1)$）：

$$
\frac{N'}{N} = \frac{n(1+\log_2\lambda_1)+O(1)}{n\log_2\lambda_1+O(1)} \;\xrightarrow{n\to\infty}\; \frac{1+\log_2\lambda_1}{\log_2\lambda_1} = 1 + \frac{1}{\log_2\lambda_1}\approx 2.44,
$$

故大 $n$ 极限为

$$
\boxed{\;\frac{T_{\mathrm{ext}}}{T_{\mathrm{matrix}}} \;\xrightarrow{n\to\infty}\; \frac{3}{8}\cdot 2.44^{\,\alpha}.\;}
$$

$\alpha$ 就是「乘法效率」参数：$\alpha$ 越接近 $1$，位数膨胀 $N'/N$ 的惩罚越轻，扩域的次数优势 $3<8$ 才显出来。

| $\alpha$                 | 乘法模型          | $\frac{3}{8}\cdot 2.44^{\,\alpha}$ | 谁快     |
| ------------------------ | ----------------- | ---------------------------------: | -------- |
| $1$                      | 近线性（NTT/FFT） |                             $0.92$ | 扩域略快 |
| $\log_2 3 \approx 1.585$ | Karatsuba         |                     $\approx 1.54$ | 矩阵快   |
| $2$                      | 朴素 $O(n^2)$     |                             $2.23$ | 矩阵快   |

**转折点**由 $\frac{3}{8}\cdot 2.44^{\,\alpha} = 1$ 解出：

$$
\alpha^\star = \frac{\log(8/3)}{\log 2.44} \approx 1.10.
$$

$\alpha < 1.10 \rightarrow$ 扩域快；$\alpha > 1.10 \rightarrow$ 矩阵快。当然，实际的乘法模型也并非如此简单，$\alpha$ 的值也并非一直不变，这不仅是因为这个简化模型本身的局限，也是因为大整数乘法算法本身又有与 $N$ 的数量级相关的常数。

## 方法对比

| 方法         | 精确范围                     | 运算模型                                    | 总代价                               |
| ------------ | ---------------------------- | ------------------------------------------- | ------------------------------------ |
| 朴素递推     | 任意 $n$                     | $n$ 次大整数加法，第 $k$ 次位数 $\Theta(k)$ | $\Theta(n^2)$ 位运算                 |
| 矩阵快速幂   | 任意 $n$                     | $8\,\mu(n)$ 次 $N$ 位乘                     | $\Theta\bigl(8\,M(N)\,\mu(n)\bigr)$  |
| Binet + 浮点 | $n\le 75$（本机 `f64` 实测） | $\mu(n)$ 次机器浮点乘                       | $\Theta(\log n)$ 浮点运算            |
| 扩域快速幂   | 任意 $n$                     | $3\,\mu(n)$ 次 $N'$ 位乘                    | $\Theta\bigl(3\,M(N')\,\mu(n)\bigr)$ |

其中 $\mu(n)=\lfloor\log_2 n\rfloor+\mathrm{popcount}(n)-1=\Theta(\log n)$，$N=\mathrm{bitlen}(F_n)$，$N'=N+n-1$。

浮点 Binet 在精度半径内最快；半径外用整数算法。矩阵与扩域同阶，实际快慢 $M(N)$ 与 $M(N')$ 的差距也影响很大。

本质上：矩阵法算 $A^n$，扩域法算 $d_1^n$；都是「线性递推 $\leftrightarrow$ 代数结构上的幂」。

## 具体实现

下面用 `std.math.big.int.Managed` 做精确整数，`f64` 做浮点 Binet。编译：

```bash
zig build-exe fib.zig -OReleaseFast
```

### 矩阵快速幂

```zig
const std = @import("std");
const Big = std.math.big.int.Managed;
const Allocator = std.mem.Allocator;

const Mat2 = struct {
    a: Big,
    b: Big,
    c: Big,
    d: Big,

    fn deinit(self: *Mat2) void {
        self.a.deinit();
        self.b.deinit();
        self.c.deinit();
        self.d.deinit();
    }

    fn initSet(allocator: Allocator, av: anytype, bv: anytype, cv: anytype, dv: anytype) !Mat2 {
        return .{
            .a = try Big.initSet(allocator, av),
            .b = try Big.initSet(allocator, bv),
            .c = try Big.initSet(allocator, cv),
            .d = try Big.initSet(allocator, dv),
        };
    }

    fn identity(allocator: Allocator) !Mat2 {
        return initSet(allocator, 1, 0, 0, 1);
    }

    fn baseA(allocator: Allocator) !Mat2 {
        return initSet(allocator, 1, 1, 1, 0);
    }

    fn copyFrom(self: *Mat2, other: *const Mat2) !void {
        try self.a.copy(other.a.toConst());
        try self.b.copy(other.b.toConst());
        try self.c.copy(other.c.toConst());
        try self.d.copy(other.d.toConst());
    }

    /// self = x * y，朴素 8 次整数乘
    fn mulInto(self: *Mat2, x: *const Mat2, y: *const Mat2, t1: *Big, t2: *Big) !void {
        try t1.mul(&x.a, &y.a);
        try t2.mul(&x.b, &y.c);
        try self.a.add(t1, t2);

        try t1.mul(&x.a, &y.b);
        try t2.mul(&x.b, &y.d);
        try self.b.add(t1, t2);

        try t1.mul(&x.c, &y.a);
        try t2.mul(&x.d, &y.c);
        try self.c.add(t1, t2);

        try t1.mul(&x.c, &y.b);
        try t2.mul(&x.d, &y.d);
        try self.d.add(t1, t2);
    }
};

/// F_n：A^n * (1,0)^T 的第二分量
fn fibMatrix(allocator: Allocator, n: u64) !Big {
    if (n == 0) return try Big.initSet(allocator, 0);
    if (n == 1) return try Big.initSet(allocator, 1);

    var result = try Mat2.identity(allocator);
    defer result.deinit();
    var base = try Mat2.baseA(allocator);
    defer base.deinit();
    var tmp = try Mat2.identity(allocator);
    defer tmp.deinit();
    var t1 = try Big.init(allocator);
    defer t1.deinit();
    var t2 = try Big.init(allocator);
    defer t2.deinit();

    var e = n;
    while (e > 0) : (e >>= 1) {
        if (e & 1 != 0) {
            try tmp.mulInto(&result, &base, &t1, &t2);
            try result.copyFrom(&tmp);
        }
        try tmp.mulInto(&base, &base, &t1, &t2);
        try base.copyFrom(&tmp);
    }
    var out = try Big.init(allocator);
    try out.copy(result.c.toConst());
    return out;
}
```

### 浮点 Binet

```zig
/// 成功时返回 F_n；超出 f64 可靠范围时返回 null（本机实测可靠到 n<=75）
fn fibFloat(n: u64) ?u64 {
    if (n == 0) return 0;
    if (n > 93) return null; // F_94 起 u64 装不下
    const lam1: f64 = (1.0 + @sqrt(5.0)) / 2.0;
    var base = lam1;
    var res: f64 = 1.0;
    var e = n;
    while (e > 0) : (e >>= 1) {
        if (e & 1 != 0) res *= base;
        base *= base;
    }
    const approx = res / @sqrt(5.0);
    if (!std.math.isFinite(approx)) return null;
    const rounded = @round(approx);
    if (rounded < 0.0 or rounded > @as(f64, @floatFromInt(std.math.maxInt(u64)))) return null;
    return @intFromFloat(rounded);
}
```

### 扩域 $\mathbb{Z}[\sqrt{5}]$

```zig
const Ext = struct {
    x: Big,
    y: Big, // 表示 x + y√5

    fn deinit(self: *Ext) void {
        self.x.deinit();
        self.y.deinit();
    }

    fn initSet(allocator: Allocator, xv: anytype, yv: anytype) !Ext {
        return .{
            .x = try Big.initSet(allocator, xv),
            .y = try Big.initSet(allocator, yv),
        };
    }

    fn copyFrom(self: *Ext, other: *const Ext) !void {
        try self.x.copy(other.x.toConst());
        try self.y.copy(other.y.toConst());
    }

    /// 5v = (v<<2) + v
    fn mul5(out: *Big, v: *const Big) !void {
        try out.shiftLeft(v, 2);
        try out.add(out, v);
    }

    /// self = p * q，恰 3 次大整数乘
    fn mulInto(self: *Ext, p: *const Ext, q: *const Ext, t1: *Big, t2: *Big, t3: *Big, t4: *Big) !void {
        try t1.mul(&p.x, &q.x); // ac
        try t2.mul(&p.y, &q.y); // bd
        try mul5(t4, t2); // 5 bd
        try self.x.add(t1, t4);

        try t3.add(&p.x, &p.y);
        try t4.add(&q.x, &q.y);
        try self.y.mul(t3, t4); // (a+b)(c+d)
        try t3.sub(&self.y, t1);
        try self.y.sub(t3, t2); // ad+bc
    }

    /// self = p²，恰 3 次大整数乘
    fn sqrInto(self: *Ext, p: *const Ext, t1: *Big, t2: *Big, t3: *Big) !void {
        try t1.mul(&p.x, &p.x);
        try t2.mul(&p.y, &p.y);
        try mul5(t3, t2);
        try self.x.add(t1, t3);
        try t1.mul(&p.x, &p.y);
        try self.y.add(t1, t1); // 2ab
    }
};

/// F_n = Y_n / 2^{n-1}
fn fibExt(allocator: Allocator, n: u64) !Big {
    if (n == 0) return try Big.initSet(allocator, 0);
    if (n == 1) return try Big.initSet(allocator, 1);

    var result = try Ext.initSet(allocator, 1, 0); // 1
    defer result.deinit();
    var base = try Ext.initSet(allocator, 1, 1); // 1+√5
    defer base.deinit();
    var tmp = try Ext.initSet(allocator, 0, 0);
    defer tmp.deinit();
    var t1 = try Big.init(allocator);
    defer t1.deinit();
    var t2 = try Big.init(allocator);
    defer t2.deinit();
    var t3 = try Big.init(allocator);
    defer t3.deinit();
    var t4 = try Big.init(allocator);
    defer t4.deinit();

    var e = n;
    while (e > 0) : (e >>= 1) {
        if (e & 1 != 0) {
            try tmp.mulInto(&result, &base, &t1, &t2, &t3, &t4);
            try result.copyFrom(&tmp);
        }
        try tmp.sqrInto(&base, &t1, &t2, &t3);
        try base.copyFrom(&tmp);
    }

    var out = try Big.init(allocator);
    try out.shiftRight(&result.y, @intCast(n - 1));
    return out;
}
```

## 实测

环境：Zig **0.15.2**，`-OReleaseFast`，`x86_64`，CPU 为 13th Gen Intel Core i7-13700HX。计时为 wall time 平均（含调用内部分配）。

正确性：

- `fibFloat` 与线性递推对照：精确到 $n\le 75$，$n=76$ 起失准；本机约 $3\text{–}5\,\mathrm{ns}$（$n=10\to75$）。
- `fibMatrix` 与 `fibExt` 在 $n\in\{0,1,2,5,10,20,50,75,100,1000,10000\}$ 上结果一致。
- 样例：$F_{10}=55$，$F_{75}=2111485077978050$，$F_{100}=354224848179261915075$。

两种精确算法同为 $\Theta\bigl(M(n)\log n\bigr)$，区别只在常数（矩阵 $8$、扩域 $3$）与位数（$N$ 对 $N'\approx 2.44\,N$）。**wall-clock 几乎整段泡在大整数乘法里**——两者的相对快慢由 $M$ 的增长指数 $\alpha$ 严格决定（推导见前文 §位数比的解析效应）：默认 `std.math.big` 走 Karatsuba（$\alpha\approx 1.58$）时矩阵更快；要让「少做几次乘」变成胜势，得把 $M$ 拉近线性——下面用手写 NTT。

## 手写 NTT 大整数乘法

Zig 标准库没有 FFT/NTT 路径。这里用**三模 NTT + CRT**做卷积乘法：

- 素数（原根均为 $3$）：$998244353$，$469762049$，$167772161$
- 数字基 $2^{32}$（每个 `u64` limb 拆成两个 `u32`）

### 核心：蝶形与点积

```zig
/// 原地 Cooley–Tukey NTT。twiddles[s] 为第 s 层（len=2^{s+1}）的步长根。
fn nttWithTwiddles(a: []u32, mod: u32, twiddles: []const u32) void {
    const n = a.len;
    const log_n: u6 = @intCast(std.math.log2(n));
    bitReversePermute(a, log_n);

    var len: usize = 2;
    var stage: usize = 0;
    while (len <= n) : ({
        len <<= 1;
        stage += 1;
    }) {
        const wlen = twiddles[stage];
        var i: usize = 0;
        while (i < n) : (i += len) {
            var w: u32 = 1;
            var j: usize = 0;
            while (j < len / 2) : (j += 1) {
                const u = a[i + j];
                const v = modMul(a[i + j + len / 2], w, mod);
                a[i + j] = modAdd(u, v, mod);
                a[i + j + len / 2] = modSub(u, v, mod);
                w = modMul(w, wlen, mod);
            }
        }
    }
}

fn nttMulPoly(fa: []u32, fb: []u32, mod: u32, tw_f: []const u32, tw_i: []const u32, n_inv: u32) void {
    nttWithTwiddles(fa, mod, tw_f);
    nttWithTwiddles(fb, mod, tw_f);
    for (fa, fb) |*x, y| x.* = modMul(x.*, y, mod);
    nttWithTwiddles(fa, mod, tw_i); // 逆变换
    for (fa) |*x| x.* = modMul(x.*, n_inv, mod);
}
```

### CRT 还原

$$
x=\sum_{i=0}^{2} r_i\cdot\frac{M}{m_i}\cdot\Bigl(\frac{M}{m_i}\Bigr)^{-1}\bmod m_i \pmod M
$$

```zig
fn crt3(r0: u32, r1: u32, r2: u32) u128 {
    var x: u128 = 0;
    const rs = [_]u32{ r0, r1, r2 };
    inline for (0..3) |i| {
        x += Mods.Mi[i] * @as(u128, rs[i]) * @as(u128, Mods.yi[i]);
    }
    return x % Mods.M;
}
```

流程：`toDigits32` → 三模 `nttMulPoly` → 逐系数 `crt3` + base-$2^{32}$ 进位 → 写回 `Managed`。矩阵/扩域里把 `t.mul(a,b)` 换成 `mulNtt(t,a,b)` 即可。

### 浮点 vs 矩阵 vs 扩域

矩阵 / 扩域底层乘法均为 NTT（`mulNtt`）。浮点只画精确范围 $n\le 75$：

![浮点 vs 矩阵 vs 扩域](/images/fib-perf-curves.png)

|      $n$ |                  浮点 |                矩阵 |                扩域 |  扩域 / 矩阵 |
| -------: | --------------------: | ------------------: | ------------------: | -----------: |
|     $10$ | $3.0\,\mathrm{ns}$  |                    |                    |             |
|     $20$ | $3.4\,\mathrm{ns}$  |                    |                    |             |
|     $50$ | $3.9\,\mathrm{ns}$  |                    |                    |             |
|     $75$ | $4.9\,\mathrm{ns}$ | $1.61\,\mathrm{ms}$ | $0.63\,\mathrm{ms}$ | $0.39\times$ |
| $10^{3}$ |                     — | $2.18\,\mathrm{ms}$ | $0.88\,\mathrm{ms}$ | $0.40\times$ |
| $10^{4}$ |                     — | $5.13\,\mathrm{ms}$ | $3.48\,\mathrm{ms}$ | $0.68\times$ |
| $10^{5}$ |                     — | $39.2\,\mathrm{ms}$ | $28.5\,\mathrm{ms}$ | $0.73\times$ |
| $10^{6}$ |                     — |  $443\,\mathrm{ms}$ |  $339\,\mathrm{ms}$ | $0.76\times$ |

浮点是 $\Theta(\log n)$ 次机器浮点乘（纳秒级）；矩阵 / 扩域是 $\Theta(\log n)$ 次大整数乘。NTT 下扩域始终更快，但表里 **扩域 / 矩阵** 从 $\sim 0.4$ 抬到 $\sim 0.76$——相对优势在缩小。

测试代码：

<iframe src="https://zp.xihale.top/0.15.2/?embed=1#b64=Ly8hIOS4ieaooSBOVFQgKyBDUlQg5aSn5pW05pWw5LmY5rOV6amx5Yqo55qE5paQ5rOi6YKj5aWR5oCn6IO95rWL6K-V77yIWmlnIDAuMTUuMu-8iQoKY29uc3Qgc3RkID0gQGltcG9ydCgic3RkIik7CmNvbnN0IG1hdGggPSBzdGQubWF0aDsKY29uc3QgQWxsb2NhdG9yID0gc3RkLm1lbS5BbGxvY2F0b3I7CmNvbnN0IEJpZyA9IHN0ZC5tYXRoLmJpZy5pbnQuTWFuYWdlZDsKY29uc3QgTGltYiA9IHN0ZC5tYXRoLmJpZy5MaW1iOwpjb25zdCBhc3NlcnQgPSBzdGQuZGVidWcuYXNzZXJ0OwoKY29uc3QgTW9kcyA9IHN0cnVjdCB7CiAgICBjb25zdCBtID0gW19ddTMyeyA5OTgyNDQzNTMsIDQ2OTc2MjA0OSwgMTY3NzcyMTYxIH07CiAgICBjb25zdCBnOiB1MzIgPSAzOwogICAgY29uc3QgTTogdTEyOCA9CiAgICAgICAgQGFzKHUxMjgsIG1bMF0pICogQGFzKHUxMjgsIG1bMV0pICogQGFzKHUxMjgsIG1bMl0pOwogICAgY29uc3QgTWkgPSBbX111MTI4eyBNIC8gbVswXSwgTSAvIG1bMV0sIE0gLyBtWzJdIH07CiAgICBjb25zdCB5aSA9IFtfXXUzMnsKICAgICAgICBtb2RJbnYoQGFzKHUzMiwgQGludENhc3QoTWlbMF0gJSBtWzBdKSksIG1bMF0pLAogICAgICAgIG1vZEludihAYXModTMyLCBAaW50Q2FzdChNaVsxXSAlIG1bMV0pKSwgbVsxXSksCiAgICAgICAgbW9kSW52KEBhcyh1MzIsIEBpbnRDYXN0KE1pWzJdICUgbVsyXSkpLCBtWzJdKSwKICAgIH07Cn07CgppbmxpbmUgZm4gbW9kQWRkKGE6IHUzMiwgYjogdTMyLCBtb2Q6IHUzMikgdTMyIHsKICAgIGNvbnN0IHMgPSBhICsgYjsKICAgIHJldHVybiBpZiAocyA-PSBtb2QpIHMgLSBtb2QgZWxzZSBzOwp9CgppbmxpbmUgZm4gbW9kU3ViKGE6IHUzMiwgYjogdTMyLCBtb2Q6IHUzMikgdTMyIHsKICAgIHJldHVybiBpZiAoYSA-PSBiKSBhIC0gYiBlbHNlIGEgKyBtb2QgLSBiOwp9CgppbmxpbmUgZm4gbW9kTXVsKGE6IHUzMiwgYjogdTMyLCBtb2Q6IHUzMikgdTMyIHsKICAgIHJldHVybiBAaW50Q2FzdCgoQGFzKHU2NCwgYSkgKiBAYXModTY0LCBiKSkgJSBtb2QpOwp9CgpmbiBtb2RQb3coYmFzZTogdTMyLCBleHA6IHUzMiwgbW9kOiB1MzIpIHUzMiB7CiAgICB2YXIgYiA9IGJhc2UgJSBtb2Q7CiAgICB2YXIgZSA9IGV4cDsKICAgIHZhciByOiB1MzIgPSAxOwogICAgd2hpbGUgKGUgPiAwKSA6IChlID4-PSAxKSB7CiAgICAgICAgaWYgKGUgJiAxICE9IDApIHIgPSBtb2RNdWwociwgYiwgbW9kKTsKICAgICAgICBiID0gbW9kTXVsKGIsIGIsIG1vZCk7CiAgICB9CiAgICByZXR1cm4gcjsKfQoKZm4gbW9kSW52KGE6IHUzMiwgbW9kOiB1MzIpIHUzMiB7CiAgICByZXR1cm4gbW9kUG93KGEsIG1vZCAtIDIsIG1vZCk7Cn0KCmZuIG5leHRQb3cyKHg6IHVzaXplKSB1c2l6ZSB7CiAgICBpZiAoeCA8PSAxKSByZXR1cm4gMTsKICAgIHJldHVybiBAYXModXNpemUsIDEpIDw8IEBpbnRDYXN0KG1hdGgubG9nMih4IC0gMSkgKyAxKTsKfQoKY29uc3QgbG9nX25fdCA9IHN0ZC5tYXRoLkxvZzJJbnQodXNpemUpOwoKZm4gYml0UmV2ZXJzZVBlcm11dGUoYTogW111MzIsIGxvZ19uOiBsb2dfbl90KSB2b2lkIHsKICAgIGNvbnN0IG4gPSBhLmxlbjsKICAgIGNvbnN0IHNoaWZ0OiBsb2dfbl90ID0gQGludENhc3QoQGJpdFNpemVPZih1c2l6ZSkgLSBAYXModXNpemUsIGxvZ19uKSk7CiAgICB2YXIgaTogdXNpemUgPSAwOwogICAgd2hpbGUgKGkgPCBuKSA6IChpICs9IDEpIHsKICAgICAgICBjb25zdCBqID0gQGJpdFJldmVyc2UoaSkgPj4gc2hpZnQ7CiAgICAgICAgaWYgKGkgPCBqKSB7CiAgICAgICAgICAgIGNvbnN0IHQgPSBhW2ldOwogICAgICAgICAgICBhW2ldID0gYVtqXTsKICAgICAgICAgICAgYVtqXSA9IHQ7CiAgICAgICAgfQogICAgfQp9CgovLy8gdHdpZGRsZXNbc13vvJrnrKwgcyDlsYLvvIhsZW49Ml57cysxfe-8ieidtuW9oueahOatpemVv-aguQpmbiBudHRXaXRoVHdpZGRsZXMoYTogW111MzIsIG1vZDogdTMyLCB0d2lkZGxlczogW11jb25zdCB1MzIpIHZvaWQgewogICAgY29uc3QgbiA9IGEubGVuOwogICAgY29uc3QgbG9nX246IGxvZ19uX3QgPSBAaW50Q2FzdChtYXRoLmxvZzIobikpOwogICAgYml0UmV2ZXJzZVBlcm11dGUoYSwgbG9nX24pOwoKICAgIHZhciBsZW46IHVzaXplID0gMjsKICAgIHZhciBzdGFnZTogdXNpemUgPSAwOwogICAgd2hpbGUgKGxlbiA8PSBuKSA6ICh7CiAgICAgICAgbGVuIDw8PSAxOwogICAgICAgIHN0YWdlICs9IDE7CiAgICB9KSB7CiAgICAgICAgY29uc3Qgd2xlbiA9IHR3aWRkbGVzW3N0YWdlXTsKICAgICAgICB2YXIgaTogdXNpemUgPSAwOwogICAgICAgIHdoaWxlIChpIDwgbikgOiAoaSArPSBsZW4pIHsKICAgICAgICAgICAgdmFyIHc6IHUzMiA9IDE7CiAgICAgICAgICAgIHZhciBqOiB1c2l6ZSA9IDA7CiAgICAgICAgICAgIHdoaWxlIChqIDwgbGVuIC8gMikgOiAoaiArPSAxKSB7CiAgICAgICAgICAgICAgICBjb25zdCB1ID0gYVtpICsgal07CiAgICAgICAgICAgICAgICBjb25zdCB2ID0gbW9kTXVsKGFbaSArIGogKyBsZW4gLyAyXSwgdywgbW9kKTsKICAgICAgICAgICAgICAgIGFbaSArIGpdID0gbW9kQWRkKHUsIHYsIG1vZCk7CiAgICAgICAgICAgICAgICBhW2kgKyBqICsgbGVuIC8gMl0gPSBtb2RTdWIodSwgdiwgbW9kKTsKICAgICAgICAgICAgICAgIHcgPSBtb2RNdWwodywgd2xlbiwgbW9kKTsKICAgICAgICAgICAgfQogICAgICAgIH0KICAgIH0KfQoKZm4gYnVpbGRUd2lkZGxlcyhhbGxvY2F0b3I6IEFsbG9jYXRvciwgbjogdXNpemUsIG1vZDogdTMyLCBpbnZlcnNlOiBib29sKSAhW111MzIgewogICAgY29uc3QgbG9nX24gPSBtYXRoLmxvZzIobik7CiAgICB2YXIgdHcgPSB0cnkgYWxsb2NhdG9yLmFsbG9jKHUzMiwgbG9nX24pOwogICAgY29uc3Qgbl91OiB1MzIgPSBAaW50Q2FzdChuKTsKICAgIGNvbnN0IHJvb3QgPSBtb2RQb3coTW9kcy5nLCAobW9kIC0gMSkgLyBuX3UsIG1vZCk7CiAgICBjb25zdCBiYXNlX3Jvb3QgPSBpZiAoaW52ZXJzZSkgbW9kSW52KHJvb3QsIG1vZCkgZWxzZSByb290OwogICAgdmFyIHM6IHVzaXplID0gMDsKICAgIHdoaWxlIChzIDwgbG9nX24pIDogKHMgKz0gMSkgewogICAgICAgIGNvbnN0IGxlbiA9IEBhcyh1c2l6ZSwgMSkgPDwgQGludENhc3QocyArIDEpOwogICAgICAgIHR3W3NdID0gbW9kUG93KGJhc2Vfcm9vdCwgQGludENhc3QobiAvIGxlbiksIG1vZCk7CiAgICB9CiAgICByZXR1cm4gdHc7Cn0KCmZuIG50dE11bFBvbHkoZmE6IFtddTMyLCBmYjogW111MzIsIG1vZDogdTMyLCB0d19mOiBbXWNvbnN0IHUzMiwgdHdfaTogW11jb25zdCB1MzIsIG5faW52OiB1MzIpIHZvaWQgewogICAgbnR0V2l0aFR3aWRkbGVzKGZhLCBtb2QsIHR3X2YpOwogICAgbnR0V2l0aFR3aWRkbGVzKGZiLCBtb2QsIHR3X2YpOwogICAgZm9yIChmYSwgZmIpIHwqeCwgeXwgeC4qID0gbW9kTXVsKHguKiwgeSwgbW9kKTsKICAgIG50dFdpdGhUd2lkZGxlcyhmYSwgbW9kLCB0d19pKTsKICAgIGZvciAoZmEpIHwqeHwgeC4qID0gbW9kTXVsKHguKiwgbl9pbnYsIG1vZCk7Cn0KCmZuIGNydDMocjA6IHUzMiwgcjE6IHUzMiwgcjI6IHUzMikgdTEyOCB7CiAgICB2YXIgeDogdTEyOCA9IDA7CiAgICBjb25zdCBycyA9IFtfXXUzMnsgcjAsIHIxLCByMiB9OwogICAgaW5saW5lIGZvciAoMC4uMykgfGl8IHsKICAgICAgICB4ICs9IE1vZHMuTWlbaV0gKiBAYXModTEyOCwgcnNbaV0pICogQGFzKHUxMjgsIE1vZHMueWlbaV0pOwogICAgfQogICAgcmV0dXJuIHggJSBNb2RzLk07Cn0KCmZuIHNocmlua1UzMihhbGxvY2F0b3I6IEFsbG9jYXRvciwgYnVmOiBbXXUzMiwgbjogdXNpemUpICFbXXUzMiB7CiAgICBpZiAobiA9PSBidWYubGVuKSByZXR1cm4gYnVmOwogICAgcmV0dXJuIHRyeSBhbGxvY2F0b3IucmVhbGxvYyhidWYsIG4pOwp9Cgpjb25zdCBkaWdpdHNfcGVyX2xpbWIgPSBAYml0U2l6ZU9mKExpbWIpIC8gMzI7CgpmbiB0b0RpZ2l0czMyKGFsbG9jYXRvcjogQWxsb2NhdG9yLCBhOiAqY29uc3QgQmlnKSAhW111MzIgewogICAgY29uc3QgYyA9IGEudG9Db25zdCgpOwogICAgaWYgKGMuZXFsWmVybygpKSB7CiAgICAgICAgY29uc3QgZCA9IHRyeSBhbGxvY2F0b3IuYWxsb2ModTMyLCAxKTsKICAgICAgICBkWzBdID0gMDsKICAgICAgICByZXR1cm4gZDsKICAgIH0KICAgIGNvbnN0IGxpbWJzID0gYy5saW1iczsKICAgIHZhciBvdXQgPSB0cnkgYWxsb2NhdG9yLmFsbG9jKHUzMiwgbGltYnMubGVuICogZGlnaXRzX3Blcl9saW1iKTsKICAgIHZhciBuOiB1c2l6ZSA9IDA7CiAgICBmb3IgKGxpbWJzKSB8bGltYnwgewogICAgICAgIGNvbXB0aW1lIHZhciBzOiB1c2l6ZSA9IDA7CiAgICAgICAgaW5saW5lIHdoaWxlIChzIDwgZGlnaXRzX3Blcl9saW1iKSA6IChzICs9IDEpIHsKICAgICAgICAgICAgb3V0W25dID0gQHRydW5jYXRlKGxpbWIgPj4gKHMgKiAzMikpOwogICAgICAgICAgICBuICs9IDE7CiAgICAgICAgfQogICAgfQogICAgd2hpbGUgKG4gPiAxIGFuZCBvdXRbbiAtIDFdID09IDApIG4gLT0gMTsKICAgIHJldHVybiB0cnkgc2hyaW5rVTMyKGFsbG9jYXRvciwgb3V0LCBuKTsKfQoKZm4gZGlnaXRzVG9CaWcoYWxsb2NhdG9yOiBBbGxvY2F0b3IsIGRpZ2l0czogW11jb25zdCB1MzIsIHBvc2l0aXZlOiBib29sKSAhQmlnIHsKICAgIGlmIChkaWdpdHMubGVuID09IDApIHJldHVybiB0cnkgQmlnLmluaXRTZXQoYWxsb2NhdG9yLCAwKTsKICAgIGNvbnN0IG5fbGltYnMgPSAoZGlnaXRzLmxlbiArIGRpZ2l0c19wZXJfbGltYiAtIDEpIC8gZGlnaXRzX3Blcl9saW1iOwogICAgdmFyIG91dCA9IHRyeSBCaWcuaW5pdChhbGxvY2F0b3IpOwogICAgdHJ5IG91dC5lbnN1cmVDYXBhY2l0eShuX2xpbWJzKTsKICAgIHZhciBpOiB1c2l6ZSA9IDA7CiAgICB2YXIgbGk6IHVzaXplID0gMDsKICAgIHdoaWxlIChpIDwgZGlnaXRzLmxlbikgOiAoewogICAgICAgIGkgKz0gZGlnaXRzX3Blcl9saW1iOwogICAgICAgIGxpICs9IDE7CiAgICB9KSB7CiAgICAgICAgdmFyIGxpbWI6IExpbWIgPSBkaWdpdHNbaV07CiAgICAgICAgY29tcHRpbWUgdmFyIHM6IHVzaXplID0gMTsKICAgICAgICBpbmxpbmUgd2hpbGUgKHMgPCBkaWdpdHNfcGVyX2xpbWIpIDogKHMgKz0gMSkgewogICAgICAgICAgICBpZiAoaSArIHMgPCBkaWdpdHMubGVuKSB7CiAgICAgICAgICAgICAgICBsaW1iIHw9IEBhcyhMaW1iLCBkaWdpdHNbaSArIHNdKSA8PCAocyAqIDMyKTsKICAgICAgICAgICAgfQogICAgICAgIH0KICAgICAgICBvdXQubGltYnNbbGldID0gbGltYjsKICAgIH0KICAgIHZhciBsZW4gPSBuX2xpbWJzOwogICAgd2hpbGUgKGxlbiA-IDEgYW5kIG91dC5saW1ic1tsZW4gLSAxXSA9PSAwKSBsZW4gLT0gMTsKICAgIGNvbnN0IHBvcyA9IHBvc2l0aXZlIG9yIChsZW4gPT0gMSBhbmQgb3V0LmxpbWJzWzBdID09IDApOwogICAgb3V0LnNldE1ldGFkYXRhKHBvcywgbGVuKTsKICAgIHJldHVybiBvdXQ7Cn0KCi8vLyBOVFQg5Y2356evICsgQ1JUICsgYmFzZS0yXjMyIOi_m-S9jQpwdWIgZm4gbnR0Q29udm9sdmVEaWdpdHMoYWxsb2NhdG9yOiBBbGxvY2F0b3IsIGE6IFtdY29uc3QgdTMyLCBiOiBbXWNvbnN0IHUzMikgIVtddTMyIHsKICAgIGNvbnN0IG5lZWQgPSBhLmxlbiArIGIubGVuOwogICAgY29uc3QgbiA9IG5leHRQb3cyKEBtYXgobmVlZCwgMikpOwogICAgaWYgKG4gPiAoMSA8PCAyMykpIHJldHVybiBlcnJvci5OdHRUb29Mb25nOwoKICAgIHZhciB0d19mOiBbM11bXXUzMiA9IHVuZGVmaW5lZDsKICAgIHZhciB0d19pOiBbM11bXXUzMiA9IHVuZGVmaW5lZDsKICAgIHZhciBuX2ludjogWzNddTMyID0gdW5kZWZpbmVkOwogICAgZGVmZXIgewogICAgICAgIGlubGluZSBmb3IgKDAuLjMpIHxtaXwgewogICAgICAgICAgICBhbGxvY2F0b3IuZnJlZSh0d19mW21pXSk7CiAgICAgICAgICAgIGFsbG9jYXRvci5mcmVlKHR3X2lbbWldKTsKICAgICAgICB9CiAgICB9CiAgICBpbmxpbmUgZm9yICgwLi4zKSB8bWl8IHsKICAgICAgICBjb25zdCBtb2QgPSBNb2RzLm1bbWldOwogICAgICAgIHR3X2ZbbWldID0gdHJ5IGJ1aWxkVHdpZGRsZXMoYWxsb2NhdG9yLCBuLCBtb2QsIGZhbHNlKTsKICAgICAgICB0d19pW21pXSA9IHRyeSBidWlsZFR3aWRkbGVzKGFsbG9jYXRvciwgbiwgbW9kLCB0cnVlKTsKICAgICAgICBuX2ludlttaV0gPSBtb2RJbnYoQGludENhc3QobiksIG1vZCk7CiAgICB9CgogICAgdmFyIHJlczogWzNdW111MzIgPSB1bmRlZmluZWQ7CiAgICBkZWZlciBpbmxpbmUgZm9yICgwLi4zKSB8bWl8IGFsbG9jYXRvci5mcmVlKHJlc1ttaV0pOwoKICAgIGlubGluZSBmb3IgKDAuLjMpIHxtaXwgewogICAgICAgIGNvbnN0IG1vZCA9IE1vZHMubVttaV07CiAgICAgICAgY29uc3QgZmEgPSB0cnkgYWxsb2NhdG9yLmFsbG9jKHUzMiwgbik7CiAgICAgICAgZXJyZGVmZXIgYWxsb2NhdG9yLmZyZWUoZmEpOwogICAgICAgIGNvbnN0IGZiID0gdHJ5IGFsbG9jYXRvci5hbGxvYyh1MzIsIG4pOwogICAgICAgIGRlZmVyIGFsbG9jYXRvci5mcmVlKGZiKTsKICAgICAgICBAbWVtc2V0KGZhLCAwKTsKICAgICAgICBAbWVtc2V0KGZiLCAwKTsKICAgICAgICBmb3IgKGEsIDAuLikgfHYsIGl8IGZhW2ldID0gaWYgKHYgPj0gbW9kKSB2ICUgbW9kIGVsc2UgdjsKICAgICAgICBmb3IgKGIsIDAuLikgfHYsIGl8IGZiW2ldID0gaWYgKHYgPj0gbW9kKSB2ICUgbW9kIGVsc2UgdjsKICAgICAgICBudHRNdWxQb2x5KGZhLCBmYiwgbW9kLCB0d19mW21pXSwgdHdfaVttaV0sIG5faW52W21pXSk7CiAgICAgICAgcmVzW21pXSA9IGZhOwogICAgfQoKICAgIHZhciBvdXQgPSB0cnkgYWxsb2NhdG9yLmFsbG9jKHUzMiwgbmVlZCArIDQpOwogICAgQG1lbXNldChvdXQsIDApOwogICAgdmFyIGNhcnJ5OiB1MTI4ID0gMDsKICAgIHZhciBpOiB1c2l6ZSA9IDA7CiAgICB3aGlsZSAoaSA8IG5lZWQpIDogKGkgKz0gMSkgewogICAgICAgIGNvbnN0IGV4YWN0ID0gY3J0MyhyZXNbMF1baV0sIHJlc1sxXVtpXSwgcmVzWzJdW2ldKSArIGNhcnJ5OwogICAgICAgIG91dFtpXSA9IEB0cnVuY2F0ZShleGFjdCk7CiAgICAgICAgY2FycnkgPSBleGFjdCA-PiAzMjsKICAgIH0KICAgIHdoaWxlIChjYXJyeSA-IDApIDogKGkgKz0gMSkgewogICAgICAgIGlmIChpID49IG91dC5sZW4pIHsKICAgICAgICAgICAgb3V0ID0gdHJ5IGFsbG9jYXRvci5yZWFsbG9jKG91dCwgb3V0LmxlbiAqIDIpOwogICAgICAgIH0KICAgICAgICBvdXRbaV0gPSBAdHJ1bmNhdGUoY2FycnkpOwogICAgICAgIGNhcnJ5ID4-PSAzMjsKICAgIH0KICAgIHZhciBsZW4gPSBAbWF4KGksIDEpOwogICAgd2hpbGUgKGxlbiA-IDEgYW5kIG91dFtsZW4gLSAxXSA9PSAwKSBsZW4gLT0gMTsKICAgIHJldHVybiB0cnkgc2hyaW5rVTMyKGFsbG9jYXRvciwgb3V0LCBsZW4pOwp9CgovLy8gciA9IGEgKiBi77yb5Y2356ev6LaF6ZmQ5pe25Zue6JC9IHN0ZApwdWIgZm4gbXVsTnR0KHI6ICpCaWcsIGE6ICpjb25zdCBCaWcsIGI6ICpjb25zdCBCaWcpICF2b2lkIHsKICAgIGlmIChhLmVxbFplcm8oKSBvciBiLmVxbFplcm8oKSkgewogICAgICAgIHRyeSByLnNldCgwKTsKICAgICAgICByZXR1cm47CiAgICB9CgogICAgY29uc3QgYWxsb2NhdG9yID0gci5hbGxvY2F0b3I7CiAgICBjb25zdCBkYSA9IHRyeSB0b0RpZ2l0czMyKGFsbG9jYXRvciwgYSk7CiAgICBkZWZlciBhbGxvY2F0b3IuZnJlZShkYSk7CiAgICBjb25zdCBkYiA9IHRyeSB0b0RpZ2l0czMyKGFsbG9jYXRvciwgYik7CiAgICBkZWZlciBhbGxvY2F0b3IuZnJlZShkYik7CgogICAgY29uc3QgZGlnaXRzID0gbnR0Q29udm9sdmVEaWdpdHMoYWxsb2NhdG9yLCBkYSwgZGIpIGNhdGNoIHxlcnJ8IHsKICAgICAgICBpZiAoZXJyID09IGVycm9yLk50dFRvb0xvbmcpIHsKICAgICAgICAgICAgdHJ5IHIubXVsKGEsIGIpOwogICAgICAgICAgICByZXR1cm47CiAgICAgICAgfQogICAgICAgIHJldHVybiBlcnI7CiAgICB9OwogICAgZGVmZXIgYWxsb2NhdG9yLmZyZWUoZGlnaXRzKTsKCiAgICB2YXIgdG1wID0gdHJ5IGRpZ2l0c1RvQmlnKGFsbG9jYXRvciwgZGlnaXRzLCB0cnVlKTsKICAgIGRlZmVyIHRtcC5kZWluaXQoKTsKICAgIGNvbnN0IHBvcyA9IGEuaXNQb3NpdGl2ZSgpID09IGIuaXNQb3NpdGl2ZSgpOwogICAgdHJ5IHIuY29weSh0bXAudG9Db25zdCgpKTsKICAgIGlmICghcG9zIGFuZCAhci5lcWxaZXJvKCkpIHIubmVnYXRlKCk7Cn0KCi8vIDEpIOefqemYteW_q-mAn-W5ggpjb25zdCBNYXQyID0gc3RydWN0IHsKICAgIGE6IEJpZywKICAgIGI6IEJpZywKICAgIGM6IEJpZywKICAgIGQ6IEJpZywKCiAgICBmbiBkZWluaXQoc2VsZjogKk1hdDIpIHZvaWQgewogICAgICAgIHNlbGYuYS5kZWluaXQoKTsKICAgICAgICBzZWxmLmIuZGVpbml0KCk7CiAgICAgICAgc2VsZi5jLmRlaW5pdCgpOwogICAgICAgIHNlbGYuZC5kZWluaXQoKTsKICAgIH0KCiAgICBmbiBpbml0U2V0KGFsbG9jYXRvcjogQWxsb2NhdG9yLCBhdjogYW55dHlwZSwgYnY6IGFueXR5cGUsIGN2OiBhbnl0eXBlLCBkdjogYW55dHlwZSkgIU1hdDIgewogICAgICAgIHJldHVybiAuewogICAgICAgICAgICAuYSA9IHRyeSBCaWcuaW5pdFNldChhbGxvY2F0b3IsIGF2KSwKICAgICAgICAgICAgLmIgPSB0cnkgQmlnLmluaXRTZXQoYWxsb2NhdG9yLCBidiksCiAgICAgICAgICAgIC5jID0gdHJ5IEJpZy5pbml0U2V0KGFsbG9jYXRvciwgY3YpLAogICAgICAgICAgICAuZCA9IHRyeSBCaWcuaW5pdFNldChhbGxvY2F0b3IsIGR2KSwKICAgICAgICB9OwogICAgfQoKICAgIGZuIGlkZW50aXR5KGFsbG9jYXRvcjogQWxsb2NhdG9yKSAhTWF0MiB7CiAgICAgICAgcmV0dXJuIGluaXRTZXQoYWxsb2NhdG9yLCAxLCAwLCAwLCAxKTsKICAgIH0KCiAgICBmbiBiYXNlQShhbGxvY2F0b3I6IEFsbG9jYXRvcikgIU1hdDIgewogICAgICAgIHJldHVybiBpbml0U2V0KGFsbG9jYXRvciwgMSwgMSwgMSwgMCk7CiAgICB9CgogICAgZm4gY29weUZyb20oc2VsZjogKk1hdDIsIG90aGVyOiAqY29uc3QgTWF0MikgIXZvaWQgewogICAgICAgIHRyeSBzZWxmLmEuY29weShvdGhlci5hLnRvQ29uc3QoKSk7CiAgICAgICAgdHJ5IHNlbGYuYi5jb3B5KG90aGVyLmIudG9Db25zdCgpKTsKICAgICAgICB0cnkgc2VsZi5jLmNvcHkob3RoZXIuYy50b0NvbnN0KCkpOwogICAgICAgIHRyeSBzZWxmLmQuY29weShvdGhlci5kLnRvQ29uc3QoKSk7CiAgICB9CgogICAgLy8vIHNlbGYgPSB4ICogee-8jOactOe0oCA4IOasoeaVtOaVsOS5mAogICAgZm4gbXVsSW50byhzZWxmOiAqTWF0MiwgeDogKmNvbnN0IE1hdDIsIHk6ICpjb25zdCBNYXQyLCB0MTogKkJpZywgdDI6ICpCaWcpICF2b2lkIHsKICAgICAgICB0cnkgbXVsTnR0KHQxLCAmeC5hLCAmeS5hKTsKICAgICAgICB0cnkgbXVsTnR0KHQyLCAmeC5iLCAmeS5jKTsKICAgICAgICB0cnkgc2VsZi5hLmFkZCh0MSwgdDIpOwoKICAgICAgICB0cnkgbXVsTnR0KHQxLCAmeC5hLCAmeS5iKTsKICAgICAgICB0cnkgbXVsTnR0KHQyLCAmeC5iLCAmeS5kKTsKICAgICAgICB0cnkgc2VsZi5iLmFkZCh0MSwgdDIpOwoKICAgICAgICB0cnkgbXVsTnR0KHQxLCAmeC5jLCAmeS5hKTsKICAgICAgICB0cnkgbXVsTnR0KHQyLCAmeC5kLCAmeS5jKTsKICAgICAgICB0cnkgc2VsZi5jLmFkZCh0MSwgdDIpOwoKICAgICAgICB0cnkgbXVsTnR0KHQxLCAmeC5jLCAmeS5iKTsKICAgICAgICB0cnkgbXVsTnR0KHQyLCAmeC5kLCAmeS5kKTsKICAgICAgICB0cnkgc2VsZi5kLmFkZCh0MSwgdDIpOwogICAgfQp9OwoKZm4gZmliTWF0cml4KGFsbG9jYXRvcjogQWxsb2NhdG9yLCBuOiB1NjQpICFCaWcgewogICAgaWYgKG4gPT0gMCkgcmV0dXJuIHRyeSBCaWcuaW5pdFNldChhbGxvY2F0b3IsIDApOwogICAgaWYgKG4gPT0gMSkgcmV0dXJuIHRyeSBCaWcuaW5pdFNldChhbGxvY2F0b3IsIDEpOwoKICAgIHZhciByZXN1bHQgPSB0cnkgTWF0Mi5pZGVudGl0eShhbGxvY2F0b3IpOwogICAgZGVmZXIgcmVzdWx0LmRlaW5pdCgpOwogICAgdmFyIGJhc2UgPSB0cnkgTWF0Mi5iYXNlQShhbGxvY2F0b3IpOwogICAgZGVmZXIgYmFzZS5kZWluaXQoKTsKICAgIHZhciB0bXAgPSB0cnkgTWF0Mi5pZGVudGl0eShhbGxvY2F0b3IpOwogICAgZGVmZXIgdG1wLmRlaW5pdCgpOwogICAgdmFyIHQxID0gdHJ5IEJpZy5pbml0KGFsbG9jYXRvcik7CiAgICBkZWZlciB0MS5kZWluaXQoKTsKICAgIHZhciB0MiA9IHRyeSBCaWcuaW5pdChhbGxvY2F0b3IpOwogICAgZGVmZXIgdDIuZGVpbml0KCk7CgogICAgdmFyIGUgPSBuOwogICAgd2hpbGUgKGUgPiAwKSA6IChlID4-PSAxKSB7CiAgICAgICAgaWYgKGUgJiAxICE9IDApIHsKICAgICAgICAgICAgdHJ5IHRtcC5tdWxJbnRvKCZyZXN1bHQsICZiYXNlLCAmdDEsICZ0Mik7CiAgICAgICAgICAgIHRyeSByZXN1bHQuY29weUZyb20oJnRtcCk7CiAgICAgICAgfQogICAgICAgIHRyeSB0bXAubXVsSW50bygmYmFzZSwgJmJhc2UsICZ0MSwgJnQyKTsKICAgICAgICB0cnkgYmFzZS5jb3B5RnJvbSgmdG1wKTsKICAgIH0KICAgIHZhciBvdXQgPSB0cnkgQmlnLmluaXQoYWxsb2NhdG9yKTsKICAgIHRyeSBvdXQuY29weShyZXN1bHQuYy50b0NvbnN0KCkpOwogICAgcmV0dXJuIG91dDsKfQoKLy8gMikg5rWu54K5IEJpbmV0CmZuIGZpYkZsb2F0KG46IHU2NCkgP3U2NCB7CiAgICBpZiAobiA9PSAwKSByZXR1cm4gMDsKICAgIGlmIChuID4gOTIpIHJldHVybiBudWxsOwogICAgY29uc3QgbGFtMTogZjY0ID0gKDEuMCArIEBzcXJ0KDUuMCkpIC8gMi4wOwogICAgdmFyIGJhc2UgPSBsYW0xOwogICAgdmFyIHJlczogZjY0ID0gMS4wOwogICAgdmFyIGUgPSBuOwogICAgd2hpbGUgKGUgPiAwKSA6IChlID4-PSAxKSB7CiAgICAgICAgaWYgKGUgJiAxICE9IDApIHJlcyAqPSBiYXNlOwogICAgICAgIGJhc2UgKj0gYmFzZTsKICAgIH0KICAgIGNvbnN0IGFwcHJveCA9IHJlcyAvIEBzcXJ0KDUuMCk7CiAgICBpZiAoIXN0ZC5tYXRoLmlzRmluaXRlKGFwcHJveCkpIHJldHVybiBudWxsOwogICAgY29uc3Qgcm91bmRlZCA9IEByb3VuZChhcHByb3gpOwogICAgaWYgKHJvdW5kZWQgPCAwLjAgb3Igcm91bmRlZCA-IEBhcyhmNjQsIEBmbG9hdEZyb21JbnQoc3RkLm1hdGgubWF4SW50KHU2NCkpKSkgcmV0dXJuIG51bGw7CiAgICByZXR1cm4gQGludEZyb21GbG9hdChyb3VuZGVkKTsKfQoKZm4gZmliTGluZWFyVTEyOChuOiB1NjQpIHUxMjggewogICAgaWYgKG4gPT0gMCkgcmV0dXJuIDA7CiAgICB2YXIgYTogdTEyOCA9IDA7CiAgICB2YXIgYjogdTEyOCA9IDE7CiAgICB2YXIgaTogdTY0ID0gMTsKICAgIHdoaWxlIChpIDwgbikgOiAoaSArPSAxKSB7CiAgICAgICAgY29uc3QgYyA9IGEgKyBiOwogICAgICAgIGEgPSBiOwogICAgICAgIGIgPSBjOwogICAgfQogICAgcmV0dXJuIGI7Cn0KCi8vIDMpIOaJqeWfnyBaW-KImjVdCmNvbnN0IEV4dCA9IHN0cnVjdCB7CiAgICB4OiBCaWcsCiAgICB5OiBCaWcsCgogICAgZm4gZGVpbml0KHNlbGY6ICpFeHQpIHZvaWQgewogICAgICAgIHNlbGYueC5kZWluaXQoKTsKICAgICAgICBzZWxmLnkuZGVpbml0KCk7CiAgICB9CgogICAgZm4gaW5pdFNldChhbGxvY2F0b3I6IEFsbG9jYXRvciwgeHY6IGFueXR5cGUsIHl2OiBhbnl0eXBlKSAhRXh0IHsKICAgICAgICByZXR1cm4gLnsKICAgICAgICAgICAgLnggPSB0cnkgQmlnLmluaXRTZXQoYWxsb2NhdG9yLCB4diksCiAgICAgICAgICAgIC55ID0gdHJ5IEJpZy5pbml0U2V0KGFsbG9jYXRvciwgeXYpLAogICAgICAgIH07CiAgICB9CgogICAgZm4gY29weUZyb20oc2VsZjogKkV4dCwgb3RoZXI6ICpjb25zdCBFeHQpICF2b2lkIHsKICAgICAgICB0cnkgc2VsZi54LmNvcHkob3RoZXIueC50b0NvbnN0KCkpOwogICAgICAgIHRyeSBzZWxmLnkuY29weShvdGhlci55LnRvQ29uc3QoKSk7CiAgICB9CgogICAgLy8vIDV2ID0gKHY8PDIpICsgdgogICAgZm4gbXVsNShvdXQ6ICpCaWcsIHY6ICpjb25zdCBCaWcpICF2b2lkIHsKICAgICAgICB0cnkgb3V0LnNoaWZ0TGVmdCh2LCAyKTsKICAgICAgICB0cnkgb3V0LmFkZChvdXQsIHYpOwogICAgfQoKICAgIC8vLyBzZWxmID0gcCAqIHHvvIzmgbAgMyDmrKHlpKfmlbTmlbDkuZgKICAgIGZuIG11bEludG8oc2VsZjogKkV4dCwgcDogKmNvbnN0IEV4dCwgcTogKmNvbnN0IEV4dCwgdDE6ICpCaWcsIHQyOiAqQmlnLCB0MzogKkJpZywgdDQ6ICpCaWcpICF2b2lkIHsKICAgICAgICB0cnkgbXVsTnR0KHQxLCAmcC54LCAmcS54KTsgLy8gYWMKICAgICAgICB0cnkgbXVsTnR0KHQyLCAmcC55LCAmcS55KTsgLy8gYmQKICAgICAgICB0cnkgbXVsNSh0NCwgdDIpOyAvLyA1IGJkCiAgICAgICAgdHJ5IHNlbGYueC5hZGQodDEsIHQ0KTsgLy8gYWMgKyA1YmQKCiAgICAgICAgdHJ5IHQzLmFkZCgmcC54LCAmcC55KTsgLy8gYStiCiAgICAgICAgdHJ5IHQ0LmFkZCgmcS54LCAmcS55KTsgLy8gYytkCiAgICAgICAgdHJ5IG11bE50dCgmc2VsZi55LCB0MywgdDQpOyAvLyAoYStiKShjK2QpCiAgICAgICAgdHJ5IHQzLnN1Yigmc2VsZi55LCB0MSk7CiAgICAgICAgdHJ5IHNlbGYueS5zdWIodDMsIHQyKTsgLy8gYWQrYmMKICAgIH0KCiAgICAvLy8gc2VsZiA9IHDCsu-8jOaBsCAzIOasoeWkp-aVtOaVsOS5mAogICAgZm4gc3FySW50byhzZWxmOiAqRXh0LCBwOiAqY29uc3QgRXh0LCB0MTogKkJpZywgdDI6ICpCaWcsIHQzOiAqQmlnKSAhdm9pZCB7CiAgICAgICAgdHJ5IG11bE50dCh0MSwgJnAueCwgJnAueCk7IC8vIGHCsgogICAgICAgIHRyeSBtdWxOdHQodDIsICZwLnksICZwLnkpOyAvLyBiwrIKICAgICAgICB0cnkgbXVsNSh0MywgdDIpOyAvLyA1IGLCsgogICAgICAgIHRyeSBzZWxmLnguYWRkKHQxLCB0Myk7CiAgICAgICAgdHJ5IG11bE50dCh0MSwgJnAueCwgJnAueSk7IC8vIGFiCiAgICAgICAgdHJ5IHNlbGYueS5hZGQodDEsIHQxKTsgLy8gMmFiCiAgICB9Cn07CgpmbiBmaWJFeHQoYWxsb2NhdG9yOiBBbGxvY2F0b3IsIG46IHU2NCkgIUJpZyB7CiAgICBpZiAobiA9PSAwKSByZXR1cm4gdHJ5IEJpZy5pbml0U2V0KGFsbG9jYXRvciwgMCk7CiAgICBpZiAobiA9PSAxKSByZXR1cm4gdHJ5IEJpZy5pbml0U2V0KGFsbG9jYXRvciwgMSk7CgogICAgdmFyIHJlc3VsdCA9IHRyeSBFeHQuaW5pdFNldChhbGxvY2F0b3IsIDEsIDApOwogICAgZGVmZXIgcmVzdWx0LmRlaW5pdCgpOwogICAgdmFyIGJhc2UgPSB0cnkgRXh0LmluaXRTZXQoYWxsb2NhdG9yLCAxLCAxKTsKICAgIGRlZmVyIGJhc2UuZGVpbml0KCk7CiAgICB2YXIgdG1wID0gdHJ5IEV4dC5pbml0U2V0KGFsbG9jYXRvciwgMCwgMCk7CiAgICBkZWZlciB0bXAuZGVpbml0KCk7CiAgICB2YXIgdDEgPSB0cnkgQmlnLmluaXQoYWxsb2NhdG9yKTsKICAgIGRlZmVyIHQxLmRlaW5pdCgpOwogICAgdmFyIHQyID0gdHJ5IEJpZy5pbml0KGFsbG9jYXRvcik7CiAgICBkZWZlciB0Mi5kZWluaXQoKTsKICAgIHZhciB0MyA9IHRyeSBCaWcuaW5pdChhbGxvY2F0b3IpOwogICAgZGVmZXIgdDMuZGVpbml0KCk7CiAgICB2YXIgdDQgPSB0cnkgQmlnLmluaXQoYWxsb2NhdG9yKTsKICAgIGRlZmVyIHQ0LmRlaW5pdCgpOwoKICAgIHZhciBlID0gbjsKICAgIHdoaWxlIChlID4gMCkgOiAoZSA-Pj0gMSkgewogICAgICAgIGlmIChlICYgMSAhPSAwKSB7CiAgICAgICAgICAgIHRyeSB0bXAubXVsSW50bygmcmVzdWx0LCAmYmFzZSwgJnQxLCAmdDIsICZ0MywgJnQ0KTsKICAgICAgICAgICAgdHJ5IHJlc3VsdC5jb3B5RnJvbSgmdG1wKTsKICAgICAgICB9CiAgICAgICAgdHJ5IHRtcC5zcXJJbnRvKCZiYXNlLCAmdDEsICZ0MiwgJnQzKTsKICAgICAgICB0cnkgYmFzZS5jb3B5RnJvbSgmdG1wKTsKICAgIH0KCiAgICB2YXIgb3V0ID0gdHJ5IEJpZy5pbml0KGFsbG9jYXRvcik7CiAgICB0cnkgb3V0LnNoaWZ0UmlnaHQoJnJlc3VsdC55LCBAaW50Q2FzdChuIC0gMSkpOwogICAgcmV0dXJuIG91dDsKfQoKZm4gZm9ybWF0TnMobnM6IHU2NCkgc3RydWN0IHsgZjY0LCBbXWNvbnN0IHU4IH0gewogICAgaWYgKG5zIDwgMV8wMDApIHJldHVybiAueyBAZmxvYXRGcm9tSW50KG5zKSwgIm5zIiB9OwogICAgaWYgKG5zIDwgMV8wMDBfMDAwKSByZXR1cm4gLnsgQGFzKGY2NCwgQGZsb2F0RnJvbUludChucykpIC8gMWUzLCAidXMiIH07CiAgICBpZiAobnMgPCAxXzAwMF8wMDBfMDAwKSByZXR1cm4gLnsgQGFzKGY2NCwgQGZsb2F0RnJvbUludChucykpIC8gMWU2LCAibXMiIH07CiAgICByZXR1cm4gLnsgQGFzKGY2NCwgQGZsb2F0RnJvbUludChucykpIC8gMWU5LCAicyIgfTsKfQoKZm4gYmVuY2hPbmNlKG46IHU2NCwgaXRlcnM6IHUzMiwgY29tcHRpbWUga2luZDogZW51bSB7IG1hdHJpeF9zdGQsIG1hdHJpeF9udHQsIGV4dF9zdGQsIGV4dF9udHQgfSkgIXU2NCB7CiAgICB2YXIgZ3BhX3N0YXRlOiBzdGQuaGVhcC5HZW5lcmFsUHVycG9zZUFsbG9jYXRvcigue30pID0gLnt9OwogICAgZGVmZXIgXyA9IGdwYV9zdGF0ZS5kZWluaXQoKTsKICAgIGNvbnN0IGdwYSA9IGdwYV9zdGF0ZS5hbGxvY2F0b3IoKTsKCiAgICB2YXIgc2luazogdXNpemUgPSAwOwogICAgc3dpdGNoIChraW5kKSB7CiAgICAgICAgLm1hdHJpeF9zdGQsIC5tYXRyaXhfbnR0ID0-IHsKICAgICAgICAgICAgdmFyIHcgPSB0cnkgZmliTWF0cml4KGdwYSwgbik7CiAgICAgICAgICAgIHNpbmsgKyU9IEBpbnRGcm9tQm9vbCh3LnRvQ29uc3QoKS5lcWxaZXJvKCkpOwogICAgICAgICAgICB3LmRlaW5pdCgpOwogICAgICAgIH0sCiAgICAgICAgLmV4dF9zdGQsIC5leHRfbnR0ID0-IHsKICAgICAgICAgICAgdmFyIHcgPSB0cnkgZmliRXh0KGdwYSwgbik7CiAgICAgICAgICAgIHNpbmsgKyU9IEBpbnRGcm9tQm9vbCh3LnRvQ29uc3QoKS5lcWxaZXJvKCkpOwogICAgICAgICAgICB3LmRlaW5pdCgpOwogICAgICAgIH0sCiAgICB9CgogICAgdmFyIHRpbWVyID0gdHJ5IHN0ZC50aW1lLlRpbWVyLnN0YXJ0KCk7CiAgICB2YXIgaTogdTMyID0gMDsKICAgIHdoaWxlIChpIDwgaXRlcnMpIDogKGkgKz0gMSkgewogICAgICAgIHN3aXRjaCAoa2luZCkgewogICAgICAgICAgICAubWF0cml4X3N0ZCwgLm1hdHJpeF9udHQgPT4gewogICAgICAgICAgICAgICAgdmFyIHIgPSB0cnkgZmliTWF0cml4KGdwYSwgbik7CiAgICAgICAgICAgICAgICBzaW5rICslPSBAaW50RnJvbUJvb2woci50b0NvbnN0KCkuZXFsWmVybygpKTsKICAgICAgICAgICAgICAgIHIuZGVpbml0KCk7CiAgICAgICAgICAgIH0sCiAgICAgICAgICAgIC5leHRfc3RkLCAuZXh0X250dCA9PiB7CiAgICAgICAgICAgICAgICB2YXIgciA9IHRyeSBmaWJFeHQoZ3BhLCBuKTsKICAgICAgICAgICAgICAgIHNpbmsgKyU9IEBpbnRGcm9tQm9vbChyLnRvQ29uc3QoKS5lcWxaZXJvKCkpOwogICAgICAgICAgICAgICAgci5kZWluaXQoKTsKICAgICAgICAgICAgfSwKICAgICAgICB9CiAgICB9CiAgICBpZiAoc2luayA9PSBzdGQubWF0aC5tYXhJbnQodXNpemUpKSByZXR1cm4gZXJyb3IuT3ZlcmZsb3c7CiAgICByZXR1cm4gdGltZXIucmVhZCgpIC8gaXRlcnM7Cn0KCnB1YiBmbiBtYWluKCkgIXZvaWQgewogICAgdmFyIGdwYV9zdGF0ZTogc3RkLmhlYXAuR2VuZXJhbFB1cnBvc2VBbGxvY2F0b3IoLnt9KSA9IC57fTsKICAgIGRlZmVyIF8gPSBncGFfc3RhdGUuZGVpbml0KCk7CiAgICBjb25zdCBncGEgPSBncGFfc3RhdGUuYWxsb2NhdG9yKCk7CgogICAgc3RkLmRlYnVnLnByaW50KCJ6aWcge3N9XG4iLCAue0BpbXBvcnQoImJ1aWx0aW4iKS56aWdfdmVyc2lvbl9zdHJpbmd9KTsKICAgIHN0ZC5kZWJ1Zy5wcmludCgiPT0gY29ycmVjdG5lc3MgKE5UVCBtdWwgcGF0aCkgPT1cbiIsIC57fSk7CiAgICBjb25zdCBjaGVja3MgPSBbX111NjR7IDAsIDEsIDIsIDUsIDEwLCAyMCwgNTAsIDc1LCAxMDAsIDEwMDAsIDEwMDAwLCA1MDAwMCB9OwogICAgZm9yIChjaGVja3MpIHxrfCB7CiAgICAgICAgdmFyIG0gPSB0cnkgZmliTWF0cml4KGdwYSwgayk7CiAgICAgICAgZGVmZXIgbS5kZWluaXQoKTsKICAgICAgICB2YXIgZSA9IHRyeSBmaWJFeHQoZ3BhLCBrKTsKICAgICAgICBkZWZlciBlLmRlaW5pdCgpOwogICAgICAgIGlmICghbS50b0NvbnN0KCkuZXFsKGUudG9Db25zdCgpKSkgewogICAgICAgICAgICBzdGQuZGVidWcucHJpbnQoIk1JU01BVENIIG49e2R9XG4iLCAue2t9KTsKICAgICAgICAgICAgcmV0dXJuIGVycm9yLk1pc21hdGNoOwogICAgICAgIH0KICAgIH0KICAgIHN0ZC5kZWJ1Zy5wcmludCgibWF0cml4ID09IGV4dCBvbiBjaGVja3Mgb2tcbiIsIC57fSk7CgogICAgewogICAgICAgIHZhciBmMTAwID0gdHJ5IGZpYk1hdHJpeChncGEsIDEwMCk7CiAgICAgICAgZGVmZXIgZjEwMC5kZWluaXQoKTsKICAgICAgICBjb25zdCBzID0gdHJ5IGYxMDAudG9Db25zdCgpLnRvU3RyaW5nQWxsb2MoZ3BhLCAxMCwgLmxvd2VyKTsKICAgICAgICBkZWZlciBncGEuZnJlZShzKTsKICAgICAgICBzdGQuZGVidWcucHJpbnQoIkZfMTAwPXtzfVxuIiwgLntzfSk7CiAgICB9CgogICAgc3RkLmRlYnVnLnByaW50KCJcbj09IGZpYiBiZW5jaCB3aXRoIGZ1bGwgTlRUIG11bCA9PVxuIiwgLnt9KTsKICAgIGNvbnN0IGNhc2VzID0gW19dc3RydWN0IHsgbjogdTY0LCBpdDogdTMyIH17CiAgICAgICAgLnsgLm4gPSAxMCwgLml0ID0gMjAwIH0sCiAgICAgICAgLnsgLm4gPSAyMCwgLml0ID0gMTUwIH0sCiAgICAgICAgLnsgLm4gPSA1MCwgLml0ID0gMTAwIH0sCiAgICAgICAgLnsgLm4gPSA3NSwgLml0ID0gODAgfSwKICAgICAgICAueyAubiA9IDEwMCwgLml0ID0gNjAgfSwKICAgICAgICAueyAubiA9IDIwMCwgLml0ID0gNDAgfSwKICAgICAgICAueyAubiA9IDUwMCwgLml0ID0gMzAgfSwKICAgICAgICAueyAubiA9IDFfMDAwLCAuaXQgPSAyNSB9LAogICAgICAgIC57IC5uID0gMl8wMDAsIC5pdCA9IDE4IH0sCiAgICAgICAgLnsgLm4gPSA1XzAwMCwgLml0ID0gMTIgfSwKICAgICAgICAueyAubiA9IDEwXzAwMCwgLml0ID0gOCB9LAogICAgICAgIC57IC5uID0gMjBfMDAwLCAuaXQgPSA1IH0sCiAgICAgICAgLnsgLm4gPSA1MF8wMDAsIC5pdCA9IDMgfSwKICAgICAgICAueyAubiA9IDEwMF8wMDAsIC5pdCA9IDIgfSwKICAgICAgICAueyAubiA9IDIwMF8wMDAsIC5pdCA9IDIgfSwKICAgICAgICAueyAubiA9IDUwMF8wMDAsIC5pdCA9IDEgfSwKICAgICAgICAueyAubiA9IDFfMDAwXzAwMCwgLml0ID0gMSB9LAogICAgfTsKICAgIGZvciAoY2FzZXMpIHxjfCB7CiAgICAgICAgY29uc3QgdG0gPSB0cnkgYmVuY2hPbmNlKGMubiwgYy5pdCwgLm1hdHJpeF9udHQpOwogICAgICAgIGNvbnN0IHRlID0gdHJ5IGJlbmNoT25jZShjLm4sIGMuaXQsIC5leHRfbnR0KTsKICAgICAgICBjb25zdCBmbSA9IGZvcm1hdE5zKHRtKTsKICAgICAgICBjb25zdCBmZSA9IGZvcm1hdE5zKHRlKTsKICAgICAgICBjb25zdCByYXRpbyA9IEBhcyhmNjQsIEBmbG9hdEZyb21JbnQodGUpKSAvIEBhcyhmNjQsIEBmbG9hdEZyb21JbnQodG0pKTsKICAgICAgICBzdGQuZGVidWcucHJpbnQoIm49e2Q6PDh9IG1hdHJpeD17ZDouM30ge3N9ICBleHQ9e2Q6LjN9IHtzfSAgZXh0L21hdD17ZDouM31cbiIsIC57CiAgICAgICAgICAgIGMubiwgZm1bMF0sIGZtWzFdLCBmZVswXSwgZmVbMV0sIHJhdGlvLAogICAgICAgIH0pOwogICAgfQp9Cg" width="100%" height="800" loading="lazy" style="border:0;border-radius:0"></iframe>
