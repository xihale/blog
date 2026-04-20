import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
	// Load Markdown and MDX files in the `src/content/blog/` directory.
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	// Type-check frontmatter using a schema
		schema: () =>
		z.object({
			title: z.string(),
			description: z.string(),
			// Transform string to Date object
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			draft: z.boolean().optional(),
			unlisted: z.boolean().optional(),
			tags: z.array(z.string()).optional(),
			math: z.boolean().optional(),
			mermaid: z.boolean().optional(),
			comments: z.boolean().optional(),
		}),
});

export const collections = { blog };
