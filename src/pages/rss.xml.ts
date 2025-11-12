import { getCollection } from 'astro:content';
import rss from '@astrojs/rss';
import { SITE_DESCRIPTION, SITE_TITLE } from '../consts';

export async function GET(context) {
	const posts = await getCollection('blog');
	// Sort posts by date (newest first)
	const sortedPosts = posts.sort((a, b) => {
		const dateA = new Date(a.data.pubDate);
		const dateB = new Date(b.data.pubDate);
		return dateB.getTime() - dateA.getTime();
	});

	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: context.site,
		items: sortedPosts.map((post) => ({
			...post.data,
			link: `/blog/${post.id}/`,
		})),
	});
}
