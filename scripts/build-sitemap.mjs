/**
 * 构建时:从 public/index.json + public/articles.json 生成 public/sitemap.xml
 *
 * 为什么走静态文件而不是 Function:
 *   - sitemap 抓取频率低(Googlebot 一天 1-2 次),Function 浪费钱
 *   - 内容变更触发重新部署 → 一起重新生成
 *
 * 覆盖:
 *   - 首页(/)
 *   - 文章列表(/words)
 *   - 关于页(/about)
 *   - 每篇文章(/word/{slug})
 *   - 每个 Skill(/skill/{cat}/{slug})
 *
 * 频率策略:
 *   - 静态页(daily / monthly):粗略写,Google 会自己重新评估
 *   - 列表页(weekly):有新内容时 rebuild → lastmod 自带
 *   - 文章页(monthly):依文章 date
 *   - 优先级:首页 1.0 / 列表 0.8 / 文章 0.7 / skill 0.6 / about 0.5
 */
import { readFile, writeFile, mkdir, access } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const INDEX_PATH = resolve(ROOT, 'public', 'index.json')
const ARTICLES_PATH = resolve(ROOT, 'public', 'articles.json')
const OUT_PATH = resolve(ROOT, 'public', 'sitemap.xml')

const SITE_URL = 'https://mulberrytian.vercel.app'

function escXml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function isoFromDate(d) {
  // YYYY-MM-DD → ISO(默认 00:00 UTC)
  if (!d) return new Date().toISOString()
  const t = Date.parse(`${d}T00:00:00Z`)
  return Number.isFinite(t) ? new Date(t).toISOString() : new Date().toISOString()
}

function buildEntry({ loc, lastmod, changefreq, priority }) {
  return `  <url>
    <loc>${escXml(loc)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
}

async function readJsonSafe(path) {
  try {
    await access(path)
    return JSON.parse(await readFile(path, 'utf8'))
  } catch {
    return null
  }
}

async function main() {
  const indexData = await readJsonSafe(INDEX_PATH)
  const articlesData = await readJsonSafe(ARTICLES_PATH)

  if (!indexData && !articlesData) {
    throw new Error('index.json 和 articles.json 都不存在,无法生成 sitemap')
  }

  const generatedAt = new Date().toISOString()
  const entries = []

  // 静态页
  entries.push(buildEntry({
    loc: `${SITE_URL}/`,
    lastmod: generatedAt,
    changefreq: 'daily',
    priority: '1.0',
  }))
  entries.push(buildEntry({
    loc: `${SITE_URL}/words`,
    lastmod: articlesData?.generatedAt || generatedAt,
    changefreq: 'weekly',
    priority: '0.8',
  }))
  entries.push(buildEntry({
    loc: `${SITE_URL}/about`,
    lastmod: generatedAt,
    changefreq: 'monthly',
    priority: '0.5',
  }))

  // 文章
  const articles = articlesData?.articles || []
  for (const a of articles) {
    entries.push(buildEntry({
      loc: `${SITE_URL}/word/${a.slug}`,
      lastmod: isoFromDate(a.date),
      changefreq: 'monthly',
      priority: '0.7',
    }))
  }

  // Skill
  const skills = indexData?.skills || []
  for (const s of skills) {
    entries.push(buildEntry({
      loc: `${SITE_URL}/skill/${s.cat}/${s.slug}`,
      lastmod: isoFromDate(s.date),
      changefreq: 'monthly',
      priority: '0.6',
    }))
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>
`

  await mkdir(dirname(OUT_PATH), { recursive: true })
  await writeFile(OUT_PATH, xml, 'utf8')
  console.log(
    `[build-sitemap] 写入 ${OUT_PATH} — ` +
    `${entries.length} 条 URL(${articles.length} 文章 + ${skills.length} skill + 3 静态页)`
  )
}

main().catch((e) => {
  console.error('[build-sitemap] 失败:', e.message)
  process.exit(1)
})
