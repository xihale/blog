---
title: "AUR 包发布指南"
pubDate: "2023-07-16"
updatedDate: "2024-12-07"
description: "AUR 包发布流程：从准备到上传 Arch Linux 用户仓库"
tags: ["技术"]
comments: true
draft: false
---


## 前言

第一次发 AUR 包的时候因为没仔细看规则吃了不少亏，这里记一下完整的流程。

## 准备

先过一遍官方要求：[AUR submission guidelines](https://wiki.archlinux.org/title/AUR_submission_guidelines)。

然后是包名，注意：**必须小写**。参考 [Package naming](https://wiki.archlinux.org/title/Arch_package_guidelines#Package_naming)。

## 克隆仓库

```shell
git -c init.defaultbranch=master clone ssh://aur@aur.archlinux.org/$YourPackageName.git
```

如果报 `git-upload-pack: invalid repository name`，说明包名不符合规范，回去检查 submission guidelines。

## 编写 PKGBUILD

克隆下来的仓库里会有一个模板 `PKGBUILD`，照着填就行。几个关键字段：

```shell
pkgname=your-package
pkgver=1.0.0
pkgrel=1
pkgdesc="一句话描述"
arch=('x86_64')
url="https://github.com/yourname/your-package"
license=('MIT')
depends=()
source=("https://github.com/yourname/your-package/archive/v${pkgver}.tar.gz")
sha256sums=('SKIP')
```

如果是从源码构建，通常需要 `makedepends`（比如 `cargo`、`go`、`cmake` 等）。写完后用 `makepkg -f` 本地测试一下，确保能正常构建。

## 发布

```shell
makepkg --printsrcinfo > .SRCINFO
git add PKGBUILD .SRCINFO
git commit -m "update to v1.0.0"
git push
```

`.SRCINFO` 必须和 `PKGBUILD` 一起提交，它是 AUR 前端展示信息的来源。每次改了 `PKGBUILD` 都要重新生成。

## 常见坑

- **包名大写**：不行，AUR 只接受小写。
- **忘记 .SRCINFO**：推送了 PKGBUILD 但没更新 .SRCINFO，AUR 页面不会更新。
- **sha256sums 用 SKIP**：本地开发时可以跳过校验，但正式发布建议用 `makepkg -g` 生成真实的 hash。
- **依赖写漏**：`makepkg` 不会自动处理依赖，测试时用 `makepkg -s` 可以自动安装 `makedepends`。
