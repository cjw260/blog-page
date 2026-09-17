import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { versionedImage } from '../src/lib/versioned-image.mjs'

test('same bytes keep cache URL; updating the file creates a new version even with unchanged mtime', () => {
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'blog-image-'))
  try {
    const file=path.join(root,'profile.jpeg')
    fs.writeFileSync(file,'image-one')
    const date=fs.statSync(file).mtime
    const first=versionedImage('/blog/profile.jpeg','/blog',root)
    assert.match(first,/^\/blog\/profile\.jpeg\?v=[0-9a-f]{16}$/)
    fs.writeFileSync(file,'image-one')
    assert.equal(versionedImage('/blog/profile.jpeg','/blog',root),first)
    fs.writeFileSync(file,'image-two');fs.utimesSync(file,date,date)
    assert.notEqual(versionedImage('/blog/profile.jpeg','/blog',root),first)
  } finally { fs.rmSync(root,{recursive:true}) }
})

test('all pagination pages share the current version and version-specific persisted avatar', () => {
  const expected=versionedImage('/blog/profile.jpeg')
  const version=expected.split('v=')[1]
  for (const page of ['dist/index.html','dist/2/index.html','dist/3/index.html']) {
    const html=fs.readFileSync(page,'utf8')
    assert.ok(html.includes(`src="${expected}"`),page)
    assert.ok(html.includes(`data-swup-persist="profile-avatar-${version}"`),page)
  }
})
