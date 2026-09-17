# Cain 的个人博客 · CitrusGrid

线上地址：https://cjw32.xyz/blog/ 。基于 [rightdoor/citrus-grid](https://github.com/rightdoor/citrus-grid) 1.0.5（Astro）迁移，保留上游 MIT 许可证与页脚署名。上游固定提交见 `migration/upstream.json`；上游说明另存于 `CITRUS-GRID.md`。

## 内容与飞书

文章唯一来源是 `public/markdown/*.md`，文章 ID 仍是文件名，链接仍为 `/blog/article/{id}`。无需移动文章到上游的 `src/content/posts`。旧正文、发布日期、分类、标签及摘要保持不变；`src/content.config.ts` 在读取时将 `date → published`、`summary → description`、`updated_at → updated` 映射为主题字段。

飞书发布、查询、全文读取、修改预览、确认保存和确认删除继续使用原有接口与仓库写入权限。新增文件、修改文件或删除文件会触发现有 GitHub Actions，重新生成静态页面、分类标签、RSS 和 Pagefind 搜索索引。创建、编辑、删除的权限和确认规则不因迁移而放宽。

构建不会通过文件修改时间自动更新文章日期，也不会自动写入 slug。原始发布日期按北京时间日历日展示；更新时间使用发布服务记录的时区时间。保持原始 Markdown 对外可读，以兼容发布服务的内容哈希验证。

## 本地开发

需要 Node.js >=22.14、pnpm 10.30.0。

```sh
pnpm install --frozen-lockfile --ignore-scripts
ASTRO_TELEMETRY_DISABLED=1 pnpm dev
```

开发/预览路径为 `/blog/`。站点资料位于 `src/site.config.ts`。默认评论、第三方访问统计关闭；不使用模板自带的随机访问量或示例友链。原 GitHub、Gitee、Bilibili 和个人导航链接已迁入。

```sh
ASTRO_TELEMETRY_DISABLED=1 pnpm check
ASTRO_TELEMETRY_DISABLED=1 pnpm build
pnpm test
```

迁移时的一次性校验：`VERIFY_MIGRATION_BASELINE=1 pnpm test`。它比对 42 篇原文的迁移前哈希；以后正常增删改文章时不运行这一基线检查。常规测试始终根据当前文章验证输出。

## 图片与已知缺图

迁移复制了 15 张文章图片及头像，详见 `migration/images.json`。正文仍保留原引用，渲染时由 `src/legacy-images.json` 映射到站内文件，避免旧图床故障导致图片失效。后续新图片不自动下载，由作者在需要时加入静态资源。

`2025101601.md` 第 76 行引用的是原 Windows 电脑上的 Typora 图片 `image-20251016121355790.png`，原仓库没有对应文件。这不是迁移丢失：保留原文，页面显示缺图说明，获得原图后可补齐。

## 构建与部署

Docker 使用独立 Node 构建层和 Nginx 静态运行层；所有包由 pnpm 锁文件固定，运行容器不带 Node 服务。沿用现有仓库的 `.github/workflows/container.yml`、部署账号、Secrets、GHCR 镜像仓库及服务器监听端口。

Nginx 直接服务生成的 HTML；不存在的文章与 Markdown 返回 404，不返回首页。旧 `/blog/article/{id}`、分类和标签地址继续有效。资源、搜索脚本、RSS、站点地图、canonical 均带 `/blog/` 前缀。

每次发布在 `/opt/cjw-sites/blog-page/releases/` 保留不可变镜像配置；`current` 指向运行版本，`previous` 指向上一版。部署脚本在容器健康检查失败时自动恢复上一版。人工回滚应使用保留的旧镜像配置，不删除文章或重写 Git 历史；迁移前的 Vue 代码也仍保留在 Git 历史中。
