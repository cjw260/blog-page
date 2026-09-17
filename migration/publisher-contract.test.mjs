import fs from 'node:fs'
import assert from 'node:assert/strict'
import {execFileSync} from 'node:child_process'
const file='public/markdown/ai-000000000000000000000000.md'
const output='dist/article/ai-000000000000000000000000/index.html'
const env={...process.env,ASTRO_TELEMETRY_DISABLED:'1'}
const build=()=>execFileSync('pnpm',['build'],{env,stdio:['ignore',fs.openSync('/tmp/cjw-citrus-contract-build.log','w'),2]})
assert.ok(!fs.existsSync(file))
try {
  fs.writeFileSync(file,'---\ntitle: "流水线契约验证"\ndate: "2026-01-02"\ncategory: "测试"\ntags: ["fixture"]\nsummary: "只在本地测试"\n---\n\n这是发布的初版。\n')
  build()
  assert.ok(fs.readFileSync(output,'utf8').includes('这是发布的初版'))
  fs.writeFileSync(file,fs.readFileSync(file,'utf8').replace('category:', 'updated_at: "2026-09-17T10:05:06+08:00"\ncategory:').replace('这是发布的初版。','这是用户审阅后确认的修改版。'))
  build()
  const html=fs.readFileSync(output,'utf8')
  assert.ok(html.includes('这是用户审阅后确认的修改版'))
  assert.ok(html.includes('2026-01-02 00:00'))
  assert.ok(html.includes('2026-09-17 10:05'))
  fs.unlinkSync(file)
  build()
  assert.ok(!fs.existsSync(output))
  assert.ok(!fs.existsSync('dist/markdown/ai-000000000000000000000000.md'))
  console.log('PASS: publish -> edit with original date + update time -> delete; final build restored to real articles')
} finally {
  if(fs.existsSync(file))fs.unlinkSync(file)
}
