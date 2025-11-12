import { defineConfig } from "unocss";
import VariantGroup from "@unocss/transformer-variant-group";
import Directives from "@unocss/transformer-directives";

export default defineConfig({
  transformers: [VariantGroup(), Directives()],
  content: {
    filesystem: ['**/*.{astro,md,mdx}']
  },
  safelist: [
    // Ensure admonition classes are always generated
    'admonition',
    'admonition-error',
    'admonition-warning',
    'admonition-info',
    'admonition-note',
    'admonition-tip',
    'admonition-success',
    'admonition-question',
    'admonition-quote',
    'admonition-future'
  ],
  rules: [
    ["invisible", { visibility: "hidden" }],
    [/^animate-(.+)$/, ([, name]) => ({ animation: name })]
  ],
  shortcuts: [
    [
      "link",
      "underline decoration-transparent decoration-0.05em underline-offset-0.15em transition-text-decoration-color hover:decoration-current"
    ],
    ["input", "border-b-2 border-b-solid border-b-primary py-0.5 bg-transparent outline-none"],
    ["form-button", "m-a border-rd py-1 px-2 c-background bg-secondary"],
    ["pop", "opacity-0 invisible z-1 transition-[opacity,visibility] group-hover:(opacity-100 visible)"],
    ["animate-fade-in", "animate-[fadeIn_0.6s_ease-out_both]"],
    ["animate-slide-in", "animate-[slideInFromBottom_0.3s_ease-out_both]"],
    ["hover-lift", "hover:animate-[lift_0.15s_ease_forwards]"],
    ["skeleton", "bg-gradient-to-r from-[var(--color-surface)] via-[var(--color-border)] to-[var(--color-surface)] bg-[length:200px_100%] animate-[shimmer_1.5s_infinite]"],
    ["line-clamp-2", "overflow-hidden text-ellipsis line-clamp-2"],
    ["sr-only", "absolute w-1 h-1 p-0 m-[-1px] overflow-hidden clip-rect-[0_0_0_0] whitespace-nowrap border-0"],
    ["article-content", "font-sans text-[var(--color-text)] leading-7 text-[1.0625rem]"],

    // Layout utilities
    ["container-center", "max-w-3xl mx-auto px-4"],
    ["container-wide", "max-w-6xl mx-auto px-4"],
    ["flex-center", "flex items-center justify-center"],
    ["flex-center-col", "flex flex-col items-center justify-center"],
    ["section-spacing", "space-y-8"],
    ["content-spacing", "space-y-6"],
    ["text-spacing", "space-y-4"],

    // Typography utilities
    ["heading-hero", "text-5xl md:text-7xl font-serif font-light leading-tight tracking-tight"],
    ["heading-large", "text-3xl md:text-4xl lg:text-5xl font-serif font-light leading-tight tracking-tight"],
    ["heading-medium", "text-2xl md:text-3xl font-serif font-light text-weak tracking-wide py-2"],
    ["heading-small", "text-lg font-serif font-light text-primary"],
    ["heading-section", "text-sm font-serif font-light text-weak mb-6 tracking-wide"],
    ["body-text", "text-lg leading-relaxed"],
    ["meta-text", "text-sm text-secondary"],
    ["weak-text", "text-xs text-weak"],
    ["mono-text", "font-mono"],

    // Card/post utilities
    ["post-card", "group hover-lift block text-left"],
    ["post-title", "font-serif text-lg font-light mb-1 text-primary group-hover:text-[var(--article-link-color)]"],
    ["post-meta", "text-xs text-weak mt-1 block"],
    ["post-description", "text-sm text-weak line-clamp-2"],

    // Blog post components
    ["article-header", "mb-12 md:mb-16"],
    ["article-meta-container", "flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-secondary"],
    ["tag-container", "flex flex-wrap gap-2 justify-center"],
    ["tag", "text-xs text-weak bg-block/50 px-3 py-1 rounded-full"],
    ["tag-small", "text-xs text-weak bg-block/50 px-2 py-1 rounded"],
    ["divider", "w-full h-px bg-block/30"],

    // Navigation and header
    ["hero-section", "min-h-[80vh] flex-center"],
    ["content-wrapper", "text-center section-spacing max-w-3xl mx-auto"],

    // Border and section dividers
    ["section-border", "border-t border-block pt-8"],

    // Responsive spacing
    ["responsive-padding", "py-8 md:py-12"],
    ["responsive-margin", "mb-12 md:mb-16"],

    // Blog listing specific
    ["blog-post-item", "flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-8"],
    ["blog-date", "text-sm text-weak mono-text sm:w-24 flex-shrink-0"],
    ["blog-content", "flex-grow"],

    // Navigation and header utilities
    ["nav-header", "fixed top-0 left-0 right-0 bg-background/90 backdrop-blur-lg z-50 border-b border-block/30 shadow-sm"],
    ["nav-container", "container-wide px-6 py-4 flex items-center justify-between"],
    ["nav-logo", "text-xl font-serif font-extralight tracking-tight"],
    ["nav-link", "text-sm text-secondary hover:text-primary font-light"],
    ["nav-menu", "flex items-center space-x-8"],

    // GitHub-style minimal admonitions with better dark mode support
    ["admonition", "my-4 p-4 border-l-4 text-[var(--color-text)]"],
    ["admonition-note", "border-l-blue-500 bg-blue-100 dark:border-blue-400 dark:bg-blue-950/50 dark:text-blue-300"],
    ["admonition-tip", "border-l-green-500 bg-green-100 dark:border-green-400 dark:bg-green-950/50 dark:text-green-300"],
    ["admonition-info", "border-l-cyan-500 bg-cyan-100 dark:border-cyan-400 dark:bg-cyan-950/50 dark:text-cyan-300"],
    ["admonition-warning", "border-l-yellow-500 bg-yellow-100 dark:border-yellow-400 dark:bg-yellow-950/50 dark:text-yellow-300"],
    ["admonition-error", "border-l-red-500 bg-red-100 dark:border-red-400 dark:bg-red-950/50 dark:text-red-300"],
    ["admonition-danger", "border-l-red-500 bg-red-100 dark:border-red-400 dark:bg-red-950/50 dark:text-red-300"],
    ["admonition-success", "border-l-emerald-500 bg-emerald-100 dark:border-emerald-400 dark:bg-emerald-950/50 dark:text-emerald-300"],
    ["admonition-question", "border-l-purple-500 bg-purple-100 dark:border-purple-400 dark:bg-purple-950/50 dark:text-purple-300"],
    ["admonition-quote", "border-l-gray-500 bg-gray-100 dark:border-gray-400 dark:bg-gray-950/50 dark:text-gray-300"],
    ["admonition-future", "border-l-indigo-500 bg-indigo-100 dark:border-indigo-400 dark:bg-indigo-950/50 dark:text-indigo-300"]
  ],
  theme: {
    colors: {
      primary: "var(--primary-color)",
      secondary: "var(--secondary-color)",
      remark: "var(--remark-color)",
      weak: "var(--weak-color)",
      background: "var(--background-color)",
      block: "var(--block-color)",
      shadow: "var(--shadow-color)",
      selection: "var(--selection-color)"
    },
    fontFamily: {
      sans: "var(--font-sans)",
      serif: "var(--font-serif)",
      mono: "var(--font-monospace)",
      cursive: "var(--font-cursive)"
    }
  }
});