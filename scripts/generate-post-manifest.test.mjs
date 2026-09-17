import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import test from 'node:test';

test('editing exposes updated time without changing publication date or article link', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'blog-manifest-'));
  try {
    await fs.mkdir(path.join(root, 'public/markdown'), { recursive: true });
    await fs.writeFile(path.join(root, 'public/markdown/2025081401.md'), '---\ntitle: "旧文章"\ndate: "2025-08-14"\nupdated_at: "2026-09-17T10:05:06+08:00"\ncategory: "技术"\ntags: ["JavaScript"]\n---\n修改后的正文。\n');
    await fs.writeFile(path.join(root, 'public/markdown/2025081402.md'), '---\ntitle: "未修改文章"\ndate: "2025-08-14"\n---\n原正文。\n');
    execFileSync(process.execPath, [fileURLToPath(new URL('./generate-post-manifest.mjs', import.meta.url))], { cwd: root });
    const posts = JSON.parse(await fs.readFile(path.join(root, 'src/generated/posts.json'), 'utf8'));
    const edited = posts.find(post => post.id === '2025081401');
    assert.equal(edited.date, '2025-08-14');
    assert.equal(edited.year, '2025');
    assert.equal(edited.path, '/blog/markdown/2025081401.md');
    assert.equal(edited.updatedAt, '2026-09-17T10:05:06+08:00');
    assert.equal(posts.find(post => post.id === '2025081402').updatedAt, '');
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});
