<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="3.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html xmlns="http://www.w3.org/1999/xhtml" lang="zh-CN">
      <head>
        <title><xsl:value-of select="/rss/channel/title"/> - RSS Feed</title>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <style type="text/css">
          @font-face {
            font-family: "LXGW WenKai";
            font-style: normal;
            font-weight: normal;
            font-display: swap;
            src: local("Times New Roman"), local("serif"), url("/fonts/lxgw.woff2") format("woff2");
          }

          :root {
            --font-serif: "Times New Roman", "LXGW WenKai", serif;
            --font-sans: var(--font-serif), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            
            /* Light mode variables */
            --color-text: #222;
            --color-text-secondary: #666;
            --color-background: #fffffd;
            --color-surface: #fff;
            --color-border: #eee;
            --color-link: #4d6da6;
            --color-link-hover: #334971;
            --color-accent: #2d7a66;
            --notice-bg: #e7f3ff;
            --notice-border: #cce5ff;
            --notice-text: #004085;
          }

          @media (prefers-color-scheme: dark) {
            :root {
              /* Dark mode variables */
              --color-text: #d6d6d6;
              --color-text-secondary: #999;
              --color-background: #0e0e0c;
              --color-surface: #1e1e1e;
              --color-border: #323231;
              --color-link: #8fa7d8;
              --color-link-hover: #b8cce8;
              --color-accent: #4a8b7b;
              --notice-bg: rgba(29, 92, 71, 0.2);
              --notice-border: #2d7a66;
              --notice-text: #b8cce8;
            }
          }

          body {
            font-family: var(--font-sans);
            color: var(--color-text);
            background-color: var(--color-background);
            line-height: 1.6;
            margin: 0;
            padding: 2rem 1rem;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            box-sizing: border-box;
          }

          .container {
            width: 100%;
            max-width: 56rem;
            margin: 0 auto;
          }

          header {
            margin-bottom: 3rem;
            padding-bottom: 2rem;
            border-bottom: 1px solid var(--color-border);
          }

          h1 {
            margin: 0 0 0.5rem 0;
            font-size: 2rem;
            font-weight: normal;
            font-family: var(--font-serif);
          }

          .description {
            color: var(--color-text-secondary);
            margin: 0;
            font-size: 1.1rem;
          }

          .notice {
            background: var(--notice-bg);
            border: 1px solid var(--notice-border);
            color: var(--notice-text);
            padding: 1rem;
            border-radius: 4px;
            margin-bottom: 2rem;
            font-size: 0.95rem;
          }

          .item {
            margin-bottom: 2.5rem;
            padding-bottom: 2.5rem;
            border-bottom: 1px dashed var(--color-border);
          }

          .item:last-child {
            border-bottom: none;
          }

          .item h2 {
            margin: 0 0 0.5rem 0;
            font-size: 1.5rem;
            font-weight: normal;
            font-family: var(--font-serif);
          }

          .item h2 a {
            color: var(--color-text);
            text-decoration: none;
            transition: color 0.2s;
          }

          .item h2 a:hover {
            color: var(--color-link);
          }

          .item-meta {
            color: var(--color-text-secondary);
            font-size: 0.9rem;
            margin-bottom: 1rem;
            font-family: "JetBrains Mono", var(--font-mono), monospace;
          }

          .item-description {
            color: var(--color-text);
            line-height: 1.7;
          }
          
          a {
            color: var(--color-link);
            text-decoration: none;
          }
          
          a:hover {
            color: var(--color-link-hover);
            text-decoration: underline;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <header>
            <h1><xsl:value-of select="/rss/channel/title"/></h1>
            <p class="description"><xsl:value-of select="/rss/channel/description"/></p>
          </header>
          
          <div class="notice">
            <p style="margin: 0;">
              <strong>About RSS:</strong> 这是一个 RSS 订阅源。您可以使用 RSS 阅读器（如 NetNewsWire, Reeder, Feedly 等）订阅此链接，以便在不访问网站的情况下及时获取最新内容。
            </p>
          </div>

          <xsl:for-each select="/rss/channel/item">
            <div class="item">
              <h2>
                <a href="{link}" target="_blank"><xsl:value-of select="title"/></a>
              </h2>
              <div class="item-meta">
                <xsl:value-of select="substring(pubDate, 1, 16)"/>
              </div>
              <div class="item-description">
                <xsl:value-of select="description"/>
              </div>
            </div>
          </xsl:for-each>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>