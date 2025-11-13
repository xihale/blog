#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 格式化日期为 YYYY-MM-DD (frontmatter 格式)
function formatDateForFrontmatter(date) {
  return date.toISOString().split('T')[0];
}

// 格式化日期为可读格式 (显示用)
function formatDateDisplay(date) {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

// 转换标题为文件名 (kebab-case)
function slugify(title) {
  const timestamp = Date.now();
  const baseSlug = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // 移除特殊字符，保留字母、数字、下划线、横线和空格
    .replace(/\s+/g, '-'); // 将空格替换为横线

  return baseSlug || `post-${timestamp}`; // 如果生成空字符串，使用时间戳
}

// 生成 frontmatter
function generateFrontmatter(title, description = '', tags = [], category = [], draft = true) {
  const pubDate = formatDateForFrontmatter(new Date());

  return `---
title: "${title}"
pubDate: "${pubDate}"
description: "${description}"
${tags.length > 0 ? `tags: [${tags.map(tag => `"${tag}"`).join(', ')}]\n` : ''}${category.length > 0 ? `category: [${category.map(cat => `"${cat}"`).join(', ')}]\n` : ''}draft: ${draft}
---

`;
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Usage: bun run new "Article Title" [Article Description]');
    process.exit(1);
  }

  const title = args[0];
  const description = args.slice(1).join(' ') || '';

  const slug = slugify(title);
  const contentDir = path.join(__dirname, '../src/content/blog');
  const filePath = path.join(contentDir, `${slug}.md`);

  // 检查文件是否已存在
  if (fs.existsSync(filePath)) {
    console.error(`Error: Article "${slug}.md" already exists!`);
    process.exit(1);
  }

  // 确保内容目录存在
  if (!fs.existsSync(contentDir)) {
    fs.mkdirSync(contentDir, { recursive: true });
  }

  // 生成 frontmatter
  const frontmatter = generateFrontmatter(title, description);

  // 写入文件
  fs.writeFileSync(filePath, frontmatter, 'utf8');

  console.log(`✅ Created new article: ${slug}.md`);
  console.log(`📝 Path: ${filePath}`);
  console.log(`📅 Published: ${formatDateDisplay(new Date())}`);
  console.log('\n📋 Frontmatter generated:');
  console.log(frontmatter);
  console.log(`⚠️  Don't forget to:`);
  console.log(`   - Fill in description if empty`);
  console.log(`   - Set tags and category`);
  console.log(`   - Change draft: true to draft: false when ready`);
}

main();