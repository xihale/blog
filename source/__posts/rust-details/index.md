<<<<<<< Updated upstream
<<<<<<< Updated upstream
---
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes

title: rust-details
date: 2023-06-07 21:18:42
tags: rust
---

# 前言
记录一些关于 `rust` 编程的注意事项

# 开始
## 最多能有一个 `mut借用`

```rust
fn main(){

    let mut a:[u8; 6]=[2;6];

    let p: &mut [u8]=&mut a[2..=5];

    p[2]=0;
 
    println!("{a:?}\n{p:?}");

}
```

不难看出，这里会报错: 

```Rust
error[E0502]: cannot borrow `a` as immutable because it is also borrowed as mutable
33 |     let p: &mut [u8]=&mut a[2..=5];
   |                           - mutable borrow occurs here
...
37 |     println!("{a:?}");
   |                ^ immutable borrow occurs here
38 |     println!("{p:?}");
   |                - mutable borrow later used here

```

当存在一个 `mut借用` 时，不可以再使用其他的借用甚至是原变量

