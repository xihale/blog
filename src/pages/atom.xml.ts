import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { SITE_DESCRIPTION, SITE_TITLE } from '../consts';
import { coverBytes, coverMime, coverUrl } from '../utils/cover';

export async function GET(context: APIContext) {
	const [blogPosts, fragmentPosts, essayPosts] = await Promise.all([
		getCollection('blog'),
		getCollection('fragments'),
		getCollection('essays'),
	]);

	const sortedPosts = [
		...blogPosts.map((post) => ({ post, link: `/writing/${post.id}/` })),
		...fragmentPosts.map((post) => ({ post, link: `/fragments/${post.id}/` })),
		...essayPosts.map((post) => ({ post, link: `/essays/${post.id}/` })),
	]
		.filter(({ post }) => !post.data.draft && !post.data.unlisted)
		.sort((a, b) => b.post.data.pubDate.valueOf() - a.post.data.pubDate.valueOf());

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
  <updated>${sortedPosts[0]?.post.data.pubDate.toISOString() || new Date().toISOString()}</updated>
  <id>${siteUrl}/</id>
  <generator uri="https://astro.build/">Astro</generator>
  ${sortedPosts.map(({ post, link }) => {
      const postUrl = `${siteUrl}${link}`;
      const description = post.data.description || '';
      const tags = post.data.tags || [];
      const cover = post.data.cover;
      const enclosureLink = cover
        ? `\n    <link rel="enclosure" href="${escapeXml(coverUrl(cover, siteUrl))}" type="${coverMime(cover)}" length="${coverBytes(cover)}"/>`
        : '';
      return `
  <entry>
    <title>${escapeXml(post.data.title)}</title>
    <link href="${postUrl}"/>${enclosureLink}
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
