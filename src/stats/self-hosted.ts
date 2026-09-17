interface Totals {
  siteTotal: number
  siteUnique: number
  articles: { path: string; articleTotal: number; articleUnique: number }[]
}
const endpoint = `${import.meta.env.BASE_URL}api/stats`
let totals: Promise<Totals> | null = null
let visitor: string | null = null
function visitorId(): string {
  if (visitor) return visitor
  try {
    const saved = localStorage.getItem('cjw-blog-visitor')
    visitor = saved && /^[0-9a-f-]{36}$/.test(saved) ? saved : crypto.randomUUID()
    localStorage.setItem('cjw-blog-visitor', visitor)
  } catch { visitor = crypto.randomUUID() }
  return visitor
}
export async function trackVisit(path = location.pathname): Promise<void> {
  totals = null
  try {
    await fetch(`${endpoint}/visit`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path, visitor: visitorId(), event: crypto.randomUUID() }),
      credentials: 'omit', keepalive: true, signal: AbortSignal.timeout(5000),
    })
  } catch { /* Counting must never block article reading. */ }
}
function total(): Promise<Totals> {
  totals ??= fetch(`${endpoint}/total`, { cache: 'no-store', credentials: 'omit', signal: AbortSignal.timeout(5000) })
    .then(async response => {
      if (!response.ok) throw new Error('Statistics temporarily unavailable')
      return await response.json() as Totals
    })
  return totals
}
export async function getSiteTotal() {
  const value = await total()
  return { siteTotal: value.siteTotal, siteUnique: value.siteUnique }
}
export async function getArticleStats(path: string) {
  const value = await total()
  const article = value.articles.find(item => item.path === decodeURIComponent(path).replace(/\/$/, ''))
  return { articleTotal: article?.articleTotal ?? 0, articleUnique: article?.articleUnique ?? 0,
    siteTotal: value.siteTotal, siteUnique: value.siteUnique }
}
