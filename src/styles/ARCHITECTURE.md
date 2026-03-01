# CSS Architecture

## Styling ownership

- `src/styles/global.css`
  - **Only** global foundations: design tokens, reset, base layout shell, and cross-route primitives.
  - Must not contain component-specific visuals.
- `src/components/*.module.css`
  - Component visuals, interaction states, and internal layout.
  - Default choice for reusable UI components.
- `src/styles/components/*.css`
  - Reserved for content/prose domains that are intentionally global.
  - Import these files only from content routes/layouts (e.g. `BlogPost.astro`, `MarkdownPageLayout.astro`) instead of `global.css`.
- `src/styles/shiki.css` and code-related overrides
  - Third-party renderer customization only.

## UnoCSS usage

- Use UnoCSS for high-reuse utility concerns: spacing, flex/grid, sizing, responsive utilities.
- Prefer tokens via CSS variables (e.g. `text-[var(--color-text-muted)]`, `bg-[var(--color-background)]`).
- Avoid long chains for component-specific states; move those to CSS Modules.

## Coupling guardrails

- Do not style component internals from `global.css`.
- Do not reuse article/prose container classes for non-article routes.
- Keep `!important` limited to third-party override files, with a short comment explaining why.
- Prefer CSS Modules for component-level files (e.g. `Header`, `LinkCard`, `LinkGroupSection`, `TableOfContents`).
