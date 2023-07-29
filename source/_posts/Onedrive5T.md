---
title: Onedrive5T(E5的获取)
tag: 
- [白嫖]
- [Onedrive]
categories: 白嫖 Onedrive
top_img: /images/onedrive.png
cover: /images/onedrive.png
---
## 前言

Office365开发版E5是为开发人员提供的，是微软的官方活动，申请Office 365开发者计划可以获得为期3个月的免费Office365 E5。 而E5计划就包含了25个用于所有Office 365 应用的许可证。如果嫌正版office365贵的话，这可是你免费获取office的好机会了！

PS:过程很麻烦！要有足够耐心，xihale遇到过很多错误！搞了一天！

需要材料：一个microsoft账号（用qq邮箱注册一个就行），一个github账号，一个有耐心的脑，一个外国代理，一个VPS/服务器

## 申请e5账号: 

1. 进入: [Microsoft 365 开发人员计划](https://developer.microsoft.com/zh-cn/microsoft-365/dev-program)
2. 登录你的microsoft账号
3. 然后填写信息（随便填）--开始挂代理（google验证码）
4. 然后进入[Microsoft 365 admin center](https://admin.microsoft.com/)管理用户，最多25个用户

（现在开始，所有登录的账号都是刚刚填的"用户名@域.onmicrosoft.com"）

4. 进入[office](https://office.com/)登录刚刚填的账号，打开onedrive--他会提示正在准备，到这里你就成功了（要等很久，最好过几个小时在看--我就等了1天才好！）

5. 等待OneDrive可以用

6. 默认空间是1t，进入[Onedrive-默认存储空间修改](https://www.imotao.com/go/?url=https://admin.onedrive.com/#v=StorageSettings)，登录账号-点击存储-把1024改成5120

试试可不可以正常使用！如果可以就成功了！

## 设置自动续费
> 参考:[浅忆大佬-E5自动订阅程序](https://qyi.io/archives/687.html)

> PS: 已经续了快1年了

进入: [E5续订](https://e5.qyi.io/)，登录`GitHub账号`

1. 进入[Azure](https://portal.azure.com/#home)，登录账号
2. 搜索应用注册-注册一个新应用：
   1. `重定向url`
      
      ```bash
      https://e5.qyi.io/outlook/auth2/receive
      ```
   2. `受支持的账户类型`选`那个最长的`
   
1. 复制"应用程序(客户端)ID"-粘贴到client_id里

4. 点击证书和密码-创建一个客户端密码；复制密码填到client_secre里
5. 点击授权

## 对接cloudreve网盘(未完成)

### Linux

进入`shell`界面输入(依赖`wget`):

```bash
wget http://toolwa.com/github/https://github.com/cloudreve/Cloudreve/releases/download/3.3.2/cloudreve_3.3.2_linux_arm.tar.gz
 && tar -zxvf cloudreve_3.3.2_linux_arm.tar.gz && chome +x ./cloudreve && ./cloudreve
```

> 对接教程得等等,还没来得及写,所以先看视频吧

https://www.bilibili.com/video/BV1FZ4y1T7jn/