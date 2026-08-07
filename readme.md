# 桑葚集 · Mulberry

<div align="right">
  <a href="#chinese">🌐 简体中文</a> · <a href="#english">English</a>
</div>

<a id="chinese"></a>

> **个人 blog / 作品集 / 工具收藏模板**
> React + Vite + Vercel · 内容存 GitHub · 一键部署 · 零后端运维

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)](https://vercel.com)
[![React](https://img.shields.io/badge/React-18-149eca?logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5-646cff?logo=vite)](https://vitejs.dev)

🌐 在线浏览:[mulberrytian.vercel.app](https://mulberrytian.vercel.app/)

## ✨ 特性

- 🚀 **零配置部署** — Vercel 一键,自带 SPA fallback + Edge 缓存
- 📝 **内容与代码分离** — Markdown 写在 GitHub 仓库,前端无需 rebuild 即可同步
- 🔍 **SEO 友好** — 完整的 Open Graph / Twitter Card / JSON-LD / sitemap / robots.txt
- 🌗 **暗色模式** — 跟随系统 + 手动切换,localStorage 持久化
- 📱 **响应式** — 桌面 / 平板 / 手机三端适配
- 🖼 **阅读体验** — 代码块一键复制 / 图片灯箱放大 / 路由切换进度条
- 📡 **RSS 订阅** — build 时自动生成,无需任何后端
- 🎨 **个人品牌** — 主题色 / 字体 / 文案全部集中在 `src/styles/`

## 🚀 快速开始(5 分钟)

```bash
# 1. clone
git clone https://github.com/nothingtosayyy/Mulberry-web.git my-site
cd my-site

# 2. 安装依赖
npm install

# 3. 准备数据源:把内容仓库 clone 到 ./data-repo
git clone https://github.com/nothingtosayyy/Mulberry-SKILL.git data-repo

# 4. 生成静态索引
npm run build:index

# 5. 启动
npm run dev    # http://localhost:5173
```

## 📦 用作模板(Fork 后 3 步改成你自己的站)

1. **改站点信息** — 编辑 `src/components/SEO.jsx` 和 `index.html` 顶部的 `SITE_NAME / SITE_URL / OG_DEFAULT`
2. **换内容** — fork [Mulberry-SKILL](https://github.com/nothingtosayyy/Mulberry-SKILL) / [Mulberry-word](https://github.com/nothingtosayyy/Mulberry-word),按 `cat/slug/README.md` 格式填入自己的内容
3. **改主题** — `src/styles/` 下覆盖 CSS 变量(`--accent / --bg / --fg / --font-mono`...),所有页面即时生效
4. **部署** — `npm i -g vercel && vercel login && vercel --prod`

## 🛠 技术栈

| 类别 | 选型 |
|---|---|
| 前端框架 | React 18 + react-router-dom v6 |
| 构建 | Vite 5(本地 dev middleware 自带 `/api/raw` 代理) |
| 部署 | Vercel(Edge Function + Static Hosting) |
| 数据 | GitHub Repo(Markdown 源码,frontmatter 元数据) |
| 内容渲染 | marked + 自写 `enhanceHtml` 注入复制/灯箱 |
| SEO | 自写 `<SEO>` 组件(OG / Twitter / JSON-LD / canonical) |
| 样式 | 原生 CSS + CSS 变量(无 Tailwind,主题切换零成本) |
| 数据统计 | 不蒜子(PV/UV)+ Vercel KV(Upstash,文章阅读数) |

## 📂 项目结构

```
mulberry-web/
├── api/                       # Vercel Edge Function(/api/raw 代理 GitHub)
├── src/
│   ├── pages/                 # HomePage / WordListPage / WordPage / DetailPage / AboutPage / NotFound
│   ├── components/            # SEO / MarkdownBody / Lightbox / RouteProgressBar / ShareButton ...
│   ├── hooks/                 # useSkillData / useArticles / useTheme
│   ├── utils/                 # clipboard / enhanceMarkdown
│   ├── context/               # ToastContext
│   ├── styles/                # 主题 / 布局 / 暗色模式
│   └── App.jsx + main.jsx     # 路由 + 入口
├── public/                    # build 产物 + index.json / articles.json
├── scripts/                   # build-index / build-articles / build-rss / build-sitemap
├── index.html                 # 含站点级 JSON-LD + GSC 验证
├── vercel.json                # SPA fallback + 缓存策略
└── package.json
```

## 🌐 部署到 Vercel

```bash
npm i -g vercel
vercel login
vercel --prod
```

`vercel.json` 关键配置:
- `rewrites: "/((?!api/).*)" → /index.html`(SPA fallback,排除 `/api/`)
- `headers: /index.json → Cache-Control: max-age=300, s-maxage=86400`

> GitHub push 不会自动触发 Vercel 部署(项目未接 GitHub 集成),需要手动 CLI 部署。

## 🏷 仓库主题词(给 GitHub About 区域用)

复制下面 20 个到 **GitHub → About → Topics**,最大化曝光:

```
blog-template, portfolio-template, personal-blog, react-template, vite,
vercel, static-site, markdown, react-router, seo-friendly, dark-mode,
responsive, github-api, personal-website, template, indie-hacker,
content-management, web-template, frontend-template, portfolio
```

**Repository Description 建议**(About 区域一行):

```
✨ 个人 blog / 作品集 / 工具收藏模板 · React + Vite + Vercel · 一键部署
```

英文版(若你面向国际开发者):

```
✨ Personal blog / portfolio / tool collection template · React + Vite + Vercel · One-click deploy
```

## 📜 许可

MIT — 自由使用、修改、商用。

---

<a id="english"></a>

<details>
<summary><strong>🇬🇧 English version</strong>(click to expand)</summary>

# Mulberry

> **Personal blog / portfolio / tool collection template**
> React + Vite + Vercel · Content in GitHub · One-click deploy · Zero backend ops

🌐 Live demo: [mulberrytian.vercel.app](https://mulberrytian.vercel.app/)

## ✨ Features

- 🚀 **Zero-config deploy** — Vercel with SPA fallback + Edge cache out of the box
- 📝 **Content / code separation** — Markdown lives in a separate GitHub repo, syncs without rebuild
- 🔍 **SEO friendly** — Full Open Graph / Twitter Card / JSON-LD / sitemap / robots.txt
- 🌗 **Dark mode** — Follows system + manual toggle, persisted in localStorage
- 📱 **Responsive** — Desktop / tablet / mobile
- 🖼 **Reading experience** — One-click code copy / image lightbox / route progress bar
- 📡 **RSS** — Generated at build time, no backend needed
- 🎨 **Personal branding** — Theme color / font / copy centralized in `src/styles/`

## 🚀 Quick Start (5 min)

```bash
git clone https://github.com/nothingtosayyy/Mulberry-web.git my-site
cd my-site
npm install
git clone https://github.com/nothingtosayyy/Mulberry-SKILL.git data-repo
npm run build:index
npm run dev    # http://localhost:5173
```

## 📦 Use as a Template (3 steps)

1. **Change site info** — Edit `SITE_NAME / SITE_URL / OG_DEFAULT` in `src/components/SEO.jsx` and `index.html`
2. **Swap content** — Fork [Mulberry-SKILL](https://github.com/nothingtosayyy/Mulberry-SKILL) / [Mulberry-word](https://github.com/nothingtosayyy/Mulberry-word), drop your own Markdown under `cat/slug/README.md`
3. **Customize theme** — Override CSS variables (`--accent / --bg / --fg / --font-mono`) in `src/styles/`

## 🛠 Tech Stack

React 18 · Vite 5 · react-router-dom v6 · Vercel Edge Functions · marked · Vercel KV (Upstash) · 纯 CSS(CSS variables, no Tailwind) · 不蒜子(busuanzi for stats)

## 🌐 Deploy to Vercel

```bash
npm i -g vercel
vercel login
vercel --prod
```

> GitHub push does NOT auto-deploy (no GitHub integration). Use CLI manually.

## 📜 License

MIT — use, modify, commercialize freely.

</details>

---

<p align="center">
  <sub>如果这个项目对你有帮助,欢迎 ⭐️ Star 支持!</sub>
</p>
