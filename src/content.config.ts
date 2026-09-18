import { defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'
import { z } from 'astro/zod'
import { readFile } from 'node:fs/promises'
import { parsePostDate, readPostDates } from './lib/post-dates'

function normalizeList(value: string | string[]): string[] {
  return [...new Set((Array.isArray(value) ? value : value.split(',')).map(item => item.trim()).filter(Boolean))]
}

const articleDate = z.union([z.string(), z.date()]).transform(parsePostDate)
  .pipe(z.object({ date: z.date(), hasTime: z.boolean() }))
const files = glob({ pattern: '*.md', base: './public/markdown', generateId: ({ entry }) => entry.replace(/\.md$/i, '') })

const posts = defineCollection({
  // This remains the single source used by the restricted Feishu publisher.
  loader: {
    name: 'posts-with-date-precision',
    load: context => files.load({
      ...context,
      parseData: async entry => context.parseData({
        ...entry,
        data: { ...entry.data, ...(entry.filePath ? readPostDates(await readFile(entry.filePath, 'utf8')) : {}) },
      }),
    }),
  },
  schema: z.object({
    title: z.string().min(1),
    index: z.number().int().min(0).default(0),
    summary: z.string().default(''),
    description: z.string().optional(),
    category: z.union([z.string(), z.array(z.string())]).default('其他').transform(value => normalizeList(value)[0] ?? '其他'),
    tags: z.union([z.string(), z.array(z.string())]).default([]).transform(normalizeList),
    date: articleDate.optional(),
    published: articleDate.optional(),
    updated_at: articleDate.optional(),
    updated: articleDate.optional(),
    draft: z.boolean().default(false),
  }).refine(data => Boolean(data.date || data.published), { message: 'Article needs its original publication date' })
    .transform(({ date, published, summary, description, updated_at, updated, ...data }) => ({
      ...data,
      description: description ?? summary,
      published: (published ?? date)!.date,
      publishedHasTime: (published ?? date)!.hasTime,
      updated: (updated_at ?? updated)?.date,
      updatedHasTime: (updated_at ?? updated)?.hasTime ?? false,
    })),
})

export const collections = { posts }
