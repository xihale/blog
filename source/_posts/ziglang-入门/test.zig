const std = @import("std");
const expect = std.testing.expect;
const expectEqual = std.testing.expectEqual;

test "bitCast" {
    const a: i2 = -1;
    const b: u2 = @bitCast(a);

    try expect(b == 3);
}

test "addWithOverflow" {
    const a: u1 = 1;
    const b: u1 = 1;
    const c: struct { @TypeOf(a, b), u1 } = @addWithOverflow(a, b);

    try expectEqual(c, .{ 0, 1 });
}

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

fn add(a: i32, b: i32) i32 {
    return a + b;
}

test "inline function call" {
    try expect(@call(.always_inline, add, .{ 3, 9 }) == 12);
}

test "cDefine" {
    const c = @cImport({
        @cDefine("TEST", "1");
    });
    try expect(c.TEST == 1);
}

test "clz" {
    try expect(@clz(@as(u2, 1)) == 1);
}

test "divExact" {
    try expect(@divExact(4, 2) * 2 == 4);
}

test "select" {
    const pred = @Vector(3, bool){ true, false, true };
    const a = @Vector(3, u8){ 1, 1, 1 };
    const b = @Vector(3, u8){ 0, 0, 0 };

    try expectEqual(@select(u1, pred, a, b), @Vector(3, u8){ 1, 0, 1 });
}

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

test "typeInfo" {
    try expect(@typeInfo(@TypeOf(add)) == .Fn);
}
