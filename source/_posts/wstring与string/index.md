---
date: 2022-02-03
title: wstring与string
tags: cpp
---

## 序

写`SMFL`图形化程序的时候遇到了中文显示问题，然后发现用宽字符(`wideCharacters`:`w_char_t`,`wstring`)可以解决问题

但是后来发现`wstring`的中文输入有问题，就用`string`来输入了，结果，他们之间没有转换函数...

## 言

> 然后主要就是通过`codecvt`字符编码类来间接转换字符类型

```cpp
#include <string>
#include <cwchar>
#include <codecvt>

inline std::wstring to_wide_string(const std::string& input){
	std::wstring_convert<std::codecvt_utf8<wchar_t>> converter;
	return converter.from_bytes(input);
}
// convert wstring to string 
inline std::string to_byte_string(const std::wstring& input){
	std::wstring_convert<std::codecvt_utf8<wchar_t>> converter;
	return converter.to_bytes(input);
}
```

