import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().default(''),
    date: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    thumbnail: z.string().nullable().optional(),
    series: z
      .union([
        z.string(),
        z.object({
          id: z.string().optional(),
          name: z.string(),
          url_slug: z.string().optional(),
        }),
      ])
      .optional()
      .transform((val) => {
        if (!val) return undefined;
        if (typeof val === 'string') return val;
        return val.name;
      }),
    seriesOrder: z.number().int().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    velogUrl: z.string().url().optional(),
  }),
});

export const collections = { blog };
