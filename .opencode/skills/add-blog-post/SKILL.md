---
name: add-blog-post
description: Add, migrate, rewrite, or polish blog posts for this Astro blog. Use when creating a new article, migrating posts from older blogs, choosing filenames/frontmatter/tags, fixing article metadata, or validating blog content in this repository.
---

# Add Blog Post

Use this repo-specific workflow for anything under `src/content/blog/`.

## Canonical Location

- Put posts in `src/content/blog/*.md`.
- The URL slug comes from the filename.
- Prefer lowercase ASCII kebab-case filenames for new posts, even if the title is Chinese.
- Good examples: `slow-retreat.md`, `science-and-religion.md`, `sakurada-reset-novel.md`.

## Active Frontmatter Schema

Check `src/content.config.ts` before changing conventions.

For new posts, use only the schema-backed fields:

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
- Do **not** add `category` for new posts unless the schema is updated first.
- Legacy posts may still contain `category`; treat that as historical baggage, not a template.

## Date Rules

- For migrated posts, preserve the original publish date when known.
- For newly written posts, use the actual creation/publish date the user expects.
- Keep dates as quoted strings in a format Astro can coerce cleanly, ideally `YYYY-MM-DD`.

## Tag Rules

The repo's cleaned-up tag set is:

- `技术`
- `思考`
- `番谈`
- `CTF`
- `随笔`
- `文摘`
- `法律`

Guidelines:

- Reuse existing tags whenever possible.
- Usually assign 1 tag; use 2 only when it is genuinely useful.
- Avoid synonyms and legacy fragments such as `哲思`, `哲学`, `番评`, `ani`, `aur`, `arch`, `Network`, `Law`, `China`, `zine`.
- Tag consistency matters because `/tags` is generated directly from `tags` frontmatter.

## Writing and Migration Rules

- Keep the author's voice; do not over-normalize the prose.
- If the source post is obviously rough, duplicated, placeholder-only, or the user asks for a rewrite, rewrite it into clean Markdown with the same core meaning.
- When migrating from Hexo or similar systems, remove unsupported syntax such as:
  - `{% note %}`
  - `{% tabs %}`
  - `{% blockquote %}`
  - `{% center %}`
  - theme-specific raw HTML that is only there to satisfy the old theme
- Convert old constructs into standard Markdown.
- Use repo-supported `:::` admonitions only when they help.
- Deduplicate repeated quotes or lines copied over from old drafts.
- Fix obvious typos and broken punctuation while preserving intent.

## Practical Heuristics

- If a post has no useful description, write a concise one-sentence summary.
- If the old title is weak but the user asked for rewriting, improve the title; otherwise preserve it.
- Prefer readable paragraphs over decorative filler or self-conscious prefaces.
- When rewriting, cut apology language, empty throat-clearing, and obvious repetition first.

## Validation

After adding or editing posts, run:

```bash
autocorrect --strict --fix src/content/blog/
```

or:

```bash
bun run lint
```

Run a broader build when content structure or navigation changes, or when you want stronger verification:

```bash
bun run build
```

## Git Hygiene

- Do not commit unless the user explicitly asks.
- When committing, keep the message focused on the content change, e.g. `post: add ...`, `post: rewrite ...`, `refactor: clean up tags ...`.
