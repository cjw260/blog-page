import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const read = file => fs.readFileSync(file, 'utf8')
const sha = bytes => createHash('sha256').update(bytes).digest('hex')
const articles = fs.readdirSync('public/markdown').filter(name => name.endsWith('.md'))
const publicArticles = articles.filter(name => !/^draft:\s*true\s*$/m.test(read(`public/markdown/${name}`).split(/^---\s*$/m)[1] ?? ''))
function walk(dir) {
  return fs.readdirSync(dir, {withFileTypes: true}).flatMap(entry => entry.isDirectory() ? walk(path.join(dir, entry.name)) : [path.join(dir, entry.name)])
}
const htmlFiles = walk('dist').filter(file => file.endsWith('.html'))

test('every current public article retains its URL, title, and exact Markdown bytes', () => {
  for (const name of publicArticles) {
    const id = name.slice(0, -3)
    const source = read(`public/markdown/${name}`)
    const html = read(`dist/article/${id}/index.html`)
    const rawTitle = source.match(/^title:\s*(.*)$/m)?.[1]
    let title
    try { title = JSON.parse(rawTitle) } catch { title = rawTitle.replace(/^['"]|['"]$/g, '') }
    const escaped = title.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')
    assert.ok(html.includes(escaped), `missing title for ${id}`)
    assert.ok(html.includes(`https://cjw32.xyz/blog/article/${id}/`), `wrong canonical for ${id}`)
    assert.equal(sha(fs.readFileSync(`dist/markdown/${name}`)), sha(fs.readFileSync(`public/markdown/${name}`)))
  }
  assert.equal(fs.readdirSync('dist/article').length, publicArticles.length)
})

test('same-origin navigation and assets resolve under /blog', () => {
  const broken = new Set()
  for (const file of htmlFiles) {
    for (const match of read(file).matchAll(/\b(?:href|src)="([^"#]+)"/g)) {
      if (!match[1].startsWith('/blog/')) continue
      const pathname = decodeURIComponent(new URL(match[1], 'https://cjw32.xyz').pathname).slice('/blog/'.length)
      const target = path.join('dist', pathname)
      if (!fs.existsSync(target) && !fs.existsSync(path.join(target, 'index.html'))) broken.add(match[1])
    }
  }
  assert.deepEqual([...broken], [])
  assert.ok(fs.existsSync('dist/pagefind/pagefind.js'))
})

test('copied images remain verifiable and rendered articles use local assets', () => {
  const mapping = JSON.parse(read('src/legacy-images.json'))
  const records = JSON.parse(read('migration/images.json'))
  for (const item of records.filter(item => item.state === 'copied')) {
    assert.equal(sha(fs.readFileSync('dist/' + item.local.slice('/blog/'.length))), item.sha256)
  }
  for (const file of htmlFiles.filter(file => file.includes('/article/'))) {
    const html = read(file)
    for (const external of Object.keys(mapping)) {
      assert.ok(!html.includes(`src="${external}"`), `external image remains in ${file}`)
    }
  }
})

test('RSS, sitemap and publisher health marker retain the correct blog prefix', () => {
  const rss = read('dist/rss.xml')
  for (const name of publicArticles) assert.ok(rss.includes(`https://cjw32.xyz/blog/article/${name.slice(0, -3)}/`))
  assert.ok(read('dist/sitemap-index.xml').includes('https://cjw32.xyz/blog/sitemap-0.xml'))
  assert.ok(read('dist/index.html').includes('id="app"'))
  assert.ok(read('dist/index.html').includes('Mc_Cain'))
  assert.ok(!read('dist/index.html').includes('random-visitor'))
})

test('initial migration preserves every original article byte for byte', {skip: process.env.VERIFY_MIGRATION_BASELINE !== '1'}, () => {
  const original = JSON.parse(read('migration/original-articles.json'))
  assert.deepEqual(articles.toSorted(), Object.keys(original).toSorted())
  for (const [name, hash] of Object.entries(original)) assert.equal(sha(fs.readFileSync('public/markdown/' + name)), hash, name)
})
