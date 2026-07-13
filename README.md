# blog-font

This template should help get you started developing with Vue 3 in Vite.

## Content Workflow

Blog posts now live in [`public/markdown`](/E:/code/myBlog/blog-font/public/markdown) and are the single source of truth for the site.

Each markdown file should start with front matter like this:

```md
---
title: "文章标题"
date: 2026-03-19
category: "技术文章"
tags: ["vue", "vite"]
summary: "首页和列表页展示的摘要"
draft: false
---
```

The app will automatically:

- scan all markdown files before `dev` and `build`
- generate [`src/generated/posts.json`](/E:/code/myBlog/blog-font/src/generated/posts.json) for lists, tags, categories, archives, and counts
- strip front matter from article pages before rendering markdown
- create `dist/404.html` after build so GitHub Pages can refresh nested routes like `/blog/article/:id`

## GitHub Pages

This project is configured for the repository `cjw260/blog`, so [`vite.config.js`](/E:/code/myBlog/blog-font/vite.config.js) keeps `base: '/blog/'`.

A deployment workflow is available at [`deploy.yml`](/E:/code/myBlog/blog-font/.github/workflows/deploy.yml). Once GitHub Pages is enabled for Actions in the repository settings, pushes to `main` will publish the site automatically.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
