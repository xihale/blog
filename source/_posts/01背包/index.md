---
date: 2022-02-26
title: 01背包问题
tag: dp
hidden: true
---

## 序

早就开始学`dp`了，但是，进度缓慢...

## 言

> 设背包容量为`10`,物品数量为`5`
>
> 物品的容量占用和价值分别为:
>
> `[2,5,4,2,3]`和`[6,3,5,4,6]`

首先我们把大问题转换为小问题

既然要求容量为`10`的最大价值，那就可以先求出容量为`<10`的最大价值