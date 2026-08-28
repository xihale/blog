// @ts-check

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
import { fontDisplayOptional } from './lib/astro/font-display.mjs';
import { llmsTxt } from './lib/astro/llms-txt.mjs';

// https://astro.build/config
const SITE = 'https://xeed.ink';
export default defineConfig({
    site: SITE,
    output: 'static',
    integrations: [
        fontPreload(),
        fontDisplayOptional(),
        llmsTxt({ site: SITE }),
        UnoCSS(),
        expressiveCode({
            themes: ['vitesse-dark', 'vitesse-light'],
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
        sitemap()
    ],
    markdown: {
        processor: unified({
            remarkPlugins: [remarkDirective, remarkCustomDirectives, remarkMath, remarkMermaid],
            rehypePlugins: [rehypeKatex],
        }),
    },
});
