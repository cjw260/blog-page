import { parse } from 'yaml'

const dateFields = ['date', 'published', 'updated_at', 'updated'] as const

// Astro's YAML parser converts bare calendar dates to Date objects, losing
// whether a time was supplied. YAML 1.2 preserves those scalars as strings.
export function readPostDates(source: string): Record<string, unknown> {
  const header = source.match(/^\uFEFF?---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)?.[1]
  if (!header) return {}
  const data = parse(header)
  if (!data || typeof data !== 'object') return {}
  return Object.fromEntries(dateFields.filter(key => key in data).map(key => [key, data[key]]))
}

export function parsePostDate(value: string | Date) {
  if (value instanceof Date) return { date: value, hasTime: true }
  const hasTime = !/^\d{4}-\d{2}-\d{2}$/.test(value)
  // Unzoned article timestamps are Beijing local time, independent of the
  // developer's or CI runner's timezone. Explicit offsets remain untouched.
  const normalized = !hasTime ? `${value}T00:00:00+08:00`
    : /(?:Z|[+-]\d{2}:?\d{2})$/i.test(value) ? value
    : `${value.replace(' ', 'T')}+08:00`
  return { date: new Date(normalized), hasTime }
}

export function postDateAttribute(date: Date, hasTime: boolean): string {
  return hasTime ? date.toISOString()
    : new Date(date.valueOf() + 8 * 60 * 60 * 1000).toISOString().slice(0, 10)
}
