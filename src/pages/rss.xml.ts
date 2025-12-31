import { getCollection } from 'astro:content';
import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { SITE_DESCRIPTION, SITE_TITLE } from '../consts';

export async function GET(context: APIContext) {
	const posts = await getCollection('blog');

	const sortedPosts = posts
		.filter((post) => !post.data.draft)
		.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

	return rss({
		xmlns: {
			atom: 'http://www.w3.org/2005/Atom',
		},
		stylesheet: '/rss-style.xsl',
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: context.site!,
		customData: `<language>zh-CN</language>
<lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
<atom:link href="${context.site}rss.xml" rel="self" type="application/rss+xml"/>`,
		items: sortedPosts.map((post) => ({
			title: post.data.title,
			pubDate: post.data.pubDate,
			description: post.data.description || '',
			link: `/blog/${post.id}/`,
			categories: post.data.tags,
		})),
	});
}
