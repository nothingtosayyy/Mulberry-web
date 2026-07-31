/**
 * 构建时:从 public/articles.json 读取文章列表,生成 public/rss.xml。
 *
 * 走 RSS 2.0 + Atom 自链接(最广泛的兼容,Feedly / Inoreader / NetNewsWire 通吃)。
 *
 * 设计取舍:
 *   - 静态文件 + Vercel 静态托管,不走 Function(RSS reader 是 polling,放 Function 浪费)
 *   - 增量数据由 build-articles.mjs 负责,这里只读不抓(更便宜)
 *   - 只输出最近 30 篇,避免大文件拖慢 reader 首次拉取
 *   - CDATA 包裹 title/description,容错更好(标题里出现 & 也不会炸)
 *
 * 用法:
 *   node scripts/build-rss.mjs
 *
 * 前置:
 *   必须先运行 `node scripts/build-articles.mjs` 生成 public/articles.json
 */

import { readFile, writeFile, mkdir, access } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const INDEX_PATH = resolve(ROOT, 'public', 'articles.json')
const OUT_PATH = resolve(ROOT, 'public', 'rss.xml')

const SITE_URL = 'https://mulberrytian.vercel.app'
const SITE_TITLE = '桑葚集 · 随笔与想法'
const SITE_DESC = '关于产品、设计、AI 的随笔 — 数据公开在 GitHub 仓库。'
const MAX_ITEMS = 30

// XML escape:& 和 < 和 > 三件套(双引号在属性里才需要)
function escXml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

// RFC 822 格式(Atom/RSS 公用),但我们用 RFC 2822 子集
function toRfc2822(dateStr) {
  // 输入是 YYYY-MM-DD,加 00:00 UTC
  if (!dateStr) return new Date(0).toUTCString()
  const t = Date.parse(`${dateStr}T00:00:00Z`)
  return Number.isFinite(t) ? new Date(t).toUTCString() : new Date(0).toUTCString()
}

function buildItem(article) {
  const url = `${SITE_URL}/word/${article.slug}`
  const desc = article.desc || article.title
  return `    <item>
      <title><![CDATA[${article.title}]]></title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${toRfc2822(article.date)}</pubDate>
      <description><![CDATA[${desc}]]></description>
      ${article.author ? `<dc:creator><![CDATA[${article.author}]]></dc:creator>` : ''}
      ${article.tag ? `<category><![CDATA[${article.tag}]]></category>` : ''}
    </item>`
}

function buildChannel(items, generatedAt) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
     xmlns:atom="http://www.w3.org/2005/Atom"
     xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title><![CDATA[${SITE_TITLE}]]></title>
    <link>${SITE_URL}/words</link>
    <description><![CDATA[${SITE_DESC}]]></description>
    <language>zh-cn</language>
    <lastBuildDate>${new Date(generatedAt || Date.now()).toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
    <generator>Mulberry build-rss</generator>
${items.join('\n')}
  </channel>
</rss>
`
}

async function main() {
  // 防御:articles.json 不存在时给清晰错误
  try {
    await access(INDEX_PATH)
  } catch {
    throw new Error(
      `${INDEX_PATH} 不存在 — 请先运行 \`node scripts/build-articles.mjs\` 生成文章索引`
    )
  }

  const payload = JSON.parse(await readFile(INDEX_PATH, 'utf8'))
  const articles = (payload.articles || []).slice(0, MAX_ITEMS)
  if (articles.length === 0) {
    console.warn('[build-rss] 文章索引为空,跳过生成(避免空 feed 报错)')
    return
  }

  const items = articles.map(buildItem)
  const xml = buildChannel(items, payload.generatedAt)

  await mkdir(dirname(OUT_PATH), { recursive: true })
  await writeFile(OUT_PATH, xml, 'utf8')
  console.log(`[build-rss] 写入 ${OUT_PATH}(${articles.length} 篇文章)`)
}

main().catch((e) => {
  console.error('[build-rss] 失败:', e.message)
  process.exit(1)
})
