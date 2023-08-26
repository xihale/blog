---
title: xmysql-一个简单的mysql类
tags: cpp
date: 2021-08-28 08:48:42
---

## 前言

最近写一个聊天软件, server 端得用到 mysql 

但是c++能用的库很少,所以我就对照[大佬rotation的c语言库](https://blog.csdn.net/fengxinlinux/article/details/75675360)和官方api文档做了个c++的库

Bug肯定是还有的,不过正常使用应该没啥问题了

#### xmysql

```cpp
#ifndef XMYSQL
#define XMYSQL

#include <mysql/mysql.h>
#include <string>
#include <vector>
using std::string;
using std::vector;
namespace xihale{
    class xmysql{
    public:
        xmysql(); //初始化类
        xmysql(string host,string username,string password,string dbname,unsigned dbport=0); //连接数据库
        ~xmysql(); //关闭数据库连接

        void init(string host,string username,string password,string dbname,unsigned dbport=0); //连接数据库
        vector<vector<string>> exec(string _exec); //执行数据库脚本
        const char *error(); //获取错误
    private:
        MYSQL *mysql;
    };
}

#endif
```

#### xmysql.cpp

```cpp
#include <iostream>
#include "xmysql.h"
using namespace xihale;
using std::clog;
xmysql::xmysql(){
    mysql=mysql_init(NULL); //初始化
    if(mysql==NULL)throw "初始化 mysql 失败";
}
xmysql::xmysql(string host,string username,string password,string dbname,unsigned int dbport){
    xmysql(); //初始化
    init(host,username,password,dbname,dbport);
}
void xmysql::init(string host,string username,string password,string dbname,unsigned int dbport){
    mysql=mysql_real_connect(mysql,host.c_str(),username.c_str(),password.c_str(),dbname.c_str(),dbport,NULL,0); //默认
    if(mysql==NULL)throw "连接 mysql 失败";
}
vector<vector<string>> xmysql::exec(string _exec){
    if(mysql_query(mysql,_exec.c_str()))throw "数据库语句执行失败";
    MYSQL_RES *_result=mysql_store_result(mysql);
    if(_result){
        int fields=mysql_num_fields(_result);
        vector<vector<string>>result;
        MYSQL_ROW row;
        while((row=mysql_fetch_row(_result))){
            vector<string>s;
            for(int i=0;i<fields;++i)
                s.push_back(row[i]?row[i]:"NULL");
            result.push_back(s);
        }
        mysql_free_result(_result);
        return result;
    }else if(mysql_field_count(mysql)!=0)throw "数据库语句执行失败";
    return vector<vector<string>>();
}
const char *xmysql::error(){
    return mysql_error(mysql);
}
xmysql::~xmysql(){
    mysql_close(mysql);
    mysql_library_end();
}
```