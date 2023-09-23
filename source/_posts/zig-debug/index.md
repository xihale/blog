---
title: zig debug
date: 2023-09-01 10:46:10
tags:
  - [zig]
---

## Preface

It's likely to cpp.

## configure

via `launch.json`

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Launch",
      "type": "cppdbg",
      "request": "launch",
      "program": "${workspaceFolder}/zig-out/bin/build",
      "preLaunchTask": "build",
      "cwd": "${workspaceFolder}"
    }
  ]
}
```

via `tasks.json`

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "build",
      "type": "shell",
      "command": "zig build"
    }
  ]
}
```

via `build.zig`

```zig
const Builder = @import("std").build.Builder;

pub fn build(b: *Builder) void {
    const target = b.standardTargetOptions(.{});
    const optimize = b.standardOptimizeOption(.{});

    var exe = b.addExecutable(.{
        .name = "build",
        .root_source_file = .{ .path = "src/main.zig" },
        .target = target,
        .optimize = optimize,
    });

    b.installArtifact(exe);
}

```

test file via `main.zig`

```zig
const std = @import("std");

pub fn main() void {
    var f = packed struct {
        a: u4,
        b: u4,
    }{ .a = 1, .b = 1 };

    std.debug.print("{}\n", .{f});
}

```

And then you can set breakpoints to debug it!

## Something else

### gdb

```shell
# print veriable via binary based
-exec print /t f
```
