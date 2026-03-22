// src/content.config.ts
// Schema must stay in sync with keystatic.config.ts / src/content.config.ts
// Source: https://docs.astro.build/en/guides/content-collections/
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.{mdoc,yaml}', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    techStack: z.array(z.string()).default([]),
    media: z.string().optional().nullable(),
    links: z.array(z.object({
      label: z.string(),
      url: z.string().url(),
    })).default([]),
    year: z.number().int(),
  }),
});

const posts = defineCollection({
  loader: glob({ pattern: '**/*.mdoc', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    tags: z.array(z.string()).default([]),
    coverImage: z.string().optional(),
    draft: z.boolean().default(false),
    excerpt: z.string().optional(),
    publishedDate: z.coerce.date(),
  }),
});

const podcasts = defineCollection({
  loader: glob({ pattern: '**/*.{mdoc,yaml}', base: './src/content/podcasts' }),
  schema: z.object({
    name: z.string(),
    link: z.string().url(),
    coverImage: z.string().optional(),
    category: z.string().optional(),
  }),
});

const books = defineCollection({
  loader: glob({ pattern: '**/*.{mdoc,yaml}', base: './src/content/books' }),
  schema: z.object({
    title: z.string(),
    author: z.string(),
    coverImage: z.string().optional(),
    status: z.enum(['reading', 'read', 'want-to-read']).default('want-to-read'),
    note: z.string().optional(),
  }),
});

const bio = defineCollection({
  loader: glob({ pattern: '**/*.mdoc', base: './src/content/bio' }),
  schema: z.object({}),
});

export const collections = { projects, posts, podcasts, books, bio };
