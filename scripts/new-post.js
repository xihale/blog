#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ALLOWED_TAGS = ['技术', '思考', '番谈', 'CTF', '随笔', '文摘', '法律'];

function formatDate(date) {
  return date.toISOString().split('T')[0];
}

function slugify(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || `post-${Date.now()}`;
}

function generateFrontmatter(title, description, tags, draft) {
  const pubDate = formatDate(new Date());

  let fm = '---\n';
  fm += `title: "${title}"\n`;
  fm += `pubDate: "${pubDate}"\n`;
  fm += `description: "${description}"\n`;
  if (tags.length > 0) {
    fm += `tags: [${tags.map(t => `"${t}"`).join(', ')}]\n`;
  }
  fm += `draft: ${draft}\n`;
  fm += '---\n\n';
  return fm;
}

function parseArgs(argv) {
  const args = argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`Usage: bun run new "文章标题" [选项]

选项:
  -d, --desc TEXT     描述（一句话概括文章内容）
  -t, --tags T1,T2   标签，逗号分隔，最多 2 个
                      可选: ${ALLOWED_TAGS.join(', ')}
      --draft         标记为草稿 (draft: true)
  -h, --help          显示帮助

示例:
  bun run new "我的第一篇文章"
  bun run new "深入理解 Astro" -d "从零学习 Astro 框架" -t 技术
  bun run new "周末见闻" -t 随笔 --draft`);
    process.exit(0);
  }

  const title = args[0];
  let description = '';
  let tags = [];
  let draft = false;

  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    if (arg === '-d' || arg === '--desc') {
      description = args[++i] || '';
    } else if (arg === '-t' || arg === '--tags') {
      const raw = (args[++i] || '').split(',').map(s => s.trim()).filter(Boolean);
      const invalid = raw.filter(t => !ALLOWED_TAGS.includes(t));
      if (invalid.length > 0) {
        console.error(`Error: 未知标签: ${invalid.join(', ')}`);
        console.error(`可选标签: ${ALLOWED_TAGS.join(', ')}`);
        process.exit(1);
      }
      if (raw.length > 2) {
        console.error('Error: 标签最多 2 个');
        process.exit(1);
      }
      tags = raw;
    } else if (arg === '--draft') {
      draft = true;
    }
  }

  return { title, description, tags, draft };
}

function main() {
  const { title, description, tags, draft } = parseArgs(process.argv);

  const slug = slugify(title);
  const contentDir = path.join(__dirname, '../src/content/blog');
  const filePath = path.join(contentDir, `${slug}.md`);

  if (fs.existsSync(filePath)) {
    console.error(`Error: ${slug}.md already exists!`);
    process.exit(1);
  }

  if (!fs.existsSync(contentDir)) {
    fs.mkdirSync(contentDir, { recursive: true });
  }

  const frontmatter = generateFrontmatter(title, description, tags, draft);
  fs.writeFileSync(filePath, frontmatter, 'utf8');

  console.log(`Created: src/content/blog/${slug}.md`);
  if (description) console.log(`Desc: ${description}`);
  if (tags.length) console.log(`Tags: ${tags.join(', ')}`);
  console.log(`Draft: ${draft}`);
}

main();
