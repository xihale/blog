import { getCollection } from 'astro:content';
import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { SITE_DESCRIPTION, SITE_TITLE } from '../consts';

export async function GET(context: APIContext) {
	const [blogPosts, fragmentPosts] = await Promise.all([
		getCollection('blog'),
		getCollection('fragments'),
	]);

	const sortedPosts = [
		...blogPosts.map((post) => ({ post, link: `/writing/${post.id}/` })),
		...fragmentPosts.map((post) => ({ post, link: `/fragments/${post.id}/` })),
	]
		.filter(({ post }) => !post.data.draft)
		.sort((a, b) => b.post.data.pubDate.valueOf() - a.post.data.pubDate.valueOf());

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
		items: sortedPosts.map(({ post, link }) => ({
			title: post.data.title,
			pubDate: post.data.pubDate,
			description: post.data.description || '',
			link,
			categories: post.data.tags,
		})),
	});
}
