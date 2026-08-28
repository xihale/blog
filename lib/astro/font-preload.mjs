// @ts-check
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Matches the LXGW WenKai subset declarations emitted into dist CSS
// (keyed on the font-family declared in global.css, not on file names).
const FONT_URL_RE =
  /@font-face\s*{[^{}]*?font-family:\s*['"]?LXGW WenKai['"]?[^{}]*?url\(['"]?([^)'"]*\.woff2)['"]?\)[^{}]*?unicode-range:\s*([^;}]+)[^{}]*}/gs;

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
 * <link rel="preload"> for them so the woff2 files download while the
 * async font stylesheet is still in flight (cuts FOUT and the font-swap
 * layout shift). fetchpriority="low" keeps them from competing with
 * high-priority LCP images such as the homepage avatar.
 */
export function fontPreload({ maxPerpage = 12 } = {}) {
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
        for (const cssFile of walkFiles(dirPath, ".css")) {
          const css = fs.readFileSync(cssFile, "utf8");
          for (const m of css.matchAll(FONT_URL_RE)) {
            const url = (m[1] ?? "").trim().replace(/^['"]|['"]$/g, "");
            subsets.push({ url, ranges: parseUnicodeRanges(m[2] ?? "") });
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

          const used = new Set();
          for (const ch of extractText(html)) used.add(ch.codePointAt(0));

          const matched = subsets
            .filter((s) => s.ranges.some(([min, max]) => {
              for (const cp of used) if (cp >= min && cp <= max) return true;
              return false;
            }))
            .slice(0, maxPerpage);
          if (matched.length === 0) continue;

          const tags = matched
            .map(
              (s) =>
                `<link rel="preload" as="font" type="font/woff2" crossorigin fetchpriority="low" href="${s.url}">`,
            )
            .join("");
          fs.writeFileSync(
            htmlFile,
            html.replace("</head>", `${tags}</head>`),
          );
          pages++;
          links += matched.length;
        }
        logger.info(`font-preload: injected ${links} font preloads across ${pages} pages`);
      },
    },
  };
}
