// @ts-check

import fs from 'node:fs';
import path from 'node:path';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import UnoCSS from '@unocss/astro';
import { remarkCustomDirectives } from './lib/remark/custom-directives';
import remarkDirective from 'remark-directive';

import expressiveCode from 'astro-expressive-code';
import { pluginLineNumbers } from '@expressive-code/plugin-line-numbers';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { remarkMermaid } from './lib/remark/remark-mermaid.js';
import { fontPreload } from './lib/astro/font-preload.mjs';
import { llmsTxt } from './lib/astro/llms-txt.mjs';

/** Collect URL paths of posts marked `unlisted: true` so sitemap excludes them. */
function collectUnlistedPaths() {
    /** @type {Set<string>} */
    const paths = new Set();
    /** @type {Array<[string, string]>} */
    const dirs = [
        ['blog', '/writing/'],
        ['fragments', '/fragments/'],
        ['essays', '/essays/'],
    ];
    for (const [dir, prefix] of dirs) {
        const fullDir = path.join(process.cwd(), 'src/content', dir);
        if (!fs.existsSync(fullDir)) continue;
        for (const entry of fs.readdirSync(fullDir)) {
            if (!/\.(md|mdx)$/.test(entry)) continue;
            const raw = fs.readFileSync(path.join(fullDir, entry), 'utf8');
            const fm = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? '';
            if (/^unlisted:\s*true\s*$/m.test(fm)) {
                const slug = entry.replace(/\.(md|mdx)$/, '').toLowerCase();
                paths.add(`${prefix}${slug}/`);
            }
        }
    }
    return paths;
}
const unlistedPaths = collectUnlistedPaths();

// https://astro.build/config
const SITE = 'https://xeed.ink';
export default defineConfig({
    site: SITE,
    output: 'static',
    redirects: {
        '/writing/coincidence-high-school': '/fragments/coincidence-high-school/',
        '/writing/knowledge-action': '/fragments/knowledge-action/',
        '/writing/science-and-religion': '/fragments/science-and-religion/',
        '/writing/aur-publish': '/fragments/aur-publish/',
        '/writing/compitition-cpp': '/fragments/compitition-cpp/',
        '/writing/import-shiki': '/fragments/import-shiki/',
        '/writing/lxgw-everywhere': '/fragments/lxgw-everywhere/',
        '/writing/sni': '/fragments/sni/',
        '/blog/aur-publish': '/fragments/aur-publish/',
        '/blog/compitition-cpp': '/fragments/compitition-cpp/',
        '/blog/import-shiki': '/fragments/import-shiki/',
        '/blog/lxgw-everywhere': '/fragments/lxgw-everywhere/',
        '/blog/sni': '/fragments/sni/',
    },
    integrations: [
        fontPreload(),
        llmsTxt({ site: SITE }),
        UnoCSS(),
        expressiveCode({
            themes: ['vitesse-dark', 'vitesse-light'],
            // 扁平纸面：去掉默认的悬浮投影，代码块不应像浮在纸上的卡片
            styleOverrides: {
                frames: { frameBoxShadowCssValue: 'none' },
            },
            defaultProps:{
                wrap: true,
                overridesByLang: {
                  'bash,ps,sh': { preserveIndent: false },
                },
            },
            plugins: [
                pluginLineNumbers()
            ]
        }),
        mdx(),
        sitemap({
            filter: (page) => {
                const pathname = new URL(page).pathname;
                if (pathname === '/blog/' || pathname.startsWith('/blog/') || pathname === '/categories/') {
                    return false;
                }
                return !unlistedPaths.has(pathname);
            },
        })
    ],
    markdown: {
        processor: unified({
            remarkPlugins: [remarkDirective, remarkCustomDirectives, remarkMath, remarkMermaid],
            rehypePlugins: [rehypeKatex],
        }),
    },
});
