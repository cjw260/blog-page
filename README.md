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

## 置顶、更新时间与访问统计

文章 frontmatter 的 `index` 控制置顶：0（默认）不置顶，正整数置顶，数字越大越靠前。飞书助手支持在完整预览并确认后修改此值。修改文章（包括分类、标签及置顶状态）记录北京时间 `updated_at`；卡片与详情页显示最近更新时间，原发布日期保持不变。没有真实修改记录的旧文章不自动补时间。

访问统计采用本服务器的 Python/SQLite 服务，通过同域 `/blog/api/stats/visit` 和 `/blog/api/stats/total` 接入。眼睛表示文章累计 PV，小人表示文章累计 UV。只有实际打开文章才增加该文章 PV；重复访问增加 PV，同一个浏览器的 UV 去重。首页等页面只计全站访问。浏览器保存随机匿名标识，服务器只保存加盐摘要，不记录 IP、浏览器指纹或用户账号；清理浏览器存储、使用无痕窗口或不同设备会被视作新访客。公共计数有请求去重、路径白名单、同源校验和基础限流，不作为精确审计或抗作弊计费数据。

统计从首次启用开始累计，不能恢复此前历史浏览量。统计失败保留占位，不阻塞阅读。刷新或站内跳转后重新获取计数，单页所有卡片共用一次查询，浏览首页卡片不会给每篇文章增加访问。

统计数据库持久化于服务器 `/opt/cjw-sites/blog-page/data/stats/stats.sqlite3`，不在镜像内，不随发布清空。每次部署前使用 SQLite 在线备份，保留最近 7 份于 `backups/stats/`。`STATS_IMAGE` 与 `WEB_IMAGE` 都由 Actions 构建并按固定摘要部署；统计容器无公网端口，无发布服务或 Git 凭证，限制为 96 MiB 内存。

验证：`python3 -m unittest discover -s stats -q` 覆盖 PV/UV、并发、重试去重、持久化、页面白名单、同源要求及限流。`pnpm check && pnpm type-check && pnpm build && pnpm test` 验证博客构建与文章契约。

## 头像缓存与更新

首页头像、导航 Logo 和 favicon 使用图片内容的 SHA-256 摘要作为 URL 版本号；相同图片跨页面/跨部署沿用缓存，图片字节变化后版本号自动变化。`/blog/profile.jpeg?v=<16位摘要>` 长期缓存，未带有效版本号的原地址保持重新验证。翻页通过版本相关的 `data-swup-persist` 保留已加载头像元素，版本改变时自动替换。站内导航不长期缓存 HTML，保证下次翻页能读取最新发布版本。更新时仍替换 `public/profile.jpeg` 并提交，不需要手工改版本号或要求访客清除图片缓存。
