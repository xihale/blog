import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const postSchema = () =>
	z.object({
		title: z.string(),
		description: z.string(),
		// Optional cover image: site-root path under public/ (e.g. "/covers/<slug>.png")
		// or an absolute URL. Used for og:image and feed enclosures.
		cover: z.string().optional(),
		// Transform string to Date object
		pubDate: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
		draft: z.boolean().optional(),
		unlisted: z.boolean().optional(),
		featured: z.boolean().optional(),
		tags: z.array(z.string()).optional(),
		math: z.boolean().optional(),
		mermaid: z.boolean().optional(),
	});

const blog = defineCollection({
	// Load Markdown and MDX files in the `src/content/blog/` directory.
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	// Type-check frontmatter using a schema
	schema: postSchema,
});

const fragments = defineCollection({
	// Load Markdown and MDX files in the `src/content/fragments/` directory.
	loader: glob({ base: './src/content/fragments', pattern: '**/*.{md,mdx}' }),
	schema: postSchema,
});

const essays = defineCollection({
	// Load Markdown and MDX files in the `src/content/essays/` directory.
	loader: glob({ base: './src/content/essays', pattern: '**/*.{md,mdx}' }),
	schema: postSchema,
});

export const collections = { blog, fragments, essays };
