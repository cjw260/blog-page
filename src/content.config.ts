import { defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'
import { z } from 'astro/zod'

function normalizeList(value: string | string[]): string[] {
  return [...new Set((Array.isArray(value) ? value : value.split(',')).map(item => item.trim()).filter(Boolean))]
}

// Legacy date is a calendar day in China, not the checkout/build timestamp.
function publicationDate(value: unknown): unknown {
  if (value instanceof Date) return `${value.toISOString().slice(0, 10)}T00:00:00+08:00`
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) return `${value}T00:00:00+08:00`
  return value
}

const posts = defineCollection({
  // This remains the single source used by the restricted Feishu publisher.
  loader: glob({ pattern: '*.md', base: './public/markdown', generateId: ({ entry }) => entry.replace(/\.md$/i, '') }),
  schema: z.object({
    title: z.string().min(1),
    index: z.number().int().min(0).default(0),
    summary: z.string().default(''),
    description: z.string().optional(),
    category: z.union([z.string(), z.array(z.string())]).default('其他').transform(value => normalizeList(value)[0] ?? '其他'),
    tags: z.union([z.string(), z.array(z.string())]).default([]).transform(normalizeList),
    date: z.preprocess(publicationDate, z.coerce.date()).optional(),
    published: z.coerce.date().optional(),
    updated_at: z.coerce.date().optional(),
    updated: z.coerce.date().optional(),
    draft: z.boolean().default(false),
  }).refine(data => Boolean(data.date || data.published), { message: 'Article needs its original publication date' })
    .transform(({ date, published, summary, description, updated_at, updated, ...data }) => ({
      ...data,
      description: description ?? summary,
      published: (published ?? date)!,
      updated: updated_at ?? updated,
    })),
})

export const collections = { posts }
