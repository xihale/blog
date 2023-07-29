---
title: new blog install
date: 2023-05-24 17:17:44
tags:
cover: "images/new blog install/1.png"
---

# Install Hexo
```shell
sudo cnpm i -g hexo-cli
```

# Install butterfly
```shell
git clone -b master https://github.com/jerryc127/hexo-theme-butterfly.git themes/butterfly
cp themes/butterfly/_config.yml _config.butterfly.yml
echo "the config is exist on root(named \`_config.butterfly.yml\`)" > themes/butterfly/_config.yml
```

# Install plugins
```shell
cnpm i --save hexo-renderer-pug hexo-renderer-stylus hexo-generator-search hexo-wordcount vanilla-lazyload hexo-deployer-git
```
> add to _config.yml
```yml
search:
  path: search.xml
  field: post # post, page, all
  content: true # include all content of the post
deploy:
  type: git
  repo: git@github.com:${your repo}
  branch: main
```

> modifly the _config.butterfly.yml
```yml
wordcount:
  enable: true
  post_wordcount: true
  min2read: true
  total_wordcount: true
```
