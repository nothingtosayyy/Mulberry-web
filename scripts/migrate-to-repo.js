/**
 * 一次性把现有 75 条 Skill 数据生成到 GitHub 仓库结构里。
 *
 * 用法: node scripts/migrate-to-repo.js
 *
 * 输出结构:
 *   data-repo/
 *     README.md
 *     categories.json
 *     <cat-key>/<slug>/
 *       README.md        (frontmatter + 描述正文)
 *       DESIGN.md        (9 章节结构)
 */

import { writeFile, mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(__dirname, '..', 'data-repo')

// ── 分类(目录 key → 显示 label) ──
const CATEGORIES = [
  { key: 'ai-and-llm', label: 'AI 与大模型平台', order: 1 },
  { key: 'dev-tools', label: '开发者工具与 IDE', order: 2 },
  { key: 'backend', label: '后端、数据库与 DevOps', order: 3 },
  { key: 'saas', label: '效率工具与 SaaS', order: 4 },
  { key: 'design', label: '设计与创意工具', order: 5 },
  { key: 'fintech', label: '金融科技与加密货币', order: 6 },
  { key: 'ecommerce', label: '电商与零售', order: 7 },
  { key: 'media', label: '媒体与消费科技', order: 8 },
  { key: 'auto', label: '汽车', order: 9 },
]

// ── 10 个示例 Skill(每个分类挑 1 个,保证开发时有数据)──
const SKILLS = [
  { name: 'BMW M', cat: 'auto', desc: '高性能汽车。纯黑画布,M 三色条纹点缀,全幅摄影视觉。', color: '#1c69d4', logo: 'M', date: '2026-07-15', isNew: true, source: 'https://www.bmw-m.com' },
  { name: 'Claude', cat: 'ai-and-llm', desc: 'Anthropic 的 AI 助手。温暖赭石色调、清爽编辑式布局。', color: '#cc785c', logo: 'C', date: '2026-04-15', source: 'https://www.anthropic.com' },
  { name: 'Minimax', cat: 'ai-and-llm', desc: 'AI 模型提供商。大胆深色界面搭配霓虹点缀。', color: '#00d4aa', logo: 'M', date: '2026-03-10', source: 'https://api.minimax.chat' },
  { name: 'Cursor', cat: 'dev-tools', desc: 'AI 优先代码编辑器。流畅深色界面、渐变点缀。', color: '#6b5b95', logo: 'C', date: '2026-04-28', source: 'https://www.cursor.com' },
  { name: 'ClickHouse', cat: 'backend', desc: '高速分析数据库。黄色点缀、技术文档风格。', color: '#faff69', logo: 'C', date: '2026-05-18', source: 'https://clickhouse.com' },
  { name: 'Linear', cat: 'saas', desc: '工程师项目管理。极简精密、紫色点缀。', color: '#5e6ad2', logo: 'L', date: '2026-03-20', source: 'https://linear.app' },
  { name: 'Figma', cat: 'design', desc: '协作设计工具。多彩活力、趣味与专业并存。', color: '#a259ff', logo: 'F', date: '2026-04-10', source: 'https://www.figma.com' },
  { name: 'Stripe', cat: 'fintech', desc: '支付基础设施。标志性紫色渐变、weight-300 优雅。', color: '#635bff', logo: 'S', date: '2026-01-05', source: 'https://stripe.com' },
  { name: 'Airbnb', cat: 'ecommerce', desc: '旅行住宿平台。温暖珊瑚色调、以摄影为核心、圆角 UI 设计。', color: '#ff5a5f', logo: 'A', date: '2026-06-20', source: 'https://www.airbnb.com' },
  { name: 'Spotify', cat: 'media', desc: '音乐流媒体。深色上的鲜艳绿、粗体排版、专辑封面驱动。', color: '#1db954', logo: 'S', date: '2026-01-10', source: 'https://www.spotify.com' },
]

// ── 工具函数 ──
const toSlug = (name) =>
  name
    .toLowerCase()
    .replace(/\(\d{4}\)/g, '')
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '')

async function write(rel, content) {
  const full = resolve(REPO_ROOT, rel)
  await mkdir(dirname(full), { recursive: true })
  await writeFile(full, content, 'utf8')
  console.log(`  ✓ ${rel}`)
}

// ── BMW M 的完整真实 DESIGN.md(从原型复制)──
const BMW_M_DESIGN = `# BMW M — 设计系统速查

BMW M 以近乎纯黑的画布为核心,搭配大写 **BMW Type Next** 展示标题,并克制地使用标志性的 M 三色条纹(浅蓝、深蓝、红)作为品牌身份点缀。

## 视觉主题

赛车运动基因与极致工程美学的融合。碳纤维纹理、M 三色条纹、大写展示标题构成核心视觉语言。

| 属性 | 值 |
|---|---|
| 基调 | 深色影院感,近纯黑画布 |
| 密度 | 大量留白,稀疏排版 |
| 设计哲学 | 极致减法 + 品牌色克制点缀 |

## 色板

| 语义名称 | 色值 | 用途 |
|---|---|---|
| Canvas Black | \`#0A0A0A\` | 主背景 |
| Surface Dark | \`#1A1A1A\` | 卡片/区块背景 |
| Text Primary | \`#F0F0F0\` | 正文、标题 |
| M Light Blue | \`#1C69D4\` | 品牌点缀 |
| M Dark Blue | \`#0066B1\` | 品牌点缀 |
| M Red | \`#E22718\` | 品牌点缀 |

## 字体规则

| 层级 | 字号 | 字重 | 字间距 |
|---|---|---|---|
| Display | 48–72px | 700 | -0.03em |
| Heading | 24–32px | 600 | -0.02em |
| Body | 15–16px | 400 | 0 |
| Caption | 11–12px | 400 | 0.02em |

展示标题始终使用**全大写**,字间距 \`0.06em–0.1em\`。

## 组件样式

### 按钮

- **主按钮**:白底黑字,圆角 6px,padding 10px 24px
- **次按钮**:透明底,1px 边框 \`rgba(255,255,255,0.12)\`
- **品牌按钮**:M Blue 底色,白字

### 卡片

- 背景 \`#1A1A1A\`,边框 \`rgba(255,255,255,0.08)\`
- 圆角 12px,内边距 24px
- 悬停时边框亮度提升至 \`rgba(255,255,255,0.15)\`

## 布局原则

- 最大内容宽度 \`1200px\`,水平居中
- 基础间距单位 \`8px\`,常用间距 \`16/24/32/48px\`
- 大量留白,内容区域之间至少 \`64px\` 间距

## Do's and Don'ts

### ✅ Do

- M 三色条纹仅用于品牌身份标记,每屏最多 1–2 处
- 摄影内容全幅出血,不做裁切
- 标题使用全大写 + 宽字间距

### ❌ Don't

- 不要用渐变色作为大面积背景
- 不要在深色背景上使用彩色文字(品牌色除外)
- 不要使用圆角超过 12px 的卡片
`

// ── 通用 DESIGN.md 模板(其它 Skill 用)──
function genericDesign(name, color) {
  return `# ${name} — 设计系统速查

${name} 的设计语言强调品牌识别与一致性。整体以深色画布为底,辅以 **${name}** 的标志色 \`${color}\` 作为点睛。

## 视觉主题

整体基调由 ${name} 的品牌色 \`${color}\` 主导,搭配深色表面与高对比度排版。

| 属性 | 值 |
|---|---|
| 基调 | 深色影院感,近纯黑画布 |
| 密度 | 大量留白,稀疏排版 |
| 设计哲学 | 品牌色克制点缀 + 一致性优先 |

## 色板

| 语义名称 | 色值 | 用途 |
|---|---|---|
| Canvas Black | \`#0A0A0A\` | 主背景 |
| Surface Dark | \`#1A1A1A\` | 卡片/区块背景 |
| Text Primary | \`#F0F0F0\` | 正文、标题 |
| Brand Primary | \`${color}\` | 品牌点缀 |
| Brand Accent | \`${color}\` | 交互高亮 |

## 字体规则

| 层级 | 字号 | 字重 | 字间距 |
|---|---|---|---|
| Display | 48–72px | 700 | -0.03em |
| Heading | 24–32px | 600 | -0.02em |
| Body | 15–16px | 400 | 0 |
| Caption | 11–12px | 400 | 0.02em |

展示标题始终使用**全大写**,字间距 \`0.06em–0.1em\`。

## 组件样式

### 按钮

- **主按钮**:白底黑字,圆角 6px,padding 10px 24px
- **次按钮**:透明底,1px 边框 \`rgba(255,255,255,0.12)\`
- **品牌按钮**:品牌色底色,白字

### 卡片

- 背景 \`#1A1A1A\`,边框 \`rgba(255,255,255,0.08)\`
- 圆角 12px,内边距 24px
- 悬停时边框亮度提升至 \`rgba(255,255,255,0.15)\`

## 布局原则

- 最大内容宽度 \`1200px\`,水平居中
- 基础间距单位 \`8px\`,常用间距 \`16/24/32/48px\`
- 大量留白,内容区域之间至少 \`64px\` 间距

## Do's and Don'ts

### ✅ Do

- 品牌色仅用于关键身份标记,每屏最多 1–2 处
- 保持充足的留白与呼吸感
- 标题使用全大写 + 宽字间距

### ❌ Don't

- 不要用渐变色作为大面积背景
- 不要在深色背景上使用彩色文字(品牌色除外)
- 不要使用圆角超过 12px 的卡片
`
}

// ── README.md(frontmatter + 描述正文)──
function skillReadme(skill) {
  const slug = toSlug(skill.name)
  const fm = [
    '---',
    `name: ${skill.name}`,
    `slug: ${slug}`,
    `cat: ${skill.cat}`,
    `desc: ${skill.desc}`,
    `source: ${skill.source || ''}`,
    `color: "${skill.color}"`,
    `logo: "${skill.logo || ''}"`,
    `date: ${skill.date}`,
    ...(skill.isNew ? ['isNew: true'] : []),
    '---',
  ].join('\n')

  const body = `${skill.desc}。基于 ${skill.name} 的视觉语言进行提炼,可作为相关项目的 UI 起点。

将本目录中的 \`DESIGN.md\` 复制到目标项目根目录,告诉你的 AI 助手:"请按照 DESIGN.md 规范生成 UI",即可获得与 ${skill.name} 风格一致的输出。`

  return `${fm}\n\n${body}\n`
}

// ── 仓库根 README.md ──
const ROOT_README = `# Mulberry SKILL

> Awesome DESIGN.md 风格的 curated collection。
> 仓库结构即数据源,公开站自动同步。

## 目录约定

\`\`\`
<category>/<skill-slug>/
├── README.md    # 元数据(frontmatter)+ 描述正文
└── DESIGN.md    # 设计系统文档(9 章节)
\`\`\`

## 添加一个新 Skill

1. 在合适的分类目录下创建子目录(用小写连字符命名)
2. 复制 \`_template/README.md\` 和 \`_template/DESIGN.md\` 模板
3. 填写 \`README.md\` 的 frontmatter
4. 编辑 \`DESIGN.md\` 的 9 个章节
5. 提交 commit 并 push,公开站 5 分钟内自动同步

## 分类清单

见 \`categories.json\`。
`

// ── 模板文件 ──
const TEMPLATE_README = `---
name: Skill Name
slug: skill-slug
cat: category-key
desc: 一句话描述。
source: https://example.com
color: "#000000"
logo: "X"
date: 2026-01-01
---

这里是描述正文。在公开站详情页的"信息模块"中显示。
`

const TEMPLATE_DESIGN = `# Skill Name — 设计系统速查

开场介绍(1-2 句话说明核心设计语言)。

## 视觉主题

| 属性 | 值 |
|---|---|
| 基调 | |
| 密度 | |
| 设计哲学 | |

## 色板

| 语义名称 | 色值 | 用途 |
|---|---|---|
| | | |

## 字体规则

| 层级 | 字号 | 字重 | 字间距 |
|---|---|---|---|
| | | | |

## 组件样式

### 按钮

- **主按钮**:
- **次按钮**:
- **品牌按钮**:

### 卡片

- 背景,边框
- 圆角,内边距
- 悬停状态

## 布局原则

- 最大内容宽度
- 基础间距单位
- 留白

## Do's and Don'ts

### ✅ Do

-

### ❌ Don't

-
`

// ── 主流程 ──
async function main() {
  console.log('📦 生成仓库内容到:', REPO_ROOT)

  // 1. 根 README
  await write('README.md', ROOT_README)

  // 2. categories.json
  await write('categories.json', JSON.stringify(CATEGORIES, null, 2) + '\n')

  // 3. 模板
  await write('_template/README.md', TEMPLATE_README)
  await write('_template/DESIGN.md', TEMPLATE_DESIGN)

  // 4. 每个 Skill
  for (const skill of SKILLS) {
    const slug = toSlug(skill.name)
    const rel = `${skill.cat}/${slug}`
    await write(`${rel}/README.md`, skillReadme(skill))
    const design = skill.name === 'BMW M' ? BMW_M_DESIGN : genericDesign(skill.name, skill.color)
    await write(`${rel}/DESIGN.md`, design)
  }

  console.log(`\n✅ 完成。共生成 ${SKILLS.length} 个 Skill。`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
