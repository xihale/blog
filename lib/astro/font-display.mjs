// @ts-check
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Matches the LXGW WenKai @font-face blocks emitted into dist CSS, keyed on
// the font-family declared in global.css (not on file names).
const LXGW_FACE_RE =
  /@font-face\s*{[^{}]*?font-family:\s*['"]?LXGW WenKai['"]?[^{}]*?}/gs;

/**
 * Build-time integration: lxgw-wenkai-webfont ships its 97-subset stylesheet
 * with font-display: swap. While the subsets stream in, each wave repaints
 * its glyphs — the whole body text is LXGW, so cold visits flicker the full
 * page and repeat visits jump whenever the stylesheet loses the race against
 * first paint. Rewriting to `optional` pins every pageview to either the
 * subset (cached, ready before paint) or the fallback for the entire view;
 * a mid-pageview swap is impossible either way. JetBrains Mono is set at the
 * source in src/styles/fonts.css.
 */
export function fontDisplayOptional() {
  return {
    name: "font-display-optional",
    hooks: {
      /**
       * @param {{
       *   dir: URL,
       *   logger: { warn(message: string): void, info(message: string): void },
       * }} options
       */
      "astro:build:done": ({ dir, logger }) => {
        const dirPath = fileURLToPath(dir);
        let files = 0;
        let rules = 0;

        /**
         * @param {string} root
         * @returns {Generator<string>}
         */
        function* walkCss(root) {
          for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
            const full = path.join(root, entry.name);
            if (entry.isDirectory()) yield* walkCss(full);
            else if (entry.name.endsWith(".css")) yield full;
          }
        }

        for (const cssFile of walkCss(dirPath)) {
          const css = fs.readFileSync(cssFile, "utf8");
          if (!css.includes("LXGW WenKai") || !css.includes("font-display")) {
            continue;
          }
          const patched = css.replace(LXGW_FACE_RE, (block) =>
            block.replace(/font-display:\s*swap/g, "font-display: optional"),
          );
          if (patched === css) continue;
          fs.writeFileSync(cssFile, patched);
          files++;
          rules += patched.match(/font-display:\s*optional/g)?.length ?? 0;
        }

        if (files === 0) {
          logger.warn(
            "font-display-optional: no LXGW font-display: swap rules found in dist CSS",
          );
        } else {
          logger.info(
            `font-display-optional: rewrote ${rules} @font-face rules across ${files} CSS file(s)`,
          );
        }
      },
    },
  };
}
