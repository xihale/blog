---
title: rust-details
date: 2023-10-04 14:34:21
tags:
  - [learn]
  - [rust]
---

## Preface

`rust` 还是要学的, 毕竟上次把 `zig` 走马观花过了一遍, `rust` 也走马观花过一遍吧!(其实设计理念很多都有共同之处, ~~所以别为这个吵架了~~!)

> All is expression

## Difference and improvements

> 在 `exercism.org` 上面刷题的时候遇到的神奇的快捷操作

### 滑动窗口

```rust
fn windows(&self, size: usize) -> Windows<'_, T>;
```

Windows 的定义:

```rust
pub struct Windows<'a, T: 'a> {
    v: &'a [T],
    size: NonZeroUsize,
}
```

### 全称与存在

```rust
fn any<F: FnMut(Self::Item)>(&mut self, f: F) -> bool;
fn all<F: FnMut(Self::Item)>(&mut self, f: F) -> bool;
```

与子集结合可以做到快速判断子集(写代码快)

```rust
#[derive(Debug, PartialEq, Eq)]
pub enum Comparison {
    Equal,
    Sublist,
    Superlist,
    Unequal,
}

pub fn sublist<T: PartialEq>(_first_list: &[T], _second_list: &[T]) -> Comparison {
    use Comparison::*;
    match (_first_list.len(), _second_list.len()) {
        (0, 0) => Equal,
        (0, _) => Sublist,
        (_, 0) => Superlist,
        (a,b) if a>b => if _first_list.windows(b).any(|sub| sub==_second_list) {Superlist} else {Unequal},
        (a,b) if a<b => if _second_list.windows(a).any(|sub| sub==_first_list) {Sublist} else {Unequal},
        _ => if _first_list==_second_list {Equal} else {Unequal}
    }
}
```


## Todo

> 全部简单地过了一遍

- [x] macro!
- [x] Generic
- [x] mod/traits/struct
- [x] async/futures
- [x] Error
- [x] Option

### Difference & better

- [x] loop
- [x] if/while let
- [x] borrow/move/...
- [x] Rc/Arc
- [x] Box
