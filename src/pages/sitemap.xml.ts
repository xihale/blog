import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async ({ site }) => {
  if (!site) {
    return new Response('No site configuration found', { status: 500 });
  }

  // Remove trailing slash from site URL
  const siteUrl = typeof site === 'string' ? site : site.toString();
  const baseUrl = siteUrl.replace(/\/$/, '');

  // Get all blog posts
  const blogPosts = await getCollection('blog');

  // Define static pages
  const staticPages = [
    '',
    'about',
    'blog',
  ];

  // Generate sitemap XML
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticPages.map(page => `
  <url>
    <loc>${baseUrl}${page ? '/' + page : ''}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>${page === '' ? 'daily' : 'weekly'}</changefreq>
    <priority>${page === '' ? '1.0' : '0.8'}</priority>
  </url>`).join('')}
  ${blogPosts.map(post => `
  <url>
    <loc>${baseUrl}/blog/${post.id}</loc>
    <lastmod>${post.data.updatedDate ? new Date(post.data.updatedDate).toISOString() : post.data.pubDate ? new Date(post.data.pubDate).toISOString() : new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`).join('')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
};