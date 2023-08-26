---
title: ziglang 入门
date: 2023-07-27 20:38:49
tags: 
  - zig
  - learn
shiki:
  enable: true
  theme: one-dark-pro
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

## 重要

### Builtin functions
{% note info modern %}
首先,所有的 `builtin functions` 都遵循原则: 使用 `@` 前缀
同时, 很多都有使用 `comptime` 变量
{% endnote %}

#### `@This`
```zig
@This() type
```
适用于匿名 `struct` 引用自身
```zig
struct {
    const Self = @This();

    items: []u8,

    fn length(self: Self) usize {
        return self.items.len;
    }
};
```

#### `@src`
```zig
@src() std.builtin.SourceLocation
```
```zig
test "@src" {
    try doTheTest();
}

fn doTheTest() !void {
    const src = @src();

    try expect(src.line == 9);
    try expect(src.column == 17);
    try expect(std.mem.endsWith(u8, src.fn_name, "doTheTest"));
    try expect(std.mem.endsWith(u8, src.file, "test_src_builtin.zig"));
}
```

#### `@as`
```zig
@as(comptime T: type, expression) T
```
类型强制转换函数, 类似于 `cpp` 的 `*_cast<>`

#### `@typeInfo`
```zig
@typeInfo(comptime T: type) std.builtin.Type
```

#### `@typeName`
```zig
@typeName(T: type) *const [N:0]u8
```

#### `@TypeOf`
```zig
@TypeOf(...) type
```
```zig
test "no runtime side effects" {
    var data: i32 = 0;
    const T = @TypeOf(foo(i32, &data));
    try comptime expect(T == i32);
    try expect(data == 0);
}

fn foo(comptime T: type, ptr: *T) T {
    ptr.* += 1;
    return ptr.*;
}
```

#### `@field`
```zig
@field(lhs: anytype, comptime field_name: []const u8) (field)
```
```zig
const Point = struct {
    x: u32,
    y: u32,

    pub var z: u32 = 1;
};

test "field access by string" {
    var p = Point{ .x = 0, .y = 0 };

    @field(p, "x") = 4;
    @field(p, "y") = @field(p, "x") + 1;

    try expect(@field(p, "x") == 4);
    try expect(@field(p, "y") == 5);
}

test "decl access by string" {
    try expect(@field(Point, "z") == 1);

    @field(Point, "z") = 2;
    try expect(@field(Point, "z") == 2);
}
```

#### `@hasDecl`
```zig
@hasDecl(comptime Container: type, comptime name: []const u8) bool
```
检测 `declaration`
```zig
const Foo = struct {
    nope: i32,

    pub var blah = "xxx";
    const hi = 1;
};

test "@hasDecl" {
    try expect(@hasDecl(Foo, "blah"));

    // Even though `hi` is private, @hasDecl returns true because this test is
    // in the same file scope as Foo. It would return false if Foo was declared
    // in a different file.
    try expect(@hasDecl(Foo, "hi"));

    // @hasDecl is for declarations; not fields.
    try expect(!@hasDecl(Foo, "nope"));
    try expect(!@hasDecl(Foo, "nope1234"));
}
```

#### `@hasField`
```zig
@hasField(comptime Container: type, comptime name: []const u8) bool
```
检测 `field`

#### `@embedFile`
```zig
@embedFile(comptime path: []const u8) *const [N:0]u8
```
插入文件

#### `@memcpy`
```zig
@memcpy(noalias dest, noalias source) void
```
#### `@memset`
```zig
@memset(dest, elem) void
```

#### `@export`
```zig
@export(declaration, comptime options: std.builtin.ExportOptions) void
```
导出 c 语言库
```zig
comptime {
    @export(internalName, .{ .name = "foo", .linkage = .Strong });
}

fn internalName() callconv(.C) void {}
```
等价于
```zig
export fn foo() void {}
```

#### `@select`
```zig
@select(comptime T: type, pred: @Vector(len, bool), a: @Vector(len, T), b: @Vector(len, T)) @Vector(len, T)
```
从 `a` 或 `b` 取值

```zig
test "select" {
    const pred = @Vector(3, bool){ true, false, true };
    const a = @Vector(3, u8){ 1, 1, 1 };
    const b = @Vector(3, u8){ 0, 0, 0 };

    try expectEqual(@select(u1, pred, a, b), @Vector(3, u8){ 1, 0, 1 });
}
```

#### `@call`
```zig
@call(modifier: std.builtin.CallModifier, function: anytype, args: anytype) anytype
```

```zig
fn add(a: i32, b: i32) i32 {
    return a + b;
}

test "inline function call" {
    try expect(@call(.always_inline, add, .{ 3, 9 }) == 12);
}
```

#### `@bitCast`
```zig
@bitCast(value: anytype) anytype
```
类型转换函数

```zig
test "bitCast" {
    const a: i2 = -1;
    const b: u2 = @bitCast(a);

    try expect(b == 3);
}
```

#### `@addrSpaceCast`
```zig
@addrSpaceCast(ptr: anytype) anytype
```
{% note info modern %}
作用: 将指针从一个地址空间转换为另一个地址空间。(根据结果类型推断)
注意: 此强制转换可能是无操作、复杂操作或非法。
如果强制转换是合法的，则生成的指针指向与指针操作数相同的内存位置。在同一地址空间之间强制转换指针始终有效。
{% endnote %}

#### `@divExact`
```zig
@divExact(numerator: T, denominator: T) T
```
保证遵循(否则报错): 
1. @divExact(6, 3) == 2
2. @divExact(a, b) * b == a
```zig
test "divExact" {
    try expect(@divExact(4, 2) * 2 == 4);
}
```

#### `@addWithOverflow`
```zig
@addWithOverflow(a: anytype, b: anytype) struct { @TypeOf(a, b), u1 }
```
执行 a + b 并返回包含结果和可能的溢出位的元组。
```zig
test "addWithOverflow" {
    const a: u1 = 1;
    const b: u1 = 1;
    const c: struct { @TypeOf(a, b), u1 } = @addWithOverflow(a, b);

    try expectEqual(c, .{ 0, 1 });
}
```
#### `@mulWithOverflow`
```zig
@mulWithOverflow(a: anytype, b: anytype) struct { @TypeOf(a, b), u1 }
```

#### `@bitOffsetOf`
```zig
@bitOffsetOf(comptime T: type, comptime field_name: []const u8) comptime_int
```
位偏移量
```zig
test "bitOffsetOf" {
    const MyStruct = struct {
        field1: bool,
        field2: u7,
        field3: u15,
    };
    const offsetField1 = @bitOffsetOf(MyStruct, "field1");
    const offsetField2 = @bitOffsetOf(MyStruct, "field2");
    const offsetField3 = @bitOffsetOf(MyStruct, "field3");

    try expect(offsetField1 == 16 and offsetField2 == 24 and offsetField3 == 0);

    const MyPackedStruct = packed struct {
        field1: bool,
        field2: u7,
        field3: u15,
    };

    const offsetField4 = @bitOffsetOf(MyPackedStruct, "field1");
    const offsetField5 = @bitOffsetOf(MyPackedStruct, "field2");
    const offsetField6 = @bitOffsetOf(MyPackedStruct, "field3");

    try expect(offsetField4 == 0 and offsetField5 == 1 and offsetField6 == 8);
}
```

#### `@offsetOf`
```zig
@offsetOf(comptime T: type, comptime field_name: []const u8) comptime_int
```
字节偏移量

#### `@bitSizeOf`
```zig
@bitSizeOf(comptime T: type) comptime_int
```

#### `@bitReverse`
```zig
@bitReverse(integer: anytype) T
```

#### `@cImport`
```zig
@cImport(expression) type
```
分析并导入 `c` 语言有关的 `expression`
在其中可以使用 `@cInclude` `@cDefine` `@cUndef`

{% note warning modern %}
为了防止clang的多次调用, 并防止内联函数被复制, 整个程序应该至多有一个 `@cImport`
但特殊情况使用多个可以达到以下好处:
1. 避免符号冲突
2. 使用不同的预处理器定义分析 C 代码
{% endnote %}

#### `@cDefine`
```zig
@cDefine(comptime name: []const u8, value) void
```
此功能只能在 中 @cImport 发生。
这会追加 #define $name $value 到 @cImport 临时缓冲区。

```zig
test "cDefine" {
    const c = @cImport({
        @cDefine("TEST", "1");
    });
    try expect(c.TEST == 1);
}
```

#### `@clz`
```zig
@clz(operand: anytype) anytype
```
计算前导零
{% note warning modern %}
operand: integer | vector
{% endnote %}
```zig
test "clz" {
    try expect(@clz(@as(u2, 1)) == 1);
}
```

#### `@ctz`
```zig
@ctz(operand: anytype) anytype
```
清除尾随零

#### `@compileError`
```zig
@compileError(comptime msg: []const u8) noreturn
```

#### `@compileLog`
```zig
@compileLog(args: ...) void
```

#### `@breakpoint`
```zig
@breakpoint() void
```
插入断点

#### `@trap`
```zig
@trap() noreturn
```
陷阱/干扰指令, 异常退出程序

#### `@alignCast`
```zig
@alignCast(ptr: anytype) anytype
```
ptr 可以是 *T 、 ?*T 或 []T 。更改指针的对齐方式。要使用的对齐方式是根据结果类型推断的。
将指针对齐安全检查添加到生成的代码中，以确保指针按承诺对齐。

#### `@alignOf`
```zig
@alignOf(comptime T: type) comptime_int
```
此函数返回此类型应对齐的字节数，以便当前目标与 C ABI 匹配。当指针的子类型具有此对齐方式时，可以从类型中省略该对齐方式。

```zig
const assert = @import("std").debug.assert;
comptime {
    assert(*u32 == *align(@alignOf(u32)) u32);
}
```

## 归纳 Futures

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