---
title: "慎用 JavaScript 闭包，警惕内存泄漏"
pubDate: "2026-03-02"
description: "深入解析 JavaScript 闭包的 shared lexical environment 机制，揭示长生命周期场景中的隐性内存泄漏与替代方案。"
---

## 背景

本文记录了由 [把闭包改成 bind 后产生巨大内存优化 - Claude Code OSS](https://x.com/jarredsumner/status/2017825694731145388) 这一讨论引发的思考，以及在探索过程中对于一些常见误区的纠正和总结。

首先介绍一下 JavaScript 中的 `shared lexical environment`（共享词法环境）。

[Emulating private methods with closures - MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Closures#emulating_private_methods_with_closures)

简单来说，如果一个作用域（Lexical Environment）内创建了多个闭包，经过 JavaScript 引擎静态分析后，这些闭包所捕获的变量会被统一合并到一个大的 `Context`（上下文对象）中，这相当于所有闭包捕获变量的并集。正如 MDN 示例中那样，这里的 `Context` 就类似于那个共享的 `counter` 变量。

关于共享词法环境的内存泄漏问题稍后再谈，我们先来看看日常开发中最常用的两种闭包声明方式。

## `function` 和 `=>`（箭头函数）的区别

为了编写代码的便利，我们经常使用 JavaScript 的闭包特性；同理，出于代码简洁的考虑，我们也非常偏爱箭头函数（`=>`）。

这两种函数在作为闭包使用时，在底层环境记录（Environment Record）的绑定机制上存在区别。`function` 更像是一个独立的个体，在执行时会创建具有自己独立 `this` 和 `arguments` 的环境记录；而箭头函数 `=>` 没有自己的 `this` 和 `arguments`，在它的函数体中引用这些变量时，会如同普通变量一样，通过词法作用域链（Lexical Scope Chain）向外层查找并继承。

具体可以参考：[Arrow function expressions - MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions)

对于变量捕获而言，早前有人认为箭头函数会导致捕获更多的外部变量。但在现代 JavaScript 引擎（如 V8）的强大静态分析与优化下，尽管它们在语法和作用域绑定规则上有所不同，最终它们在闭包变量捕获和内存表现上是基本等价的。

**结论**：在现代开发环境中，这两种写法根据对代码简洁度及 `this` 绑定的需求选择即可。除非需要动态绑定 `this` 或用作构造函数时必须选用 `function`，否则两者在开销上无需过度纠结。

## 长生命周期场景下应尽量避免使用闭包

正如前文提到，由于 `shared lexical environment` 机制，同一个作用域内创建的所有闭包会共享同一个闭包上下文（Context）。这个共享的 `Context` 的生命周期，取决于这些闭包中**存活时间最长的那个**。

这就意味着，即使某个无限期存活的闭包仅仅捕获了一个微不足道的小变量，整个包含了其他占用大量内存的变量的共享 `Context` 也会随之常驻内存中，无法被垃圾回收（GC）。只要该闭包没有被释放，整个 Context 及其内部的**所有引用**（哪怕是其他已经消亡的闭包所捕获的庞大对象）就会被强制保留。在某些情况下（如 DOM 事件监听、全局定时器、长连接回调等闭包声明可能无限长生命周期的场景），这会造成极其隐蔽但极为严重的内存泄漏。

当然，可以用以下一些替代方案。

### `bind`

```diff
- signal.addEventListener('abort', () => controller.abort());
- const timeout = setTimeout(() => controller.abort(), 5_000);
+ const abort = controller.abort.bind(controller);
+ signal.addEventListener('abort', abort);
+ const timeout = setTimeout(abort, 5_000);
```

`bind` 可以直接将方法的 `this` 绑定为特定的对象（如 `controller`），避免为了单纯调用方法而额外创建一层闭包，导致外层作用域的 `Context` 被意外捕获，带来生命周期的污染。

### `setTimeout` / `setInterval` 传参

```diff
+ // 必须将此函数定义在引发泄漏的外层作用域之外（如模块顶部）
+ function abortWithReason(controller, reason) {
+   controller.abort(reason);
+ }
+
  function schedule() {
-   const timeout = setTimeout(() => abortWithReason(controller, reason), ms);
+   const timeout = setTimeout(abortWithReason, ms, controller, reason);
  }
```

浏览器和 Node.js 的定时器 API 原生支持传入额外参数。将状态显式作为参数传递给**定义在外部作用域的**具名函数，可以避免在当前作用域内创建匿名闭包，从而完美避开外层 Context 的捕获。

### `handleEvent` 对象监听器（DOM）

```diff
+ // 必须将类或原型定义在引发泄漏的作用域之外
+ class AbortListener {
+   constructor(c) { this.c = c; }
+   handleEvent() { this.c.abort(); }
+ }
+
  function setup(signal, controller) {
-   signal.addEventListener('abort', () => controller.abort());
+   signal.addEventListener('abort', new AbortListener(controller));
  }
```

对于 DOM 事件监听，可以利用对象 `handleEvent` 作为监听器的特性，将状态挂载为对象属性。**这里有一个极易踩坑的认知误区**：作为解决方案，这个 `handleEvent` 的宿主对象或类必须被提取到外部作用域去定义！由于 V8 分配作用域上下文的方式，如果只是直接在原函数内部写字面量 `{ handleEvent() {} }`，那么 `handleEvent` 作为一个内联创建的新函数，它的词法作用域依然会默默把当前包裹它的 `Context` 给捕获进去，起不到任何规避泄漏的作用。

### 状态表 + ID（适合超长生命周期任务）

```diff
+ // 同样，执行解包任务的方法必须定义在外部作用域中
+ function runJobById(jobId) {
+   const state = stateTable.get(jobId);
+   if (!state) return;
+   runJob(state.jobConfig, state.cache);
+ }
+
  function arrangeJob() {
-   scheduler.enqueue(() => runJob(jobConfig, cache));
+   const jobId = Symbol('job');
+   stateTable.set(jobId, { jobConfig, cache });
+   scheduler.enqueue(runJobById, jobId);
  }
```

对于可能长时间挂起的任务，把“重状态”移到可控的外部容器（如 `Map` 或 `WeakMap`）中统一管理，回调仅传递一个轻量级的 `ID`。只要把解包 ID 的函数定义在外部作用域，就可以彻底切断内联回调产生的 `shared lexical environment` 保留风险。

## 附录

在此附带一份由 AI 辅助生成的实验报告，测试过程详见仓库：[xihale/js_shared_lexical_environment](https://github.com/xihale/js_shared_lexical_environment)
