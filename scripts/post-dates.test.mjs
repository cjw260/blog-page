import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { parsePostDate, postDateAttribute, readPostDates } from '../src/lib/post-dates.ts'

test('quoted and bare calendar dates retain day precision, including updates', () => {
  const dates = readPostDates('---\ndate: 2026-09-18\nupdated_at: "2026-09-19"\n---\nBody')
  for (const [key, day] of [['date', '2026-09-18'], ['updated_at', '2026-09-19']]) {
    const parsed = parsePostDate(dates[key])
    assert.equal(parsed.hasTime, false)
    assert.equal(postDateAttribute(parsed.date, parsed.hasTime), day)
    assert.equal(parsed.date.getUTCHours(), 16)
  }
})

test('bare timestamps are not truncated and actual midnight retains time precision', () => {
  const dates = readPostDates('---\ndate: 2026-09-18T12:34:56+08:00\npublished: 2026-09-18T00:00:00Z\nupdated: "2026-09-19T00:00:00+08:00"\n---\n')
  for (const key of ['date', 'published', 'updated']) assert.equal(parsePostDate(dates[key]).hasTime, true)
  assert.equal(parsePostDate(dates.date).date.toISOString(), '2026-09-18T04:34:56.000Z')
  assert.equal(parsePostDate(dates.published).date.toISOString(), '2026-09-18T00:00:00.000Z')
  assert.equal(parsePostDate(dates.updated).date.toISOString(), '2026-09-18T16:00:00.000Z')
})

test('unzoned timestamps are Beijing time in every build timezone', () => {
  const before = process.env.TZ
  try {
    for (const tz of ['UTC', 'America/Los_Angeles', 'Asia/Shanghai']) {
      process.env.TZ = tz
      for (const timestamp of ['2026-09-18 12:34:56', '2026-09-18T12:34:56']) {
        assert.equal(parsePostDate(timestamp).date.toISOString(), '2026-09-18T04:34:56.000Z')
      }
    }
  } finally {
    if (before === undefined) delete process.env.TZ
    else process.env.TZ = before
  }
})

test('new article command writes to the live content directory with an explicit timestamp', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'blog-new-post-'))
  try {
    const start = Date.now()
    execFileSync(process.execPath, [path.resolve('scripts/new-post.js'), 'test-post'], { cwd: dir })
    const source = readFileSync(path.join(dir, 'public/markdown/test-post.md'), 'utf8')
    const published = parsePostDate(readPostDates(source).published)
    assert.equal(published.hasTime, true)
    assert.ok(published.date.valueOf() >= start && published.date.valueOf() <= Date.now())
    assert.throws(() => execFileSync(process.execPath, [path.resolve('scripts/new-post.js'), 'test-post'], { cwd: dir, stdio: 'pipe' }))
    assert.equal(readFileSync(path.join(dir, 'public/markdown/test-post.md'), 'utf8'), source)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test('built pages keep source date precision and omit invented modification dates', () => {
  const listings = ['dist/index.html', ...readdirSync('dist').filter(name => /^\d+$/.test(name)).map(name => `dist/${name}/index.html`)]
  const cards = listings.flatMap(file => readFileSync(file, 'utf8').match(/<article\b[^>]*>[\s\S]*?<\/article>/g) ?? [])
  for (const file of readdirSync('public/markdown').filter(name => name.endsWith('.md'))) {
    const source = readFileSync(`public/markdown/${file}`, 'utf8')
    if (/^draft:\s*true\s*$/m.test(source.split(/^---\s*$/m)[1] ?? '')) continue
    const dates = readPostDates(source)
    const html = readFileSync(`dist/article/${file.slice(0, -3)}/index.html`, 'utf8')
    const card = cards.find(card => card.includes(`href="/blog/article/${file.slice(0, -3)}/"`))
    assert.ok(card, `${file}: missing article card`)
    const expectedTimes = []
    for (const value of [dates.published ?? dates.date, dates.updated_at ?? dates.updated].filter(value => value != null)) {
      const parsed = parsePostDate(value)
      const attribute = postDateAttribute(parsed.date, parsed.hasTime)
      const display = parsed.hasTime
        ? parsed.date.toLocaleString('sv-SE', { timeZone: 'Asia/Shanghai' }).slice(0, 16)
        : attribute
      assert.ok(html.includes(`<time datetime="${attribute}">${display}</time>`), `${file}: missing ${display}`)
      expectedTimes.push(`<time datetime="${attribute}">${display}</time>`)
    }
    assert.deepEqual(card.match(/<time\b[^>]*>.*?<\/time>/g), expectedTimes, file)
    if (!dates.updated && !dates.updated_at) {
      assert.ok(!html.includes('"dateModified":'), file)
      assert.ok(!html.includes('article:modified_time'), file)
      assert.ok(!card.includes('title="最近更新时间"'), file)
    }
  }
})
