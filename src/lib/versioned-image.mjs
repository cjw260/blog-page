import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import path from 'node:path'

// Build-time only: the URL changes when image bytes change, not on every deploy.
export function versionedImage(src, base = '/blog', publicDir = path.resolve('public')) {
  if (!src.startsWith(`${base}/`)) return src
  const url = new URL(src, 'https://local.invalid')
  const root = path.resolve(publicDir)
  const file = path.resolve(root, decodeURIComponent(url.pathname.slice(base.length + 1)))
  if (!file.startsWith(root + path.sep)) throw new Error('Image must be inside public/')
  const version = createHash('sha256').update(readFileSync(file)).digest('hex').slice(0, 16)
  url.searchParams.set('v', version)
  return url.pathname + url.search + url.hash
}
