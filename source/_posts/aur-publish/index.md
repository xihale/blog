---
title: aur publish
date: 2023-07-16 10:50:22
tags: 
  - [aur]
  - [arch]
---

## Preface
It's a very terrible exprience caused by unknown of the rules of [Arch package guidelines](https://wiki.archlinux.org/title/Arch_package_guidelines)!

## Important
### [package_naming](https://wiki.archlinux.org/title/Arch_package_guidelines#Package_naming)
{% note danger %}
It can only be lowercase!
{% endnote %}

## Start
### Prepare
In front of the beginning, you shoud follow this wiki for your authority!
[AUR_submission_guidelines](https://wiki.archlinux.org/title/AUR_submission_guidelines)

```shell
git -c init.defaultbranch=master clone ssh://aur@aur.archlinux.org/$YourPackageName.git
```
{%note danger%}
If there is warnning that `git-upload-pack: invalid repository name` , you should go back to [AUR_submission_guidelines](https://wiki.archlinux.org/title/AUR_submission_guidelines)!
{%endnote%}

### Beginning
All is in sort!
now you can make your PKGBUILD!

### End
Just publish it!
```shell
makepkg --printsrcinfo > .SRCINFO
git add PKGBUILD .SRCINFO
git commit -m $UsefulCommitMessage
git push
```
