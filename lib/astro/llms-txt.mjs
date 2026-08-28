// @ts-check
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * @typedef {{ urlPath: string, title: string }} PageEntry
 */

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
 * Build-time integration: emit a spec-conformant dist/llms.txt (one H1, a
 * summary blockquote, markdown link sections) from the built pages, so it
 * stays in sync with the content without hand maintenance. Redirect stub
 * pages (title "Redirecting to: ...") are excluded.
 *
 * @param {{ site: string }} options
 */
export function llmsTxt({ site }) {
  return {
    name: "llms-txt",
    hooks: {
      /**
       * @param {{
       *   dir: URL,
       *   logger: { warn(message: string): void, info(message: string): void },
       * }} options
       */
      "astro:build:done": ({ dir, logger }) => {
        const dirPath = fileURLToPath(dir);

        const homeHtml = fs.readFileSync(path.join(dirPath, "index.html"), "utf8");
        const siteTitle = homeHtml.match(/<title>([^<]*)<\/title>/)?.[1] ?? "";
        const siteDescription =
          homeHtml.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? "";

        if (!siteTitle) {
          logger.warn("llms-txt: could not read site title from dist/index.html");
          return;
        }

        const titleSuffix = ` | ${siteTitle}`;
        /** @type {PageEntry[]} */
        const pages = [];
        for (const htmlFile of walkFiles(dirPath, ".html")) {
          const title = fs.readFileSync(htmlFile, "utf8").match(/<title>([^<]*)<\/title>/)?.[1];
          if (!title || title.startsWith("Redirecting to")) continue;

          const relPath = path.relative(dirPath, htmlFile).split(path.sep).join("/");
          // Directory-format URLs keep their trailing slash, matching the
          // canonical links and sitemap entries for the same pages.
          const withoutIndex = relPath.replace(/(^|\/)index\.html$/, "/");
          const urlPath = withoutIndex.startsWith("/") ? withoutIndex : `/${withoutIndex}`;
          pages.push({
            urlPath,
            title: title.endsWith(titleSuffix) ? title.slice(0, -titleSuffix.length) : title,
          });
        }
        pages.sort((a, b) => a.urlPath.localeCompare(b.urlPath));

        const posts = [];
        const listingPages = [];
        for (const page of pages) {
          if (page.urlPath.startsWith("/writing/") && page.urlPath !== "/writing/") {
            posts.push(page);
          } else {
            listingPages.push(page);
          }
        }

        /** @param {PageEntry} page */
        const link = (page) =>
          `- [${page.title.replace(/[[\]]/g, "")}](${new URL(page.urlPath, site).href})`;

        const sections = [
          `## Pages`,
          "",
          ...listingPages.map(link),
          "",
          `## Posts`,
          "",
          ...posts.map(link),
          "",
          `## Feeds`,
          "",
          `- [Atom feed](${new URL("/atom.xml", site).href})`,
          `- [RSS feed](${new URL("/rss.xml", site).href})`,
          `- [Sitemap](${new URL("/sitemap-index.xml", site).href})`,
          "",
        ];
        const header = [`# ${siteTitle}`, "", `> ${siteDescription}`, ""];
        const output = [...header, ...sections].join("\n");

        fs.writeFileSync(path.join(dirPath, "llms.txt"), output);
        logger.info(
          `llms-txt: wrote dist/llms.txt (${posts.length} posts, ${listingPages.length} pages)`,
        );
      },
    },
  };
}
