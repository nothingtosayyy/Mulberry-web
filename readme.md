# 桑葚集 · Mulberry

一个**纯静态的个人收藏集网站**:展示精选网站的设计观察(`README.md` + `DESIGN.md`),
通过 React + Vite 构建,部署在 Vercel,数据源在 GitHub 仓库。

## 工作流

```
┌─────────────────────────┐         ┌─────────────────────────┐
│  Mulberry-SKILL         │         │  Mulberry-web(本仓库)        │
│  (数据源,GitHub)            │         │  (展示端,Vercel)             │
│                         │         │                         │
│  <cat>/<slug>/          │  fetch  │  src/                  │
│    README.md (元数据)      │ ───────>│  api/raw/[...path].js  │  ──> 浏览器
│    DESIGN.md (预览模块)    │         │  (Vercel Edge Function)│
│  categories.json         │         │  scripts/build-index.mjs│
└─────────────────────────┘         └─────────────────────────┘
```

1. **数据层**:`Mulberry-SKILL` 仓库是单一数据源
   - 目录 = 分类(`ai-and-llm/`、`auto/`、`backend/` ...)
   - 每个 Skill 一个目录,内含 `README.md`(frontmatter 元数据)+ `DESIGN.md`(预览模块)
2. **构建层**:本仓库的 `scripts/build-index.mjs`
   - 读取 `Mulberry-SKILL` 的所有 README/DESIGN 索引
   - 生成静态 `public/index.json`(首页用)
3. **运行层**:Vercel Edge Function `api/raw/[...path].js`
   - 浏览器请求 `/api/raw/<repo path>` 时,代理到 `raw.githubusercontent.com`
   - 5 分钟边缘缓存(`s-maxage=300, stale-while-revalidate=86400`)
   - 全局只回源 GitHub 一次,完美避开未鉴权 60/h 限流

## 限流问题的解决方案

| 阶段 | 调用 GitHub 次数 |
|---|---|
| 首页加载 | **0 次**(`/index.json` 是构建时固化的静态文件) |
| 详情页加载 | **0 次**(走 Vercel Edge 代理,首字符命中边缘缓存) |
| GitHub API | 仅 `build-index.mjs` 跑一次(可在 Vercel build 时跑) |

## 本地开发

```bash
# 1. 安装依赖
npm install

# 2. 准备数据源(可选,需要 GH_TOKEN 鉴权可走 GitHub API)
#    或者把 Mulberry-SKILL clone 到 ./data-repo
git clone https://github.com/nothingtosayyy/Mulberry-SKILL.git data-repo

# 3. 生成 index.json(构建时数据快照)
npm run build:index

# 4. 启动 dev server(自带 /api/raw 代理,与生产接口完全一致)
npm run dev

# 5. 浏览器打开 http://localhost:5173
```

## 部署到 Vercel

```bash
# 首次:全局装 Vercel CLI
npm install -g vercel

# 登录
vercel login

# 生产部署
vercel --prod
```

`vercel.json` 关键配置:
- `rewrites: "/((?!api/).*)" → /index.html` — SPA fallback(排除 /api/)
- `headers: /index.json → Cache-Control: max-age=300, s-maxage=86400`

## 项目结构

```
mulberry-web/
├── api/
│   └── raw/[...path].js       # Vercel Edge Function:代理 raw.githubusercontent.com
├── src/
│   ├── main.jsx               # React 入口
│   ├── App.jsx                # 路由
│   ├── pages/
│   │   ├── HomePage.jsx       # 首页
│   │   └── DetailPage.jsx     # 详情页
│   ├── components/            # 组件
│   ├── hooks/useSkillData.js  # 数据 Hook
│   ├── data/                  # frontmatter 解析等
│   ├── utils/                 # 工具
│   └── styles/                # 样式
├── public/
│   └── index.json             # 构建时生成的索引(由 build-index.mjs 生成)
├── scripts/
│   ├── build-index.mjs        # 生成 public/index.json
│   └── migrate-to-repo.js     # 一次性数据迁移脚本(从旧库到 Mulberry-SKILL)
├── index.html
├── vite.config.js             # dev middleware:本地 /api/raw 代理
├── vercel.json                # Vercel 部署配置
├── package.json
└── AGENTS.md
```

## 环境变量

| 变量 | 用途 | 必填 |
|---|---|---|
| `GH_TOKEN` | GitHub PAT,提升 60/h → 5000/h 限流 | `build-index.mjs` 调用 GitHub API 时 |

## 许可

MIT
