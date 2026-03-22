import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { SITE_DESCRIPTION, SITE_TITLE } from '../consts';

export async function GET(context: APIContext) {
	const posts = await getCollection('blog');

	const sortedPosts = posts
		.filter((post) => !post.data.draft)
		.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

	const siteUrl = context.site!.toString().replace(/\/$/, "");

	function escapeXml(unsafe: string) {
		return unsafe.replace(/[<>&'"]/g, function (c) {
			switch (c) {
				case '<': return '&lt;';
				case '>': return '&gt;';
				case '&': return '&amp;';
				case '\'': return '&apos;';
				case '"': return '&quot;';
			}
			return c;
		});
	}

	const xml = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${escapeXml(SITE_TITLE)}</title>
  <subtitle>${escapeXml(SITE_DESCRIPTION)}</subtitle>
  <link href="${siteUrl}/atom.xml" rel="self"/>
  <link href="${siteUrl}/"/>
  <updated>${sortedPosts[0]?.data.pubDate.toISOString() || new Date().toISOString()}</updated>
  <id>${siteUrl}/</id>
  <generator uri="https://astro.build/">Astro</generator>
  ${sortedPosts.map(post => {
      const postUrl = `${siteUrl}/writing/${post.id}/`;
      const description = post.data.description || '';
      const tags = post.data.tags || [];
      return `
  <entry>
    <title>${escapeXml(post.data.title)}</title>
    <link href="${postUrl}"/>
    <id>${postUrl}</id>
    <updated>${post.data.pubDate.toISOString()}</updated>
    <summary>${escapeXml(description)}</summary>
    ${tags.map(tag => `<category term="${escapeXml(tag)}"/>`).join('')}
  </entry>`;
  }).join('').trim()}
</feed>`;

	return new Response(xml, {
		headers: {
			'Content-Type': 'application/atom+xml; charset=utf-8',
		},
	});
}
