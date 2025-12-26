import { getCollection } from 'astro:content';
import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { SITE_DESCRIPTION, SITE_TITLE } from '../consts';

export async function GET(context: APIContext) {
	const posts = await getCollection('blog');

	// Filter out drafts, but include unlisted posts. Sort by pubDate descending.
	const sortedPosts = posts
		.filter((post) => !post.data.draft)
		.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

	return rss({
		stylesheet: '/rss-style.xsl',
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: context.site || 'https://yourdomain.com',
		items: sortedPosts.map((post) => ({
			title: post.data.title,
			pubDate: post.data.pubDate,
			description: post.data.description,
			link: `/blog/${post.id}/`,
		})),
	});
}
