#!/usr/bin/env node

import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";

const REPO = process.env.GITHUB_REPOSITORY || "xihale/blog";
const API = "https://api.github.com";
const TOKEN = process.env.GITHUB_TOKEN;
const EVENT_NAME = process.env.GITHUB_EVENT_NAME;
const SYNC_MODE = normalizeSyncMode(process.env.COMMENTS_SYNC_MODE, EVENT_NAME);
const BLOG_DIR = join(process.cwd(), "src/content/blog");
const OUTPUT = join(process.cwd(), "src/data/comments.json");
const ISSUE_LABEL = "blog-comment";

function normalizeSyncMode(input, eventName) {
  const value = input?.toLowerCase().trim();
  if (value === "read" || value === "readonly" || value === "read-only") {
    return "readonly";
  }
  if (value === "write") {
    return "write";
  }
  return eventName === "pull_request" ? "readonly" : "write";
}

async function api(path, opts = {}) {
  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "comments-sync",
  };
  if (TOKEN) headers.Authorization = `Bearer ${TOKEN}`;
  const url = path.startsWith("http") ? path : `${API}${path}`;
  const res = await fetch(url, {
    ...opts,
    headers: { ...headers, ...(opts.headers || {}) },
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
  return res;
}

async function apiAll(path, opts = {}) {
  const results = [];
  let url = `${API}${path}${path.includes("?") ? "&" : "?"}per_page=100`;
  while (url) {
    const res = await api(url, opts);
    const data = await res.json();
    results.push(...data);
    const link = res.headers.get("link") || "";
    const next = link.match(/<([^>]+)>;\s*rel="next"/);
    url = next ? next[1] : null;
  }
  return results;
}

function parseFrontmatter(content) {
  // Allow optional BOM or spaces before the first ---
  const m = content.match(/^\s*---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return {};
  const y = m[1];
  const title = y.match(/^title:\s*['"]?(.+?)['"]?\s*$/m)?.[1];
  const comments = parseBooleanField(y, "comments");
  const draft = parseBooleanField(y, "draft");
  const unlisted = parseBooleanField(y, "unlisted");
  const issueIdMatch = y.match(/^issueId:\s*(\d+)/m);
  const issueId = issueIdMatch ? parseInt(issueIdMatch[1], 10) : null;
  return { title, comments, draft, unlisted, issueId };
}

function parseBooleanField(frontmatter, key) {
  const match = frontmatter.match(
    new RegExp(`^${key}:\\s*(true|false)\\s*(?:#.*)?$`, "im"),
  );
  return match ? match[1].toLowerCase() === "true" : false;
}

async function getCommentPosts() {
  const entries = [];
  const files = await readdir(BLOG_DIR, { recursive: true });
  for (const f of files) {
    if (!/\.(md|mdx)$/.test(f)) continue;
    const filePath = join(BLOG_DIR, f);
    const content = await readFile(filePath, "utf-8");
    const fm = parseFrontmatter(content);
    if (fm.comments && fm.title && !fm.draft && !fm.unlisted) {
      entries.push({ slug: f.replace(/\.(md|mdx)$/, ""), title: fm.title, issueId: fm.issueId, filePath });
    }
  }
  return entries;
}

async function injectIssueId(filePath, issueNumber) {
  const content = await readFile(filePath, "utf-8");
  const m = content.match(/^(\s*---\r?\n)([\s\S]*?)(\r?\n---)/);
  if (m) {
    const rawFm = m[2];
    if (/^issueId:\s*\d+/m.test(rawFm)) return; // Already injected
    const newContent = content.replace(
      m[0], 
      `${m[1]}${rawFm}\nissueId: ${issueNumber}${m[3]}`
    );
    await writeFile(filePath, newContent, "utf-8");
    console.log(`  -> Injected issueId: ${issueNumber} into ${filePath}`);
  }
}

function canCreateCommentIssues() {
  return SYNC_MODE === "write";
}

async function ensureLabel() {
  try {
    await api(`/repos/${REPO}/labels`, {
      method: "POST",
      body: JSON.stringify({
        name: ISSUE_LABEL,
        color: "ededed",
        description: "Blog post comments",
      }),
    });
  } catch {}
}

async function findIssueBySlug(slug) {
  const issues = await apiAll(
    `/repos/${REPO}/issues?state=all&labels=${ISSUE_LABEL}`,
  );
  for (const issue of issues) {
    if (issue.body && issue.body.includes(`<!-- slug: ${slug} -->`)) {
      return issue;
    }
  }
  return null;
}

async function createCommentIssue(slug, title) {
  const issue = await (
    await api(`/repos/${REPO}/issues`, {
      method: "POST",
      body: JSON.stringify({
        title: `Comments · ${slug}`,
        body: `<!-- slug: ${slug} -->\n\nComments for "${title}".`,
        labels: [ISSUE_LABEL],
      }),
    })
  ).json();
  await api(`/repos/${REPO}/issues/${issue.number}`, {
    method: "PATCH",
    body: JSON.stringify({ state: "closed" }),
  });
  return { number: issue.number, url: issue.html_url };
}

async function getComments(issueNumber) {
  const comments = await apiAll(
    `/repos/${REPO}/issues/${issueNumber}/comments`,
    { headers: { Accept: "application/vnd.github.full+json" } },
  );
  return comments.map((c) => ({
    id: c.id,
    user: c.user.login,
    avatarUrl: c.user.avatar_url,
    userUrl: c.user.html_url,
    createdAt: c.created_at,
    commentUrl: c.html_url,
    bodyHtml: c.body_html || escapeHtml(c.body),
  }));
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br>");
}

async function main() {
  await mkdir(join(process.cwd(), "src/data"), { recursive: true });

  if (!TOKEN) {
    console.log("GITHUB_TOKEN not set.");
    try {
      const existing = await readFile(OUTPUT, "utf-8");
      if (existing && existing.trim() !== "" && existing.trim() !== "{}") {
        console.log("Existing comments data found. Preserving it.");
        return;
      }
    } catch {}
    console.log("Creating empty comments data.");
    await writeFile(OUTPUT, "{}");
    return;
  }

  const posts = await getCommentPosts();
  let createdIssues = 0;
  let skippedIssues = 0;

  console.log(`Comment sync mode: ${SYNC_MODE}`);
  console.log(`Found ${posts.length} posts with comments enabled`);

  if (posts.length === 0) {
    await writeFile(OUTPUT, "{}");
    return;
  }

  if (canCreateCommentIssues()) {
    await ensureLabel();
  } else {
    console.log("Read-only comment sync: skipping label and issue creation");
  }

  const data = {};
  for (const post of posts) {
    console.log(`Processing: ${post.slug}`);
    let issueNumber, issueUrl;
    
    if (post.issueId) {
      issueNumber = post.issueId;
      issueUrl = `https://github.com/${REPO}/issues/${issueNumber}`;
    } else {
      const existing = await findIssueBySlug(post.slug);
      if (existing) {
        issueNumber = existing.number;
        issueUrl = existing.html_url;
        await injectIssueId(post.filePath, issueNumber);
      } else if (!canCreateCommentIssues()) {
        console.log(`  Skipping issue creation during ${EVENT_NAME}: ${post.slug}`);
        skippedIssues += 1;
        continue;
      } else {
        console.log(`  Creating issue for: ${post.slug}`);
        const created = await createCommentIssue(post.slug, post.title);
        issueNumber = created.number;
        issueUrl = created.url;
        createdIssues += 1;
        await injectIssueId(post.filePath, issueNumber);
      }
    }

    const comments = await getComments(issueNumber);
    console.log(`  ${comments.length} comments`);
    data[post.slug] = {
      issueNumber,
      issueUrl,
      articleTitle: post.title,
      comments,
    };
  }

  await writeFile(OUTPUT, JSON.stringify(data, null, 2));
  console.log(`Created issues: ${createdIssues}`);
  console.log(`Skipped missing issues: ${skippedIssues}`);
  console.log(`Saved to ${OUTPUT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
