---
title: rust-playground
date: 2023-06-03 20:28:54
tags: rust cargo
---

## 前言
今天心血来潮，想学一下 `rust` ，那就搭一下本地的 `playground` 和 `docs` 环境吧
> [Rust Playground](https://github.com/rust-lang/rust-playground/)
> [Google's comprehensive-rust proj](https://github.com/google/comprehensive-rust)

## 开始

{% note warning simple %}
`playground` 是可选操作，不影响 `book` 的 构建和查看
{% endnote %}
### playground

#### clone the repo
```bash
git clone git@github.com:rust-lang/rust-playground.git
```

#### docker installtion
```bash
sudo pacman -S docker
systemctl start docker
```
{% note warning simple %}
如果这里 `docker` 启动不成功，注销重新登陆/重启电脑大概可以解决问题(我所遇者)
{% endnote %}

{% note info simple %}
At first, turn into the workplace
```bash
cd ../rust-playground
```
{% endnote %}
<!--{% note info simple %}
这里有一些选择性的工作，我不知道他是否有用
```bash
cd compiler
./build.sh # If you want to test changes to the containers
```
{% endnote %}-->

#### 构建 UI 文件
```bash
cd ../ui/frontend
yarn
yarn run watch # Will rebuild and watch for changes
```
{% note warning simple %}
If you got the ERROR: `The engine "node" is incompatible with this module.`
```bash
yarn config set ignore-engines true
```
{% endnote %}

#### 修改配置 && 运行

这里我们使用 `shepmaster/rust-stable` 而非 `rust-stable` (`rust-stable` `pull` 不了)  
此时，我们要把 `ui/src/sandbox.rs` 中的 `Stable => "rust-stable"` 改为 `Stable => "shepmaster/rust-stable"`
将 `ui/src/main.rs` 中的 `cors_enabled` 的值改为 `env::var_os("PLAYGROUND_CORS_DISABLED").is_none()` (这是为了跨域的方便，如果不想跨域，`set PLAYGROUND_CORS_DISABLED` 再运行 `cargo run` 即可)
> 此处 `pull` 操作可能需要代理
```bash
cd ../
docker pull shepmaster/rust-stable
cargo run
```

#### 结束
最后 打开 [Playground-local](http://127.0.0.1:5000)

### book build

```bash
git clone git@github.com:google/comprehensive-rust.git
cd comprehensive-rust
cargo install mdbook
cargo install mdbook-svgbob
cargo install mdbook-i18n-helpers
cargo install --path mdbook-exerciser
```
#### 启动
```bash
mdbook serve
```
{% note warning simple %}
如果 `mdbook` 运行不成功，可能是 `env` 没有设置好，运行以下命令即可  
```bash
echo "export PATH=\$HOME/.cargo/bin/:\$PATH" >> ~/.zshrc
```
{% endnote %}

{% note warning simple %}
`playground` 能正常运行后可以继续以下步骤，使 `book` 可以完全离线运行
{% endnote %}

将 `comprehensive-rust/third_party/mdbook/book.js` 内的 `https://play.rust-lang.org` 全部换成 `http://127.0.0.1:5000`


## 其他
如果需要修改 `port` 等配置，请在 `comprehensive-rust/ui/src/` 下的文件查找
例如， `port` 在 `main.rs` 中有定义
