import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
    loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
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