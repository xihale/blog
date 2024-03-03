---
title: Kindle Highlights
date: 2024-03-02 17:49:56
tags:
  - typescript
  - kindle
---

## Preface

`Kindle` 的 `Clippings` 的处理真是令我大开眼界, 一大堆重复的(子集关系), 并且还有很多无用的冗余信息!

## Content

> TODO: 书籍分类

没写有关书籍分类的内容, 所以使用前应去[Kindle 批注导出](https://clippings.io/)导出具体书籍的批注然后使用脚本, 仅仅是去除空行以及把每句话的无效字符去掉.

```typescript

const cfg = {
  file: "clippings.txt",
  book: "重启咲良田"
}

import fs from "node:fs";

function trim(s: string) {
  return s.replace(/(^。*)|(^\s*)|(\s*$)/g, "");
}

let filename = cfg.file;
let content = fs.readFileSync(filename, "utf8");

let lines = content.split("==========\n")
  .filter(s=>s.startsWith(cfg.book))
  .map(s => trim(s.split("\n").slice(-2)[0]))
  .filter(s => s !== "");

// console.log(lines)

let result: string[] = [lines[0]];

// 取内容最全的一行
for (let i = 1; i < lines.length; ++i) {
  let l = result.length - 1;
  if (lines[i].includes(result[l]))
    result[l] = lines[i];
  else if (!result[l].includes(lines[i]))
    result.push(lines[i]);
}

// console.log(result);

fs.writeFileSync(filename + ".bak", result.join("\n"), "utf8");
```

