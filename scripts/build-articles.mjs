/**
 * 构建时:从 Mulberry-word 仓库读取所有文章,生成 public/articles.json。
 *
 * 数据源(按优先级):
 *   1) 本地 data-word/(git clone 的本地副本)
 *   2) GitHub API(api.github.com)— CI 兜底
 *
 * 输出:
 *   public/articles.json
 *     { generatedAt, categories, articles }
 *   每篇 article 含 toc(从正文 h2/h3 自动提取的目录)
 *
 * 用法:
 *   node scripts/build-articles.mjs
 *   FORCE_REMOTE=1 node scripts/build-articles.mjs
 *
 * ──── 仓库规约 ────
 *   <cat>/<slug>/README.md  (如 guide/what-is-design-md/README.md)
 *   - 单文件:frontmatter 写元数据,正文是 markdown
 *   - frontmatter 字段:
 *       title       必填,文章标题
 *       desc        摘要(列表卡片展示)
 *       date        发布日期 YYYY-MM-DD
 *       tag         标签:GUIDE / ESSAY / NOTE 等(列表卡片左上小标)
 *       author      作者,可选
 *       readingTime 阅读时长(分钟),可选,缺省按正文字数估算
 *   - categories.json 定义 cat 映射(同 Skill 仓库)
 *   - slug 在整个仓库内必须唯一(跨 cat 也不能重名)
 *
 * 跟 Skill 仓库的差别:
 *   - 每个 skill 目录含 SKILL.md(详情正文)+ README.md(中文信息卡)
 *   - 每篇文章只有一个 README.md,frontmatter 写元数据,正文就是 markdown
 *   - 这样作者 push 一份就够了,不用双份维护
 */

import { writeFile, mkdir, readFile, readdir } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { existsSync } from 'node:fs'
import { marked } from 'marked'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const OUT_PATH = resolve(ROOT, 'public', 'articles.json')
const LOCAL_REPO = resolve(ROOT, 'data-word')

const REPO = {
  owner: 'nothingtosayyy',
  repo: 'Mulberry-word',
  branch: 'main',
}
const API_BASE = `https://api.github.com/repos/${REPO.owner}/${REPO.repo}`
const RAW_BASE = `https://raw.githubusercontent.com/${REPO.owner}/${REPO.repo}/${REPO.branch}`

// ── 极简 frontmatter 解析(同 build-index.mjs 风格,保持简单) ──
const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/
function parseFrontmatter(text) {
  const m = text.match(FRONTMATTER_RE)
  if (!m) return { data: {}, body: text }
  const [, fmText, body] = m
  const data = {}
  for (const line of fmText.split(/\r?\n/)) {
    const mm = line.match(/^([A-Za-z_][A-Za-z0-9_-]*)\s*:\s*(.*)$/)
    if (!mm) continue
    const [, key, raw] = mm
    let v = raw.trim()
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) v = v.slice(1, -1)
    if (v === 'true') v = true
    else if (v === 'false') v = false
    else if (/^-?\d+(\.\d+)?$/.test(v)) v = Number(v)
    data[key] = v
  }
  return { data, body }
}

// ── marked 配置:h2/h3 标题加 id(同 marked 默认 slugger) ──
const renderer = new marked.Renderer()
const origH = { h2: renderer.heading.bind(renderer), h3: renderer.heading.bind(renderer) }
function slugger() {
  // marked v18 内置 slugger,直接用 Renderer 的 heading 会自动加 id
  return null
}
// 用默认 renderer 即可,marked 默认会给 heading 加 id。

function ghHeaders(extra = {}) {
  const h = { Accept: 'application/vnd.github+json', ...extra }
  if (process.env.GH_TOKEN) h.Authorization = `Bearer ${process.env.GH_TOKEN}`
  return h
}

// ── 估算阅读时长(中文 250 字/分钟) ──
function estimateReadingTime(text) {
  const cjk = (text.match(/[\u4e00-\u9fa5]/g) || []).length
  const words = (text.match(/[A-Za-z]+/g) || []).length
  const minutes = Math.max(1, Math.round(cjk / 250 + words / 200))
  return minutes
}

// ── 从渲染后的 HTML 提取 toc(h2 + h3) ──
function extractToc(html) {
  const toc = []
  // 简化正则,匹配 <h2 id="...">…</h2> 和 <h3 id="...">…</h3>
  const re = /<h([23])\s+id="([^"]+)"[^>]*>(.*?)<\/h\1>/g
  let m
  while ((m = re.exec(html)) !== null) {
    const level = Number(m[1])
    const id = m[2]
    // 去掉内联标签,只保留文本
    const text = m[3].replace(/<[^>]+>/g, '').trim()
    toc.push({ level, id, text })
  }
  return toc
}

// ── 把正文渲染成 HTML(供 toc 提取;真正的渲染在详情页客户端做) ──
function renderTocFromBody(body) {
  const html = marked.parse(body)
  return extractToc(html)
}

// ── 数据源 1:本地 data-word ──
async function localWalk(dir, base = dir) {
  const out = []
  let entries
  try {
    entries = await readdir(dir, { withFileTypes: true })
  } catch {
    return out
  }
  for (const ent of entries) {
    if (ent.name === '.git' || ent.name === 'node_modules') continue
    const full = join(dir, ent.name)
    const rel = full.slice(base.length + 1).replace(/\\/g, '/')
    if (ent.isDirectory()) {
      out.push({ path: rel, isDir: true })
      out.push(...(await localWalk(full, base)))
    } else {
      out.push({ path: rel, isDir: false })
    }
  }
  return out
}

async function loadFromLocal() {
  if (!existsSync(LOCAL_REPO)) return { cats: [], items: [], empty: true }
  const all = await localWalk(LOCAL_REPO)
  const catJson = all.find((x) => !x.isDir && x.path === 'categories.json')
  if (!catJson) {
    // 仓库未初始化(空仓库)也算成功,返回空索引,不回退到 GitHub
    return { cats: [], items: [], empty: true }
  }

  const cats = JSON.parse(await readFile(join(LOCAL_REPO, 'categories.json'), 'utf8'))

  const byDir = new Map()
  for (const x of all) {
    if (x.isDir) continue
    const idx = x.path.lastIndexOf('/')
    if (idx < 0) continue
    const dir = x.path.slice(0, idx)
    if (!byDir.has(dir)) byDir.set(dir, new Set())
    byDir.get(dir).add(x.path.slice(idx + 1))
  }

  const items = []
  for (const [dir, files] of byDir) {
    const parts = dir.split('/')
    if (parts.length !== 2) continue
    const [cat, slug] = parts
    if (cat.startsWith('_') || cat === '.github') continue
    if (slug.startsWith('_')) continue
    if (!files.has('README.md')) continue
    items.push({
      cat,
      slug,
      path: `${dir}/README.md`,
      _local: join(LOCAL_REPO, dir, 'README.md'),
    })
  }

  return { cats, items }
}

// ── 数据源 2:GitHub API ──
async function ghFetchTree() {
  const res = await fetch(`${API_BASE}/git/trees/${REPO.branch}?recursive=1`, {
    headers: ghHeaders(),
  })
  if (!res.ok) {
    throw new Error(
      `GitHub tree API failed: ${res.status} ${res.statusText}` +
        (process.env.GH_TOKEN ? ' (已用 GH_TOKEN)' : ' 未鉴权,匿名 60/h 限流')
    )
  }
  const json = await res.json()
  return json.tree || []
}

async function ghFetchCategories() {
  const res = await fetch(`${RAW_BASE}/categories.json`)
  if (!res.ok) throw new Error(`categories.json failed: ${res.status}`)
  return res.json()
}

async function ghFetchRaw(path) {
  const res = await fetch(`${RAW_BASE}/${path}`, { headers: ghHeaders() })
  if (!res.ok) throw new Error(`fetch ${path} failed: ${res.status}`)
  return res.text()
}

function buildItemsFromTree(tree) {
  const byDir = new Map()
  for (const node of tree) {
    if (node.type !== 'blob') continue
    const idx = node.path.lastIndexOf('/')
    if (idx < 0) continue
    const dir = node.path.slice(0, idx)
    if (!byDir.has(dir)) byDir.set(dir, new Set())
    byDir.get(dir).add(node.path.slice(idx + 1))
  }
  const items = []
  for (const [dir, files] of byDir) {
    const parts = dir.split('/')
    if (parts.length !== 2) continue
    const [cat, slug] = parts
    if (cat.startsWith('_') || cat === '.github') continue
    if (slug.startsWith('_')) continue
    if (!files.has('README.md')) continue
    items.push({ cat, slug, path: `${dir}/README.md` })
  }
  return items
}

async function loadFromGitHub() {
  console.log('[build-articles] 使用 GitHub API')
  const [tree, cats] = await Promise.all([ghFetchTree(), ghFetchCategories()])
  const items = buildItemsFromTree(tree)
  return { cats, items }
}

async function loadAll() {
  if (process.env.FORCE_REMOTE !== '1' && existsSync(LOCAL_REPO)) {
    const r = await loadFromLocal()
    // 即使空仓库也使用本地(不回退 GitHub 避免 409 限流)
    return { ...r, source: r.empty ? 'local-empty' : 'local' }
  }
  return { ...(await loadFromGitHub()), source: 'github' }
}

async function readItemText(item) {
  if (item._local) return await readFile(item._local, 'utf8')
  return await ghFetchRaw(item.path)
}

// ── 主流程 ──
async function main() {
  console.log('[build-articles] 读取数据源…')
  const { cats, items, source } = await loadAll()
  const catMap = new Map(cats.map((c) => [c.key, c]))
  console.log(`[build-articles] 识别到 ${items.length} 篇文章,${cats.length} 个分类`)

  const articles = []
  const slugSeen = new Set()
  for (const it of items) {
    try {
      const text = await readItemText(it)
      const { data, body } = parseFrontmatter(text)
      const title = (data.title || it.slug).toString().trim()
      const desc = (data.desc || data.description || '').toString().replace(/\s+/g, ' ').trim()
      const tag = (data.tag || '').toString().toUpperCase().trim() || null
      const author = (data.author || '').toString().trim() || null
      const date = (data.date || '').toString().trim() || ''
      const readingTime = Number.isFinite(data.readingTime)
        ? data.readingTime
        : estimateReadingTime(body)
      const toc = renderTocFromBody(body)

      // slug 唯一性检查
      if (slugSeen.has(it.slug)) {
        throw new Error(`slug 冲突:"${it.slug}" 在多个分类下出现,必须唯一`)
      }
      slugSeen.add(it.slug)

      articles.push({
        slug: it.slug,
        cat: it.cat,
        path: it.path,
        title,
        desc: desc.slice(0, 240),
        tag,
        author,
        date,
        readingTime,
        toc,
        catLabel: catMap.get(it.cat)?.label || it.cat,
      })
    } catch (e) {
      console.warn(`[build-articles] skip ${it.path}: ${e.message}`)
    }
  }

  // 按 date 倒序
  articles.sort((a, b) => (b.date || '').localeCompare(a.date || ''))

  // 分类计数
  const byCat = new Map()
  for (const a of articles) {
    if (!byCat.has(a.cat)) byCat.set(a.cat, 0)
    byCat.set(a.cat, byCat.get(a.cat) + 1)
  }
  const categories = cats
    .map((c) => ({ ...c, count: byCat.get(c.key) || 0 }))
    .filter((c) => c.count > 0)

  const payload = {
    generatedAt: new Date().toISOString(),
    source,
    categories,
    articles,
  }

  await mkdir(dirname(OUT_PATH), { recursive: true })
  await writeFile(OUT_PATH, JSON.stringify(payload, null, 2), 'utf8')
  console.log(`[build-articles] 写入 ${OUT_PATH}`)
  console.log(`[build-articles] 完成:${articles.length} 篇文章,${categories.length} 个分类`)
}

main().catch((e) => {
  console.error('[build-articles] 失败:', e.message)
  process.exit(1)
})
