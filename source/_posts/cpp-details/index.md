---
title: cpp details
date: 2023-11-11 07:55:16
tags:
---

## Preface

~~竞赛真是害人不浅呐~~, `c++17` 后诸多 `interests` 都没有涉猎, 故在此补上

## Start

### string_view

[cppreference](https://en.cppreference.com/w/cpp/string/basic_string_view)  
这个相当于 `rust` 中的 `slice` 能够具有和 `const char *` 相同的速度和性能  
其本质上只存 指针和长度(是基于 [`span`](https://en.cppreference.com/w/cpp/container/span) 的实现)

### Filesystem

[cppreference](https://en.cppreference.com/w/cpp/filesystem)   

这是一个很实用的工具集, 再次简单举例

```cpp
namespace fs = std::filesystem;

fs::path p = fs::current_path();

// scan directory
for (const auto& entry : fs::directory_iterator(p)) {
  std::cout << entry.path() << std::endl;
}

// directory and file manipulation
fs::create_directory(p / "new_dir");
fs::remove(p / "new_dir");
fs::create_file(p / "new_file.txt");
fs::remove(p / "new_file.txt");

```

### optional

[cppreference](https://en.cppreference.com/w/cpp/utility/optional)  
这个和其他高级语言的设计差不了多少

```cpp
assert(std::nullopt == std::optional<int>{});
assert(8 == std::optional<int>{8}.value());
assert(9 == std::optional<int>{}.value_or(9));
```

### range

[cppreference](https://en.cppreference.com/w/cpp/algorithm/ranges)  
区间方便的处理库  

```cpp
std::vector<int> v{1, 2, 3, 4, 5, 6, 7, 8, 9, 10};

int sum = std::ranges::accumulate(v, 0);
int product = std::ranges::accumulate(v, 1, std::multiplies<int>());

int max = *std::ranges::max_element(v);
int mid = *std::ranges::next(std::ranges::begin(v), v.size() / 2);

int sum_of_squares = std::ranges::accumulate(
    std::ranges::views::transform(v, [](int x) { return x * x; }), 0
)

```

### accumulate

[cppreference](https://en.cppreference.com/w/cpp/algorithm/accumulate)  
这个就是 `rust` 的 `fold`

```cpp
std::vector<int> v{1, 2, 3, 4, 5, 6, 7, 8, 9, 10};

int sum = std::accumulate(v.begin(), v.end(), 0); // 默认是累加
int product = std::accumulate(v.begin(), v.end(), 1, std::multiplies<int>());

assert(sum == 55);
assert(product == 3628800);
```

### variant

[cppreference](https://en.cppreference.com/w/cpp/utility/variant)  
大概是 `rust` 中的 `union(enum)`

```cpp
struct A {
  std::variant<int, std::string> v;
}a(8), b("hello");
```

### identity

[cppreference](https://en.cppreference.com/w/cpp/utility/functional/identity)  
其实就是 `forward` 的一个上层实现

```cpp

struct A{
  int x;
  std::string_view y;
}a{8, "hello"};

void print(A &&r, std::identity proj = {}){
  cout<<proj(r)<<endl;
}

print(a, &A::x);
print(a, &A::y);
print(a, [](A &r){return to_string(r.x)+r.y;});

```

## attention

### move

我之前一直以为 `c++` 没有 `lifetime` (所有权) 的机制, 其实是有的

编译器在大部分情况会帮我们优化到 `move` 机制比如函数返回值, 当然, 也可以显示调用

{% note info modern %}
大概可以理解为 `引用的引用(类似于底层指针)` 罢
{% endnote %}

```cpp
string a = "hello";
string b = move(s);

assert(a == "");
assert(b == "hello");
```

一个函数中 `move` 的例子

{% note info modern %}  

这里的 func 得显示声明 右值引用, 因为这种情况(返回参数的右值)编译器会选择返回一个左值的 `Copy`(避免返回悬空引用), 大概如此, 我也不清楚什么情况下会出现悬空引用  

{% endnote %}

```cpp
string &&func(string &&s){
  s.push_back('!');
  return std::move(s);
}
func("hello"); // 这里会自动 convert
string s = "hello";
func(std::move(s));
```

此处为何要调用如此多的 `move`?
你可以把 `move` 理解为转移(他也的确是转移), 不过是在使用之后进行必要的转移罢了.

