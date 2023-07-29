---
title: letsencrypt 证书生成
tags: letsencrypt
categories:
- [letsencrypt]
---
## 前言
`letsencrypt`是一个免费的`ssl`证书机构
## 开始
### 安装`certbot`
```sh
sudo apt install certbot
```
### 申请
把`xihale.top`改成你要申请的域名即可  
用户邮箱随便,中间的操作全部填`Y`,最后它会提示你改`TXT`
```sh
certbot certonly --preferred-challenges dns --manual  -d *.xihale.top,xihale.top --server https://acme-v02.api.letsencrypt.org/directory
```
## 结束
搞定没有报错就可以去`/etc/letsencrypt/live/xihale.top`获取`ssl`文件了