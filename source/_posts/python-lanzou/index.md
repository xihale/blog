---
title: $filedir
date: 2022-8-15
---
---
title: python-蓝凑云直链解析
tags: python
category: [编程,python]
---

## 前言

就是看到很多大佬写了,不过99%`没开源`,1%用的`e语言`

所以,我先写个`py`版本的,然后再去做个`php`版的(有时间的话)

## 代码

花了很多时间,遇到了很多`坑`,没有`注释`...

```python
#!/usr/bin/env python
# The code from xihale.top

import requests
import json

UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4537.0 Safari/537.36 Edg/93.0.926.1"
header = {"user-agent": UA}
url = "lanzoui.com"


def swn(str: str, start: str, end: str) -> str:
	r = str.find(start)
	re = str.find(end, r + len(start))
	return str[r + len(start):re - len(end) + 1]


def file(data):
	if not isinstance(data, str):
		file = data['file']
		key = data['key']
	else:
		file = data
		key = ''
	html = requests.get(file, headers=header)
	if html.text.find("filemoreajax.php") != -1:  # filer
		r = html.text.find("data : {") + 7
		re = html.text.find("}", r)
		text = html.text[r:re] + '}'
		text = text.strip()
		ib = swn(html.text, "'t':", ",")
		ibs = swn(html.text, ib + " = '", "'")
		ih = swn(html.text, "'k':", ',')
		ihs = swn(html.text, ih + " = '", "'")
		text = text.replace(ib, "'" + ibs + "'")
		text = text.replace(ih, "'" + ihs + "'")
		text = text.replace("pgs", "'1'")
		text = text.replace("'", '"')
		if key != "":
			text = text.replace(":pwd", ':"' + key + '"')
		else:
			l = list(text)
			l.pop(text.rfind(","))
			text = ''.join(l)
		# print(text)
		text = json.loads(text)
		# print(text)
		html = requests.post("https://" + url + "/filemoreajax.php", headers={"referer": html.url, "user-agent": UA},
		                     data=text)

		data = json.loads(html.text)
		if data["info"] != "sucess":
			return {'code': -1, 'info': data["info"]}
		# return data
		return {'code': 200, 'info': html.text}
	if html.text.find("输入密码") != -1 and key == "":
		return {'code': -1, 'info': "请输入密码!"}
	if key == "":
		start = html.text.find("src=\"")
		start = html.text.find("src=\"", start + 6)  # 找到目标
		end = html.text.find("\"", start + 6)
		html = requests.get(url="https://" + url + "/" + html.text[start + 6:end])
		data = html.text
		start = data.find("var ajaxdata = '")
		end = data.find("'", start + 16)
		ajaxdata = data[start + 16:end]
		start = data.find("'", end + 3)
		end = data.find("'", start + 1)
		postdown = data[start + 1:end]
	else:
		start = html.text.find("&sign=")
		postdown = html.text[start + 6:html.text.find("&p=", start + 6)]

	html = requests.post(url="https://" + url + "/ajaxm.php", headers={"referer": html.url, "user-agent": UA},
	                     data={"action": "downprocess", "sign": postdown, "p": key})
	data = json.loads(html.text)
	if data["url"] == 0:
		return {'code': -1, 'info': data["inf"]}
	html = requests.get(url=data["dom"] + "/file/" + data["url"], headers={
		'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
		'Accept-Language': 'zh-CN,zh;q=0.8',
		'Connection': 'keep-alive', }, allow_redirects=False)
	return {'code': 200, 'info': html.headers['Location']}  # 获取重定向网址

# print(file("https://xihale.lanzoui.com/b015wmtfa", "d8tb")) #测试

```

> 可以直接`from lanzou import file as lanzou_jx`
>
> 然后`lanzou_jx(url,key)`来使用

