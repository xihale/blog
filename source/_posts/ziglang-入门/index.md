---
title: ziglang 入门
date: 2023-07-27 20:38:49
tags: zig learn
---

# 偶遇

某个周末，去往图书馆的早晨，偶然间发现了 `zig` 觉得很有意思，那天下午就看了一下他的 `futures`，可惜没有细细品味

# 正式学习

暑假过了十天左右才有时间步入 `zig` 的学习(这时才把他加上日程)，本来以为 2 天 能搞定的 `ziglings` 硬生生地拖了 4.5 天(~~看来还是对有 c++ 功底这件事太自信了~~)

## `ziglings`

{% blockquote %}
这是一个非常适合入门的项目(除了 Async 部分没有(~~`zig`还没有正式支持~~), 其他都可以浅浅地入门)
{% endblockquote %}

地址: [ziglings](https://github.com/ratfactor/ziglings)
答案见其中的 `patch`
~~我补充完的版本(Async 那里不知道是否正确): [ziglings-mine](https://github.com/xihale/ziglings-mine)~~

## 刨析 Futures

{% blockquote %}
没有意外情况的话，按照 [ziglearn](https://ziglearn.org/) 的叙述顺序来讲
{% endblockquote %}

### Assignment

{% codeblock Assignment lang:zig %}
(const|var) identifier[: type] = value
{% endcodeblock %}

想必无需多言，毕竟这种 `Assignment` 已经见怪不怪了罢!
当然，一般来说 `type` 可以自动推导。

### identifier
注意，这里的 `identifier` 可以支持更多的写法
```zig
const @"if" = 1;
const @"1" = @"if";
const @"1 == 2" = false;
```
只需要 以 `@"[identifier]"` 的写法就可以随性书写!

### Arrays

{% blockquote %}
以下全部遵循如下规则: `T:type`
有关更多的东西参照 `Slices`, `Pointers`
{% endblockquote %}
`[N]T`可以创建一个`Arrays`, 同时，`[_]T`可以使其自动推导长度

### If

{% note warning modern %}
这里与 `c++` 有很大区别
`if`语句只支持一种情况的判断: `true/false`
又，根据 `zig` 不会进行隐式类型转换(**`int`等类型不会自动转换为`bool`, 相反，这时 `if` 会判断其是否不是 `null`**)
{% endnote %}

值得指出的是，`if` 语句可以直接当作表达式使用(其他所有语句皆如此，会特殊说明)

```zig
const @"if true" = if (true) 1 else 2;
```