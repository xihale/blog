---
name: add-blog-post
description: Add, migrate, rewrite, or polish blog posts for this Astro blog. Use when creating a new article, migrating posts from older blogs, choosing filenames/frontmatter/tags, fixing article metadata, or validating blog content in this repository.
---

# Add Blog Post

Three content collections share one schema, defined in `src/content.config.ts`:

- `src/content/blog/*.md` — `/writing/<slug>/`（长文）: 体系化技术深潜、工程复盘、CTF Writeup、严谨法规/作品长文分析。
- `src/content/fragments/*.md` — `/fragments/<slug>/`（短记）: TIL、技术踩坑、架构观察、工具速记，以及有信息密度的简短思考。
- `src/content/essays/*.md` — `/essays/<slug>/`（闲笔）: 克制的散文、白描与生活叙事。仅在页脚保留低调入口，不进顶部主导航与首页推荐流。

## Rules

- Put posts in the collection directory that matches their nature (`blog/` for 长文, `fragments/` for 短记, `essays/` for 闲笔).
- Prose / essays in `essays/` should default to `draft: true` for a 7-day cooling-off review before publishing (`draft: false`), and avoid melodrama or unfinished fragments.
- Set `unlisted: true` when a post should only be accessible via direct URL (hidden from archive lists, `/tags`, RSS/Atom, `llms.txt`, and marked `noindex`).
- The slug comes from the filename.
- Prefer lowercase ASCII kebab-case filenames for new posts.
- Preserve original publish dates when migrating old posts.
- When moving an existing post between collections, add a static redirect in `astro.config.mjs` for its old URL.

## Frontmatter

Use:

```md
---
title: "文章标题"
pubDate: "2026-03-23"
description: "一句话概括文章解决的问题或核心结论。"
tags: ["技术"]
draft: false
cover: "/covers/<slug>.png"
---
```

- Allowed extras: `updatedDate`, `unlisted`, `featured`, `math`, `mermaid`.
- Optional `cover`: site-root path to an image under `public/covers/` (preferred) or an absolute URL. It becomes the article's `og:image`/`twitter:image` and the RSS/Atom `<enclosure>`. Posts without `cover` emit no `og:image`, so readers show no cover — there is no avatar fallback.
- Do not add `category` for new posts. The active schema is in `src/content.config.ts`.

## Tags

Only use these tags unless the repo changes:

- `技术`
- `CTF`
- `思考`
- `番谈`
- `法律`
- `叙事`

Prefer 1 tag. Use 2 only if really needed. Keep tags consistent because `/tags` is generated from `tags` frontmatter.

## Migration

- Keep the author's voice.
- If the source is rough and the user wants a rewrite, rewrite it into clean Markdown with the same meaning.
- Remove old Hexo/theme syntax like `{% note %}`, `{% tabs %}`, `{% blockquote %}`, `{% center %}`.
- Convert old constructs into standard Markdown.
- Deduplicate repeated lines and fix obvious typos.

## Validation

Run one of:

```bash
autocorrect --strict --fix src/content/blog/ src/content/fragments/
```

```bash
bun run lint
```

Run `bun run build` if content structure or navigation changed.

## Git

- Do not commit unless the user explicitly asks.
- Typical commit prefixes here are `post:`, `docs:`, `refactor:`.
