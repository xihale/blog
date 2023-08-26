---
date: 2021-12-04
title: 初学VB
tag: 
  - learn
  - vb
---

# 前言

天下初中生苦`VB`久矣

`VB`确实可以在某种程度上帮助我们使用`Windows`

但是?

目前来说像`Python` `Search` `易语言`这些语言也可以迅速帮助我们使用`Windows`

而且他们还在快速迭代,`VB`就不是了,不过不可否认的是`VB`入门门槛在某种意义上来说更低

这里说明应付而不是掌握的原因(为什么不真正去学`VB`)

如果真的想进阶`VB`可以去[微软visual-basic文档](https://docs.microsoft.com/en-us/dotnet/visual-basic)进行具体学习

主要就是: 13年没有更新,`msdn`不支持,网上教程/样例难找

其次是: 支持的优秀的库很少很难,有兴趣的可以去搜一下`VB文件处理`

# 开始

> 本文所有教程全部基于`VB 6.0`

## 安装

[完整教程](https://www.jb51.net/softs/44280.html)

简略教程: 

1. [下载VB编译器](https://yy2.guiren21.com/201205/tools/vb60_jb51.rar)
2. 解压后运行`SETUP.EXE`
3. 全部下一步即可,序列号是"111-1111111"

## 图形概念

1. 窗体(可以看作是一个很大的控件): 一个存放控件的容器
   PS: 放苹果的篮子

2. 控件: 实现功能的工具

   PS: 各种苹果

## 属性

个性化调整控件的样式

PS: 调整苹果、篮子的大小、颜色等

1. 可视化

   1. 选中控件(单机选中)
   2. 右下角属性窗口中调整
      PS: 单机属性名时,最下方会有其属性的详细注释(告诉你这个属性是用来调整大小还是颜色的)

2. 代码

   ```vb
   控件名.属性名=属性值
   e.g.1: 苹果A.颜色=红色
   e.g.2: 苹果B.毒性=剧毒
   ```

### 代码

#### 变量

变量就是一个个存储信息的容器

`VB`中一般使用`Integer``String`类型

一般定义方法:

```vb
Dim A,B As Integer
Dim C As Float
Dim D As Double
Dim str As String
Dim lst As New List(Of Integer) From {10, 20, 30, 40}
```

#### 特殊运算符

`=`: 赋值符号和等于号

```vb
Dim a As Integer
a=1
If a=1 Then
    Print a
End If
```

`&`: 连接符号(连接时要隔一个空格)

```vb
Dim a,b As String
a="hello"
b="world"
Print a & b '书写时必须用空格隔开
```

### 判断语句(分支语句)

用于选择性执行代码

这是基本格式: 

##### e.g.1

```VB
e.g.1 (最普通的If)
If 条件表达式 Then
    ...
End If
```
##### e.g.2 (带Else的If)

```vb
If 条件表达式 Then
    ...
Else
    ...
End If
```
##### e.g.3 (If嵌套)

```vb
If 条件表达式 Then
    ...
Else If 条件表达式 Then
    	...
    Else
        ...
    End If
End If
```

##### example

```vb
If 1+1=2 Then
    Print "1+1=2"
Else If 1+1=3 Then
        Print "1+1=3"
    Else If 1+1=4 Then
            Print "1+1=4"
        Else
            Print "1+1=5"
        End If
    End If
End If
```

当然,你可以无限`If`下去

#### 进阶(Select)

```VB
Select Case 表达式
Case 值
    ...
Case 值
    ...
End Select
```

##### example

```vb
Select Case 1+1
Case 1 To 5
    Print "1<=1+1<=5"
Case 6,9,12
    Print "1+1=6或9或12"
Case 8
    Print "1+1=8"
Case Else
    Print "1+1=?"
End Select
```

当然你可以无限`Case`下去

### 循环语句

适用于重复动作,其中`Timer`控件其实就是一个延时循环体结构

```vb
For 计数变量名=值 [As 变量类型] To 值 [Step 值]
    ...
Next [计数变量名]
```

这个不是很好理解

还是看`example`吧

##### e.g.1(从`1`加到`100`)

```vb
Dim i,a As Integer
a=0
For i=1 To 100 Step 1
    a=a+i
Next i
Print a
```

你也可以这样(`Step`默认`1`,`Next`在单循环情况下可省略,循环计数变量会自动定义)

```vb
Dim a As Integer
a=0
For i=1 To 100
    a=a+i
Next
Print a
```

##### e.g.2(输出`10-100中的奇数`)

注意: 

1. 多层循环不能省略`Next`
1. 步长非`1`不能省略`Step`

```vb
For i=1 To 10 	
    For j=1 To 9 Step 2
        Print String(i) & String(j)
    Next j
Next i
```

#### 进阶

循环还有很多种,这两种比较重要,最好掌握

不过考试中一般只考`For`,所以只为了考试的话就不用进阶了

```vb
Do while 条件
    ...
Loop
```

```vb
Dim bool Boolean
Dim i Integer
i=1
bool=1
Do while bool
    Print i
    i=i+1
    If i=100
        bool=0
    End If
Loop
```

### 其他

>这里以考试的标准来
>
>标'*'的是真实标准与考试标准矛盾的,有兴趣的可以去试试

1. *`Textbox`最多输入`2048`个字符

2. `Image`控件载入图片的方法:

   ```vb
   对象名.Picture=LoadPicture("Path")
   ```

   ```vb
   Img.Picture=LoadPicture(App.Path & "a.jpg")
   ```

   
