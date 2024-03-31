---
title: 电子书编辑杂录
date: 2024-03-31 12:55:13
tags:
  - typescript
  - kindle
  - e-book
---

## Preface

For the leaking of python learning, I chose typescript to deal with the e-book editing works.

It's recommended that use `bun` to run the scripts.

## Commits Creator

{% note warning modern %}
Acknowledgements:

derive the pages in calibre, then use this in the superior folder.

{% endnote %}

```ts

import fs from 'fs';

const files = fs.readdirSync("./text");

for (const file of files) {
  let text = fs.readFileSync(`./text/${file}`, "utf8");
  const reg=/(?<=<sup.*?)［([〇一二三四五六七八九十]+)］/g;
  // replace to <a id="nfN" href="#nfN">[N]</a>
  let n:number=0; // just distribute the ids for footnotes, ingeniously
  let m:RegExpExecArray | null;
  while ((m = reg.exec(text)) != null) {
    const id = `nf${n}`;
    console.log(m.index, m);
    // for preventing the unlimited loop, just use [] take place the Chinese char-set ones ingeniously.
    text = text.replace(m[0], `<a id="r-${id}" href="#${id}">[${m[1]}]</a>`).replace(m[0], `<a id="${id}" href="#r-${id}">[${m[1]}]</a>`);
    ++n;
  }
  fs.writeFileSync(`./out/${file}`, text);
}

```

## Layer for Table of Contents(creation of wenku8)

for the automatic creation of wenku8, the table of contents may be useless and redundant.

This semi-automatic tool is fast but rude.

{% note warning modern %}
Acknowledgements:

0. the most importantly, you must remove the id and playOrders of navPoints  

1. for "短篇"-chapter, you should use calibre to deal with(usually they will be combined into the previous chapter)  

2. for the redundant names, you should remove by yourself(I cannot predict the categories situation of all books)  
{% endnote %}

```ts

import fs from "node:fs"

let filename="toc.ncx";

// At first, delete all the navPoint's id and playOrder

(async()=>{
  
  let content: string = fs.readFileSync(filename, 'utf8');
  
  let indexRegex = /第.*?卷/g;

  let result: {pos:number, name: string, src: string}[] = [{pos: 0, name: "", src: ""}];
  let regRes = content.matchAll(indexRegex);

  // collet to an array
  let regResArray = [...regRes];

  if(regRes === null){return;}
  
  let pre = 42; // <navPoint

  for (let i=0;i<regResArray.length-1;++i){
    let { 0:match, index: pos} = regResArray[i];
    if(pos==undefined) throw new Error("pos is undefined");
    let next = regResArray[i+1][0];
    // if(match !== next && result[result.length-1].name === match) // the last one
    //   result[result.length-1].end=content.indexOf("</navPoint>", pos);
    if(match === result[result.length-1].name || next !== match) continue;
    // get (.*?) of src="(.*?)"
    let srcL = content.indexOf('src="', pos);
    let srcR = content.indexOf('"', srcL+5);
    let src = content.slice(srcL+5, srcR);
    result.push({pos: pos-pre, name: match, src: src});
  }

  result.shift();
  // console.log(result);

  let fd = fs.openSync(filename+'.xml', "w");

  function getNavpoint(name:string, src:string, content:string): string {
    return `
    <navPoint>
      <navLabel>
        <text>${name}</text>
      </navLabel>
      <content src="${src}"/>
      ${content.replaceAll(name + ' ', "")}
    </navPoint>
    `
  }

  fs.writeSync(fd, content.slice(0, result[0].pos));
  for(let i=0;i<result.length;++i){
    let {pos, name, src} = result[i];
    // console.log(pos, end);
    let end = result[i+1]?.pos;
    if(end===undefined) end = content.length-1;
    fs.writeSync(fd, getNavpoint(name, src, content.slice(pos, end)));
  }

})()

```
