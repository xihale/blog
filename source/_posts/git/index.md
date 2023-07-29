---
title: git-学习
tag: git
category:
- [编程]
- [学习]
---
## 准备工作
1. 连接你的账号

   ```
   ssh-keygen -t rsa -C "邮箱"
   ```

   1.2. 然后用`记事本`打开`C:\用户\用户名\\.ssh\id_rsa.pub`
   1.3. 复制里面的内容
   1.4. 在云端的设置中找到`SSH keys`或`SSH 公钥`
   1.5. `新建`一个公钥并把刚刚复制的内容`粘贴`进`Key`或`公钥`

2. 在云端创建一个`存储库`,`不创建`任何文件
## 上传文件
```bash
echo "" >> README.md #新建一个README.md
git init #将此文件夹init
git add README.md #将README.md文件加入缓冲区
git commit -m "first commit" #添加一个提交备注
git branch -M main #这里的main要对应远程的分区
git remote add 快捷方式名 git@域名:用户名/库名.git #此方法可创建多个快捷方式一起提交
git push -u origin main #提交到远程,与前面的main对应
```

## 下载文件

```bash
git clone '链接'或'SSH'
git pull '链接'或'SSH' '分支'
```

