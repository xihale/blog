---
name: add-blog-post
description: Add, migrate, rewrite, or polish blog posts for this Astro blog. Use when creating a new article, migrating posts from older blogs, choosing filenames/frontmatter/tags, fixing article metadata, or validating blog content in this repository.
---

# Add Blog Post

Use this for anything under `src/content/blog/`.

## Rules

- Put posts in `src/content/blog/*.md`.
- The slug comes from the filename.
- Prefer lowercase ASCII kebab-case filenames for new posts.
- Preserve original publish dates when migrating old posts.

## Frontmatter

Use:

```md
---
title: "文章标题"
pubDate: "2026-03-23"
description: "一句话概括文章内容。"
tags: ["思考"]
draft: false
---
```

- Allowed extras: `updatedDate`, `unlisted`.
- Do not add `category` for new posts. The active schema is in `src/content.config.ts`.

## Tags

Only use these tags unless the repo changes:

- `技术`
- `思考`
- `番谈`
- `CTF`
- `随笔`
- `文摘`
- `法律`

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
autocorrect --strict --fix src/content/blog/
```

```bash
bun run lint
```

Run `bun run build` if content structure or navigation changed.

## Git

- Do not commit unless the user explicitly asks.
- Typical commit prefixes here are `post:`, `docs:`, `refactor:`.
