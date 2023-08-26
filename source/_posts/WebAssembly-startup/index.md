---
title: WebAssembly startup
date: 2023-08-09 20:23:01
tags: 
  - wasm
  - zig
  - learn
---

# Preface

Why use WebAssembly?
Just for freestanding and comfortable!

{% note info modern %}
I use `zig`, `wasmtime` and `Web Js` to show the instances.
{% endnote %}

# Startup

## Backend

### Complier to wasm32-freestanding

```sh
zig build-lib main.zig -target wasm32-freestanding --name a -dynamic -rdynamic
```

{% note info modern %}
`target`: [Targets](https://ziglang.org/documentation/master/#Targets)
`dynamic`: linking dynamic
`rdynamic`: export all symbols
{% endnote %}

### `export`

```zig
export fn re() *u8 {
    var a = [_:0]c_int{ 1, 2, 3, 4 };
    return @ptrCast(&a);
}

export var b = [_]u8{ 1, 2, 3, 4 };
```

## Frontend

### Load instance from `.wasm`

```js
var instance;
WebAssembly.instantiateStreaming(fetch("a.wasm"), {
  env: {
    print: console.log, // pass the functions/variables
  },
})
  .then((result) => result.instance)
  .then((instance) => {
    // pass instance out
    window.instance = instance;
  });
```

#### Exports

```js
instance.exports;
```

### Some useful interface

#### Get the array from buffer.

{% note info modern %}
docs: [Int16Array](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Int16Array)
{% endnote %}

```js
new Int8Array([memory.buffer], [Pointer], [len]);
new Int16Array([memory.buffer], [Pointer], [len]);
new Int32Array([memory.buffer], [Pointer], [len]);
```
```js example
new Int16Array(instance.exports.memory.buffer, instance.exports.b, 4);
```
