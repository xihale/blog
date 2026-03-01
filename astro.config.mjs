// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';
import UnoCSS from '@unocss/astro';
import { remarkCustomDirectives } from './lib/remark/custom-directives';
import remarkDirective from 'remark-directive';

import expressiveCode from 'astro-expressive-code';
import { pluginLineNumbers } from '@expressive-code/plugin-line-numbers';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

// https://astro.build/config
export default defineConfig({
    site: 'https://xihale.top',
    output: 'static',
    integrations: [
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
        remarkPlugins: [remarkDirective, remarkCustomDirectives, remarkMath],
        rehypePlugins: [rehypeKatex]
    },
});
