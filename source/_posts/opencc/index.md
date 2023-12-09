---
title: opencc
date: 2023-10-28 22:22:44
tags:
  - [opencc]
  - [cpp]
categories:
  - [toy]
---

## Preface

最近在 读 『人类衰退之后』, 发现繁体字实在太多导致难以辨认  
便使用 opencc 将其转为简体

## Implement

~~由于考虑到不会有写数据冲突的情况就没有加互斥锁了~~

{% note info modern %}
请使用 `c++17` 以上 `Standard` 进行编译
{% endnote %}

{% note warning modern %}
当文件多起来了, 这样使用 `thread` 大概会拖慢程序, 建议实现一个简单的负载均衡
{% endnote %}

```cpp
#include <iostream>
#include <fstream>
#include <string>
#include <filesystem>
#include <thread>
#include <forward_list>
#include "opencc/opencc.h"

using namespace std;

const auto converter=opencc::SimpleConverter("t2s.json");

void cov(const string filepath){
  ifstream s(filepath);
  ofstream o("./out/"+filepath);
  string a(0, 1024);
  // getline: UNICODE 由可多位 char(u8) 组成 [其实只要非 UNICODE 字符结尾就好, 为了方便, 用 getline ]
  while(s){
    getline(s, a);
    o<<converter.Convert(a)<<'\n';
  }
}

void solve(const string &path){
  using namespace filesystem;

  forward_list<thread> threads;
  if(!exists("./out/"+path))
    create_directory("./out/"+path);
  for (const auto & entry : directory_iterator(path)){
    if(entry.is_directory()){
      solve(entry.path().string()); // 递归处理
      continue;
    }
    threads.push_front(thread(cov, entry.path().string()));
    // cov(entry.path().string());
  }

  for (auto & t : threads)
    t.join();
}

int main(){

  if(!filesystem::exists("./out"))
    filesystem::create_directory("./out");

  solve("./source");

  return 0;
}
```