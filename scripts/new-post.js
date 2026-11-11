#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ALLOWED_TAGS = ['技术', '思考', '番谈', 'CTF', '法律', '叙事'];

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

function generateFrontmatter(title, description, tags, draft, unlisted) {
  const pubDate = formatDate(new Date());

  let fm = '---\n';
  fm += `title: "${title}"\n`;
  fm += `pubDate: "${pubDate}"\n`;
  fm += `description: "${description}"\n`;
  if (tags.length > 0) {
    fm += `tags: [${tags.map(t => `"${t}"`).join(', ')}]\n`;
  }
  fm += `draft: ${draft}\n`;
  if (unlisted) {
    fm += `unlisted: true\n`;
  }
  fm += '---\n\n';
  return fm;
}

function parseArgs(argv) {
  const args = argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`Usage: bun run new "文章标题" [选项]

选项：
  -d, --desc TEXT     描述（一句话概括文章内容）
  -t, --tags T1,T2   标签，逗号分隔，最多 2 个
                      可选：${ALLOWED_TAGS.join(', ')}
  -f, --fragment      创建为「短记」(写入 src/content/fragments/)
  -e, --essay         创建为「闲笔」(写入 src/content/essays/，默认开启草稿冷却)
      --unlisted      标记为仅链接可见 (unlisted: true，不进列表/标签/RSS/搜索)
      --draft         标记为草稿 (draft: true)
  -h, --help          显示帮助

示例：
  bun run new "深入理解 Astro" -d "从零拆解 Astro 静态渲染流水线" -t 技术
  bun run new "Vite CSS 产物排障速记" -f -t 技术
  bun run new "冬夜小记" -e`);
    process.exit(0);
  }

  const title = args[0];
  let description = '';
  let tags = [];
  let draft = undefined;
  let unlisted = false;
  let collection = 'blog';

  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    if (arg === '-d' || arg === '--desc') {
      description = args[++i] || '';
    } else if (arg === '-t' || arg === '--tags') {
      const raw = (args[++i] || '').split(',').map(s => s.trim()).filter(Boolean);
      const invalid = raw.filter(t => !ALLOWED_TAGS.includes(t));
      if (invalid.length > 0) {
        console.error(`Error: 未知标签：${invalid.join(', ')}`);
        console.error(`可选标签：${ALLOWED_TAGS.join(', ')}`);
        process.exit(1);
      }
      if (raw.length > 2) {
        console.error('Error: 标签最多 2 个');
        process.exit(1);
      }
      tags = raw;
    } else if (arg === '-f' || arg === '--fragment') {
      collection = 'fragments';
    } else if (arg === '-e' || arg === '--essay') {
      collection = 'essays';
    } else if (arg === '--unlisted') {
      unlisted = true;
    } else if (arg === '--draft') {
      draft = true;
    }
  }

  // 闲笔默认开启 7 天草稿冷却，且未指定标签时默认归为「叙事」
  const finalDraft = draft ?? (collection === 'essays');
  if (collection === 'essays' && tags.length === 0) {
    tags = ['叙事'];
  }

  return { title, description, tags, draft: finalDraft, unlisted, collection };
}

function main() {
  const { title, description, tags, draft, unlisted, collection } = parseArgs(process.argv);

  const slug = slugify(title);
  const contentDir = path.join(__dirname, `../src/content/${collection}`);
  const filePath = path.join(contentDir, `${slug}.md`);

  if (fs.existsSync(filePath)) {
    console.error(`Error: ${slug}.md already exists!`);
    process.exit(1);
  }

  if (!fs.existsSync(contentDir)) {
    fs.mkdirSync(contentDir, { recursive: true });
  }

  const frontmatter = generateFrontmatter(title, description, tags, draft, unlisted);
  fs.writeFileSync(filePath, frontmatter, 'utf8');

  console.log(`Created: src/content/${collection}/${slug}.md`);
  if (description) console.log(`Desc: ${description}`);
  if (tags.length) console.log(`Tags: ${tags.join(', ')}`);
  console.log(`Draft: ${draft}`);
  if (unlisted) console.log(`Unlisted: true`);
  if (collection === 'essays' && draft) {
    console.log('Note: 闲笔默认开启 7 天草稿冷却 (draft: true)，沉淀重读后再改 false 发布。');
  }
}

main();
