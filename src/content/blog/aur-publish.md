---
title: "aur publish"
pubDate: "2023-07-16"
updatedDate: "2024-12-07"
tags: ["aur", "arch"]
description: "AUR 包发布指南：从准备工作到成功上传 Arch Linux 用户仓库的完整流程"
draft: false
---



<div class="hint hint-error">Duplicated post.  
TODO: notes for aur.</div>

## Preface
I had a terrible experience due to my unfamiliarity with the rules [Arch package guidelines](https://wiki.archlinux.org/title/Arch_package_guidelines)!

## Important
### [package_naming](https://wiki.archlinux.org/title/Arch_package_guidelines#Package_naming)

Choose a wonderful name.
<div class="hint hint-error">LOWERCASE!</div>

## Start
### Prepare
Before the jounal, just follow the wiki for authority first: [AUR_submission_guidelines](https://wiki.archlinux.org/title/AUR_submission_guidelines)

```shell
git -c init.defaultbranch=master clone ssh://aur@aur.archlinux.org/$ThePackageNameYouWant.git
```

<div class="hint hint-warning">The error such as `git-upload-pack: invalid repository name` means that you have to go back to [AUR_submission_guidelines](https://wiki.archlinux.org/title/AUR_submission_guidelines)!</div>

### Beginning
All well!
Now just crafting the PKGBUILD!

<div class="hint hint-info">A long time later...</div>

### End
Publishing!
```shell
makepkg --printsrcinfo > .SRCINFO
git add PKGBUILD .SRCINFO
git commit -m $UsefulCommitMessage
git push
```
