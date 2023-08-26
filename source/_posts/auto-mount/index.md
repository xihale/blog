---
date: 2022-02-26
title: 自动 mount
tag: linux
---

## 序

有几个分区得自动`mount`

## 言

1. 挂载需要自动挂载的分区

2. 使用`blkid`命令获取分区的`UUID`并`复制`

3. 打开`/etc/fstab`自动挂载分区标识文件
   ```shell
   sudo vim /etc/fstab
   ```
   
4. 添加/修改即可，格式：

   > 请将`uuid`替换为`刚刚复制的 uuid`，
   >
   > 然后把绑定目录改一下，一般只需要把`xihale`改为你`自己的用户名`，把`dir`改为需要绑定到的`文件夹名`即可，
   >
   > 最后把`ext4`改为你需要的分区格式，一般是`ntfs`或`fat32`

   ```shell
   UUID=uuid /media/xihale/dir ext4 defaults 0 0
   ```

   一般来说，后面两个参数都填`0`，[详解在这](https://www.rmssf.com/news/fstab dump pass values.html)