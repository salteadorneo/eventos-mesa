import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
    // Load Markdown and MDX files in the `src/content/blog/` directory.
    loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
    // Type-check frontmatter using a schema
    schema: ({ image }) =>
        z.object({
            title: z.string(),
            description: z.string(),
            start: z.coerce.date(),
            end: z.coerce.date().optional(),
            updatedDate: z.coerce.date().optional(),
            image: image().optional(),
            location: z.string().optional(),
            province: z.string().optional(),
            color: z.string().optional(),
            url: z.string().url().optional(),
            // Recurring event properties
            daysOfWeek: z.array(z.number()).optional(),
            startTime: z.string().optional(),
            endTime: z.string().optional(),
            startRecur: z.coerce.date().optional(),
            endRecur: z.coerce.date().optional(),
        }),
});

export const collections = { blog };