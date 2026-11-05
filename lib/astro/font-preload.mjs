// @ts-check
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Matches the LXGW WenKai subset declarations emitted into dist CSS
// (keyed on the font-family declared in global.css, not on file names).
const FONT_URL_RE =
  /@font-face\s*{[^{}]*?font-family:\s*['"]?LXGW WenKai['"]?[^{}]*?url\(['"]?([^)'"]*\.woff2)['"]?\)[^{}]*?unicode-range:\s*([^;}]+)[^{}]*}/gs;

// The single JetBrains Mono declaration from src/styles/fonts.css (no
// unicode-range subsetting — one file covers the whole family).
const JBMONO_URL_RE =
  /@font-face\s*{[^{}]*?font-family:\s*['"]?JetBrains Mono['"]?[^{}]*?url\(['"]?([^)'"]*\.woff2)['"]?\)[^{}]*}/s;

const ENTITIES = /** @type {Record<string, string>} */ ({
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
});

/**
 * @param {string} text
 */
function decodeEntities(text) {
  return text.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (match, body) => {
    if (body[0] === "#") {
      const code =
        body[1] === "x" || body[1] === "X"
          ? parseInt(body.slice(2), 16)
          : parseInt(body.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : match;
    }
    return ENTITIES[body] ?? match;
  });
}

/**
 * @param {string} html
 * @returns {string}
 */
function extractText(html) {
  return decodeEntities(
    html
      .replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, " ")
      .replace(/<!--[\s\S]*?-->/g, " ")
      .replace(/<[^>]+>/g, " "),
  );
}

/**
 * @param {string} value
 * @returns {[number, number][]}
 */
function parseUnicodeRanges(value) {
  /** @type {[number, number][]} */
  const ranges = [];
  for (const part of value.split(",")) {
    const p = part.trim().replace(/^u\+/i, "");
    if (p.includes("-")) {
      const [a, b] = p.split("-");
      const min = Number.parseInt(a ?? "", 16);
      const max = Number.parseInt(b ?? "", 16);
      if (Number.isFinite(min) && Number.isFinite(max)) ranges.push([min, max]);
    } else if (p.includes("?")) {
      const min = Number.parseInt(p.replace(/\?/g, "0"), 16);
      const max = Number.parseInt(p.replace(/\?/g, "f"), 16);
      if (Number.isFinite(min) && Number.isFinite(max)) ranges.push([min, max]);
    } else {
      const v = Number.parseInt(p, 16);
      if (Number.isFinite(v)) ranges.push([v, v]);
    }
  }
  return ranges;
}

/**
 * @param {string} root
 * @param {string} ext
 * @returns {Generator<string>}
 */
function* walkFiles(root, ext) {
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const full = path.join(root, entry.name);
    if (entry.isDirectory()) yield* walkFiles(full, ext);
    else if (entry.name.endsWith(ext)) yield full;
  }
}

/**
 * Build-time integration: for each generated HTML page, work out which
 * LXGW WenKai unicode-range subsets the page actually uses and emit
 * <link rel="preload"> for them so the woff2 files download at parse time
 * instead of at layout time: with font-display: swap that is what makes the
 * real glyphs land in (or right after) the first paint instead of trickling
 * in per wave seconds later — no refresh ever needed to get the font.
 *
 * Subsets are ranked by how often their code points occur on the page, so
 * body text rides the preloads and rare glyphs are the ones left behind. The
 * cap only bounds pathological pages; 40 covers the current content (max 32
 * subsets/page). Subsets past the cap are still fetched, just later, so
 * their glyphs swap in a beat behind the rest.
 *
 * No fetchpriority override: preload-as-font is high priority by default.
 * The high-tier LCP it competes with (the homepage avatar) is a few-KB
 * webp, so sharing the tier costs it little.
 */
export function fontPreload({ maxPerpage = 40 } = {}) {
  return {
    name: "font-preload",
    hooks: {
      /**
       * @param {{
       *   dir: URL,
       *   logger: { warn(message: string): void, info(message: string): void },
       * }} options
       */
      "astro:build:done": ({ dir, logger }) => {
        const dirPath = fileURLToPath(dir);
        const subsets = [];
        let jbmonoUrl = null;
        for (const cssFile of walkFiles(dirPath, ".css")) {
          const css = fs.readFileSync(cssFile, "utf8");
          for (const m of css.matchAll(FONT_URL_RE)) {
            const url = (m[1] ?? "").trim().replace(/^['"]|['"]$/g, "");
            subsets.push({ url, ranges: parseUnicodeRanges(m[2] ?? "") });
          }
          if (!jbmonoUrl) {
            const m = css.match(JBMONO_URL_RE);
            if (m) jbmonoUrl = m[1].trim().replace(/^['"]|['"]$/g, "");
          }
        }
        if (subsets.length === 0) {
          logger.warn("font-preload: no LXGW @font-face subsets found in dist CSS");
          return;
        }

        let pages = 0;
        let links = 0;
        for (const htmlFile of walkFiles(dirPath, ".html")) {
          const html = fs.readFileSync(htmlFile, "utf8");
          if (!html.includes("</head>")) continue;

          // Only pages that actually render mono glyphs (inline code, dates,
          // tags) get the JetBrains Mono preload; its woff2 is one ~90 KB
          // file, so don't ship it to pages that would never use it.
          const usesMono = /<(code|time|pre)[\s>]/.test(html);
          if (usesMono && !jbmonoUrl) {
            logger.warn("font-preload: mono glyphs on page but no JetBrains Mono @font-face url found in dist CSS");
          }

          const counts = new Map();
          for (const ch of extractText(html)) {
            const cp = ch.codePointAt(0);
            counts.set(cp, (counts.get(cp) ?? 0) + 1);
          }

          const matched = subsets
            .map((s) => ({
              url: s.url,
              score: s.ranges.reduce((sum, [min, max]) => {
                for (const [cp, n] of counts) if (cp >= min && cp <= max) sum += n;
                return sum;
              }, 0),
            }))
            .filter((s) => s.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, maxPerpage);
          if (matched.length === 0 && !usesMono) continue;

          const tags = [
            ...(usesMono && jbmonoUrl
              ? [`<link rel="preload" as="font" type="font/woff2" crossorigin href="${jbmonoUrl}">`]
              : []),
            ...matched.map(
              (s) =>
                `<link rel="preload" as="font" type="font/woff2" crossorigin href="${s.url}">`,
            ),
          ].join("");
          fs.writeFileSync(
            htmlFile,
            html.replace("</head>", `${tags}</head>`),
          );
          pages++;
          links += tags ? matched.length + (usesMono && jbmonoUrl ? 1 : 0) : 0;
        }
        logger.info(`font-preload: injected ${links} font preloads across ${pages} pages`);
      },
    },
  };
}
