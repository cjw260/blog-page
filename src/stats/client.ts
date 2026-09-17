import { onPageLoad } from '@/lib/pageLifecycle'
interface StatsPlugin {
  trackVisit?: (path?: string) => void | Promise<void>
  getSiteTotal?: () => Promise<{ siteTotal: number; siteUnique: number }>
  getArticleStats?: (path: string) => Promise<{ articleTotal: number; articleUnique: number }>
}
const modules = import.meta.glob<StatsPlugin>('./*.ts')
let plugin: Promise<StatsPlugin> | undefined
let lastContainer: Element | null = null
let lastPath = ''
let generation = 0
async function refresh() {
  const container = document.querySelector('#swup-container')
  const path = location.pathname
  // The theme can dispatch the initial lifecycle event more than once.
  if (!container || (container === lastContainer && path === lastPath)) return
  lastContainer = container
  lastPath = path
  const current = ++generation
  const name = document.documentElement.dataset.statsScript
  const load = modules[`./${name}.ts`]
  if (!load) return
  plugin ??= load()
  const stats = await plugin
  await stats.trackVisit?.(path)
  if (current !== generation) return
  const fmt = (n: number) => n.toLocaleString(document.documentElement.lang || undefined)
  const nodes = [...document.querySelectorAll<HTMLElement>('[data-stats]')]
  const articlePaths = new Set(nodes.map(el => el.closest<HTMLElement>('[data-stats-path]')?.dataset.statsPath).filter((p): p is string => Boolean(p)))
  const site = await stats.getSiteTotal?.()
  const articles = new Map(await Promise.all([...articlePaths].map(async p => [p, await stats.getArticleStats?.(p)] as const)))
  if (current !== generation) return
  for (const el of nodes) {
    const p = el.closest<HTMLElement>('[data-stats-path]')?.dataset.statsPath
    const article = p ? articles.get(p) : undefined
    const value = { 'site-pv': site?.siteTotal, 'site-uv': site?.siteUnique,
      'article-pv': article?.articleTotal, 'article-uv': article?.articleUnique }[el.dataset.stats ?? '']
    el.textContent = typeof value === 'number' && Number.isFinite(value) ? fmt(value) : '—'
  }
}
onPageLoad(() => { refresh().catch(() => { /* Keep placeholders on service failure. */ }) })
