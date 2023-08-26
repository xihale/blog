---
title: butterfly
date: 2023-08-26 10:21:50
tags: hexo
---

## Preface

API 文档上有的, 这里不一定有  
API 文档上没有的, 这里也不一定有  

### Copyright

多作者?

{% note info modern %}
./layout/includes/post/post-copyright.pug
{% endnote %}

```pug ./layout/includes/post/post-copyright.pug
if theme.post_copyright.enable && page.copyright !== false
  - let author = page.copyright_author || config.author
  - let authorHref = page.copyright_author_href || theme.post_copyright.author_href || config.url
  - let url = page.copyright_url || page.permalink
  - let info = page.copyright_info || _p('post.copyright.copyright_content', theme.post_copyright.license_url, theme.post_copyright.license, config.url, config.title)
  .post-copyright
    .post-copyright__author
      span.post-copyright-meta= _p('post.copyright.author') + ": "
      span.post-copyright-info
        a(href=authorHref)=author
    .post-copyright__type
      span.post-copyright-meta= _p('post.copyright.link') + ": "
      span.post-copyright-info
        a(href=url_for(url))= theme.post_copyright.decode ? decodeURI(url) : url
    .post-copyright__notice
      span.post-copyright-meta= _p('post.copyright.copyright_notice') + ": "
      span.post-copyright-info!= info
```

通过看 源代码 可以知道, 只需要在 `page` 中的 `front-matter` 写上 `copyright-*` 就可以修改了

e.g.
```yml
copyright_author: HugoHu
```

