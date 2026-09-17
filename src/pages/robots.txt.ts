import type { APIRoute } from 'astro'
import { siteConfig } from '@/site.config'

export const GET: APIRoute = ({ site }) => {
  const sitemapURL = new URL(`${siteConfig.base}/sitemap-index.xml`, site)
  const body = ['User-agent: *', 'Allow: /', '', `Sitemap: ${sitemapURL.href}`, ''].join('\n')
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
