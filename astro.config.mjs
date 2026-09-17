import { unified } from '@astrojs/markdown-remark'
import sitemap from '@astrojs/sitemap'
import swup from '@swup/astro'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'astro/config'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeKatex from 'rehype-katex'
import rehypeSlug from 'rehype-slug'
import remarkBreaks from 'remark-breaks'
import remarkEmoji from 'remark-emoji'
import remarkMath from 'remark-math'
import enJson from './src/i18n/en.json'
import jaJson from './src/i18n/ja.json'
import zhJson from './src/i18n/zh.json'
import { rehypeCodeBlock } from './src/lib/md/rehypeCodeBlock.ts'
import { rehypeExternalLinks } from './src/lib/md/rehypeExternalLinks.ts'
import { rehypeImages } from './src/lib/md/rehypeImages.ts'
import { rehypeRelativeLinks } from './src/lib/md/rehypeRelativeLinks.ts'
import { rehypeTableWrap } from './src/lib/md/rehypeTableWrap.ts'
import { remarkContainers } from './src/lib/md/remarkContainers.ts'
import { siteConfig } from './src/site.config.ts'

const site = siteConfig.url

// 脚注标题走 i18n：markdown 处理器是构建期全局配置，取站点默认语言
const footnoteLabel = { zh: zhJson, ja: jaJson, en: enJson }[siteConfig.defaultLang].post.footnotes

export default defineConfig({
  site: new URL(site).origin,
  base: siteConfig.base,
  trailingSlash: "always",
  server: { host: '::' },
  preview: { host: '::' },
  build: {
    inlineStylesheets: 'always',
  },
  markdown: {
    syntaxHighlight: false,
    processor: unified({
      gfm: true,
      smartypants: false,
      remarkRehype: { footnoteLabel, clobberPrefix: 'post-' },
      remarkPlugins: [remarkBreaks, remarkEmoji, remarkMath, remarkContainers],
      rehypePlugins: [
        rehypeKatex,
        rehypeCodeBlock,
        rehypeImages,
        rehypeRelativeLinks,
        rehypeTableWrap,
        [rehypeExternalLinks, { site }],
        rehypeSlug,
        [
          rehypeAutolinkHeadings,
          {
            behavior: 'append',
            properties: {
              className: ['heading-anchor'],
              tabIndex: -1,
              ariaLabel: 'Heading anchor',
            },
            content: { type: 'element', tagName: 'span', properties: {}, children: [] },
          },
        ],
      ],
    }),
  },
  integrations: [
    swup({
      theme: false,
      animationClass: 'transition-swup-',
      containers: ['#swup-container'],
      smoothScrolling: false,
      // Read fresh HTML on navigation so deployments invalidate image versions.
      // Images remain independently cached; persist matching avatar DOM nodes.
      cache: false,
      preload: false,
      accessibility: true,
      progress: true,
      updateHead: true,
      updateBodyClass: false,
      globalInstance: true,
      ignore: (url) => {
        if (url.includes('#')) return true
        const path = new URL(url, 'https://example.com').pathname
        if (/\.(xml|txt|json|pdf|zip|png|jpe?g|webp|gif|svg|ico|avif|woff2?|ttf|eot)$/i.test(path))
          return true
        if (/^\/(pagefind|fonts|images)\//.test(path)) return true
        return false
      },
    }),
    sitemap(),
  ],
  vite: {
    plugins: [
      tailwindcss(),



    ],
    optimizeDeps: {
      include: ['photoswipe', 'photoswipe/lightbox', 'astro/virtual-modules/transitions-*.js'],
    },
    build: {
      minify: 'esbuild',
      esbuildOptions: {
        minify: true,
        drop: ['debugger'],
        pure: ['console.log', 'console.debug'],
      },
      cssCodeSplit: true,
      cssMinify: 'lightningcss',
      assetsInlineLimit: 4096,
    },
  },
})
