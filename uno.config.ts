import {
  defineConfig,
  presetUno,
  presetAttributify,
  presetTypography,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
    presetAttributify(),
    presetTypography(),
  ],
  transformers: [
    transformerDirectives(),
    transformerVariantGroup(),
  ],
  shortcuts: {
    // Layout shortcuts
    'hero-section': 'min-h-[80vh] flex items-center justify-center',
    'content-wrapper': 'text-center max-w-3xl mx-auto',
    'flex-center': 'flex items-center justify-center',
    'flex-center-col': 'flex flex-col items-center justify-center',
    'container-center': 'max-w-3xl mx-auto',
    
    // Typography shortcuts
    'heading-hero': 'text-5xl font-serif font-light leading-tight tracking-tight',
    'heading-large': 'text-center text-5xl md:text-3xl',
    'heading-medium': 'text-2xl font-serif font-light text-text-muted tracking-wide py-2',
    'meta-text': 'text-sm text-text-secondary',
    'weak-text': 'text-xs text-text-muted',
    'mono-text': 'font-mono',
    
    // Spacing shortcuts
    'section-spacing': 'mb-8',
    'content-spacing': 'mb-6',
    'responsive-padding': 'py-8 md:py-12',
    'responsive-margin': 'mb-12 md:mb-16',
    
    // Blog post shortcuts
    'post-card': 'block text-left transition-transform',
    'post-title': 'font-serif text-xl font-light mb-0',
    'post-meta': 'text-sm text-text-muted mt-1 block',
    'post-description': 'text-base text-text-muted overflow-hidden text-ellipsis line-clamp-2',
    
    // Tag shortcuts
    'tag': 'text-base text-text-secondary px-2 py-1 font-mono',
    'tag-small': 'text-sm text-text-muted opacity-50 font-mono',
  },
  theme: {
    colors: {
      primary: 'var(--primary-color)',
      secondary: 'var(--secondary-color)',
      remark: 'var(--remark-color)',
      weak: 'var(--weak-color)',
      accent: 'var(--accent-color)',
      background: 'var(--background-color)',
      block: 'var(--block-color)',
      shadow: 'var(--shadow-color)',
      selection: 'var(--selection-color)',
      'article-link': 'var(--article-link-color)',
      'article-link-hover': 'var(--article-link-hover)',
      // Text colors mapped to variables
      text: 'var(--color-text)',
      'text-secondary': 'var(--color-text-secondary)',
      'text-muted': 'var(--color-text-muted)',
      'color-border': 'var(--color-border)',
      'color-surface': 'var(--color-surface)',
    },
    fontFamily: {
      serif: 'var(--font-serif)',
      sans: 'var(--font-sans)',
      mono: 'var(--font-mono)',
    },
    breakpoints: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
    },
  },
  preflights: [
    {
      getCSS: () => `
        :root {
          --theme-hue: 220;
          --theme-saturation: 10%;
          --theme-lightness: 15%;

          --primary-color: hsl(var(--theme-hue), var(--theme-saturation), var(--theme-lightness));
          --secondary-color: hsl(var(--theme-hue), var(--theme-saturation), 40%);
          --remark-color: hsl(var(--theme-hue), var(--theme-saturation), 50%);
          --weak-color: hsl(var(--theme-hue), var(--theme-saturation), 65%);
          --accent-color: #67b3a0;
          --background-color: #fffffd;
          --block-color: #eeeeee;
          --shadow-color: #cdcdcc;
          --selection-color: hsla(var(--theme-hue), 70%, 80%, 0.3);
          --article-link-color: #8fa7d8;
          --article-link-hover: #b8cce8;

          --color-text: var(--primary-color);
          --color-text-secondary: var(--secondary-color);
          --color-text-muted: var(--weak-color);
          --color-accent: var(--accent-color);
          --color-background: var(--background-color);
          --color-surface: var(--block-color);
          --color-border: var(--shadow-color);

          --inline-code-bg: rgba(103, 179, 160, 0.12);
          --inline-code-color: #1d5c47;
          --code-block-bg: var(--color-background);
          --code-block-border: var(--color-border);
          --code-block-shadow: rgba(0, 0, 0, 0.05);
          --code-lang-text: var(--color-text-muted);
          --code-line-number: #1b1f23;

          --font-serif: "Times New Roman", "LXGW WenKai";
          --font-sans: var(--font-serif), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          --font-mono: "JetBrains Mono", "LXGW WenKai", monospace;

          --space-1: 0.25rem;
          --space-2: 0.5rem;
          --space-3: 1rem;
          --space-4: 1.5rem;
          --space-6: 2rem;
          --space-8: 3rem;
          --space-12: 4rem;

          --transition: 0.2s ease;
        }

        @media (prefers-color-scheme: dark) {
          :root {
            --theme-lightness: 85%;
            --background-color: #0e0e0c;
            --block-color: #1e1e1e;
            --shadow-color: #323231;
            --accent-color: #4a8b7b;

            --inline-code-bg: rgba(74, 139, 123, 0.15);
            --inline-code-color: #67b3a0;
            --code-block-bg: #1a1a1a;
            --code-block-border: #333333;
            --code-block-shadow: rgba(0, 0, 0, 0.2);
            --code-lang-text: rgba(255, 255, 255, 0.4);
            --code-line-number: #8b949e;
          }
        }

        [data-theme="light"] {
          --theme-lightness: 15%;
          --background-color: #fffffd;
          --block-color: #eeeeee;
          --shadow-color: #cdcdcc;

          --inline-code-bg: rgba(103, 179, 160, 0.12);
          --inline-code-color: #1d5c47;
          --code-lang-text: var(--color-text-muted);
          --code-line-number: #1b1f23;
        }

        [data-theme="dark"] {
          --theme-lightness: 85%;
          --background-color: #0e0e0c;
          --block-color: #1e1e1e;
          --shadow-color: #323231;
          --accent-color: #4a8b7b;

          --inline-code-bg: rgba(74, 139, 123, 0.15);
          --inline-code-color: #67b3a0;
          --code-block-bg: #1a1a1a;
          --code-block-border: #333333;
          --code-block-shadow: rgba(0, 0, 0, 0.2);
          --code-lang-text: rgba(255, 255, 255, 0.4);
          --code-line-number: #8b949e;
        }
      `
    }
  ]
})
