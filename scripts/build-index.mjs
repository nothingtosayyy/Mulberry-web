/**
 * 构建时:从数据源读取所有 Skill 的元数据,生成 public/index.json。
 *
 * 数据源(按优先级):
 *   1) 本地 data-repo/(git clone 的本地副本)— 离线、零限流、零网络
 *   2) GitHub API(api.github.com) — CI 兜底,可配 GH_TOKEN 拿 5000/h
 *
 * 输出:
 *   public/index.json  { generatedAt, categories, skills, byCategory }
 *
 * 用法:
 *   node scripts/build-index.mjs                  # 默认:本地优先,GitHub 兜底
 *   GH_TOKEN=ghp_xxx node scripts/build-index.mjs  # 给 GitHub API 鉴权
 *   FORCE_REMOTE=1 node scripts/build-index.mjs    # 跳过本地,直接走 GitHub
 *
 * 规约(v0.1.4+):
 *   每个 skill: <cat>/<slug>/SKILL.md(单文件,原样保留)
 *   - 优先匹配 SKILL.md;兼容老规约 README.md(无 DESIGN.md 也算)
 *   - frontmatter 字段: name, slug, cat, desc, source, color, logo, date, isNew
 *   - 兼容原 Qoder 格式: description → desc
 */

import { writeFile, mkdir, readFile, readdir } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { existsSync } from 'node:fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const OUT_PATH = resolve(ROOT, 'public', 'index.json')
const LOCAL_REPO = resolve(ROOT, 'data-repo')

const REPO = {
  owner: 'nothingtosayyy',
  repo: 'Mulberry-SKILL',
  branch: 'main',
}
const API_BASE = `https://api.github.com/repos/${REPO.owner}/${REPO.repo}`
const RAW_BASE = `https://raw.githubusercontent.com/${REPO.owner}/${REPO.repo}/${REPO.branch}`

// 极简 YAML frontmatter 解析:处理 `>` `|` 块标量 + 字符串引号 + 数字布尔
const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/
function parseFrontmatter(text) {
  const m = text.match(FRONTMATTER_RE)
  if (!m) return { data: {}, body: text }
  const [, fmText, body] = m
  const data = {}
  const lines = fmText.split(/\r?\n/)
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    const mm = line.match(/^([A-Za-z_][A-Za-z0-9_-]*)\s*:\s*(.*)$/)
    if (!mm) { i++; continue }
    const [, key, firstVal] = mm
    const trimmed = firstVal.trim()
    // 块标量 `>` (折叠) 或 `|` (字面)
    if (trimmed === '>' || trimmed === '>-' || trimmed === '|' || trimmed === '|-') {
      const parts = []
      i++
      while (i < lines.length && /^\s+/.test(lines[i]) && lines[i].trim() !== '') {
        parts.push(lines[i].replace(/^\s+/, ''))
        i++
      }
      let block = parts.join(' ')
      if (trimmed.startsWith('>')) {
        block = block.replace(/\s+/g, ' ').trim()
      } else {
        block = block.replace(/\s+/g, ' ').trim()
      }
      data[key] = block
      continue
    }
    let value = trimmed
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) value = value.slice(1, -1)
    if (value === 'true') value = true
    else if (value === 'false') value = false
    else if (/^-?\d+(\.\d+)?$/.test(value)) value = Number(value)
    data[key] = value
    i++
  }
  return { data, body }
}

function ghHeaders(extra = {}) {
  const h = { Accept: 'application/vnd.github+json', ...extra }
  if (process.env.GH_TOKEN) h.Authorization = `Bearer ${process.env.GH_TOKEN}`
  return h
}

// ------------------ 数据源 1:本地 data-repo ------------------

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

/**
 * 识别一个 skill 目录的产物文件:
 *   - skill: 优先 SKILL.md(详情页 MarkdownPreview 源),兼容 README.md
 *   - readme: 优先 README.md(详情页 Info 模块源 + 首页中文 title 源),可选
 * 返回 { skill, readme } 或 null(连 SKILL.md/README.md 都没有)
 */
function pickSkillFiles(files) {
  const skill = files.has('SKILL.md') ? 'SKILL.md' : files.has('README.md') ? 'README.md' : null
  if (!skill) return null
  // README.md 作为信息卡(独立于 SKILL.md 的中文浓缩版),如果存在则一并读
  const readme = files.has('README.md') ? 'README.md' : null
  return { skill, readme }
}

async function loadFromLocal() {
  if (!existsSync(LOCAL_REPO)) return null
  const all = await localWalk(LOCAL_REPO)
  const catJsonPath = all.find((x) => !x.isDir && x.path === 'categories.json')
  if (!catJsonPath) return null

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

  const skills = []
  for (const [dir, files] of byDir) {
    const parts = dir.split('/')
    if (parts.length !== 2) continue
    const [cat, slug] = parts
    if (cat.startsWith('_') || cat === '.github') continue
    if (slug.startsWith('_')) continue
    const picked = pickSkillFiles(files)
    if (!picked) continue
    skills.push({
      cat,
      slug,
      skillPath: `${dir}/${picked.skill}`,
      readmePath: picked.readme ? `${dir}/${picked.readme}` : null,
      _localSkill: join(LOCAL_REPO, dir, picked.skill),
      _localReadme: picked.readme ? join(LOCAL_REPO, dir, picked.readme) : null,
    })
  }

  return { cats, skills }
}

// ------------------ 数据源 2:GitHub API ------------------

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

function buildSkillIndexFromTree(tree) {
  const byDir = new Map()
  for (const node of tree) {
    if (node.type !== 'blob') continue
    const idx = node.path.lastIndexOf('/')
    if (idx < 0) continue
    const dir = node.path.slice(0, idx)
    if (!byDir.has(dir)) byDir.set(dir, new Set())
    byDir.get(dir).add(node.path.slice(idx + 1))
  }
  const skills = []
  for (const [dir, files] of byDir) {
    const parts = dir.split('/')
    if (parts.length !== 2) continue
    const [cat, slug] = parts
    if (cat.startsWith('_') || cat === '.github') continue
    if (slug.startsWith('_')) continue
    const picked = pickSkillFiles(files)
    if (!picked) continue
    skills.push({
      cat,
      slug,
      skillPath: `${dir}/${picked.skill}`,
      readmePath: picked.readme ? `${dir}/${picked.readme}` : null,
    })
  }
  return skills
}

async function loadFromGitHub() {
  console.log('[build-index] 使用 GitHub API')
  const [tree, cats] = await Promise.all([ghFetchTree(), ghFetchCategories()])
  const index = buildSkillIndexFromTree(tree)
  return { cats, skills: index.map((s) => ({ ...s })) }
}

// ------------------ 主流程 ------------------

async function loadIndex() {
  if (process.env.FORCE_REMOTE !== '1' && existsSync(LOCAL_REPO)) {
    console.log(`[build-index] 使用本地 data-repo/(设置 FORCE_REMOTE=1 强制走 GitHub)`)
    const r = await loadFromLocal()
    if (r) return r
    console.log('[build-index] 本地 data-repo 缺少必要文件,回退到 GitHub')
  }
  return await loadFromGitHub()
}

async function readSkillText(skill) {
  if (skill._localSkill) {
    return await readFile(skill._localSkill, 'utf8')
  }
  return await ghFetchRaw(skill.skillPath)
}

async function readReadmeText(skill) {
  if (!skill.readmePath) return null
  if (skill._localReadme) {
    return await readFile(skill._localReadme, 'utf8')
  }
  return await ghFetchRaw(skill.readmePath)
}

async function main() {
  console.log('[build-index] 读取数据源…')
  const { cats, skills: index } = await loadIndex()
  const catMap = new Map(cats.map((c) => [c.key, c]))
  console.log(`[build-index] 识别到 ${index.length} 个 Skill,${cats.length} 个分类`)

  console.log('[build-index] 并发读取所有 SKILL.md frontmatter + README.md title…')
  const skills = (
    await Promise.all(
      index.map(async (s) => {
        try {
          const text = await readSkillText(s)
          const { data } = parseFrontmatter(text)
          // 兼容 Qoder 格式:description → desc
          const skillDesc = (data.desc || data.description || '').toString().replace(/\s+/g, ' ').trim()

          // 读 README.md 取中文 title + 中文 desc(优先),首页描述用此源
          let title = null
          let readmeDesc = null
          if (s.readmePath) {
            const readmeText = await readReadmeText(s)
            if (readmeText) {
              const { data: rd } = parseFrontmatter(readmeText)
              title = (rd.title || '').toString().trim() || null
              readmeDesc = (rd.desc || '').toString().replace(/\s+/g, ' ').trim() || null
            }
          }

          return {
            cat: s.cat,
            slug: s.slug,
            skillPath: s.skillPath,
            readmePath: s.readmePath,
            name: data.name || s.slug,
            title: title || data.name || s.slug, // 首页与详情页优先用中文 title
            desc: (readmeDesc || skillDesc).slice(0, 200), // 首页描述优先用 README 的中文 desc
            color: data.color || '#888888',
            logo: data.logo || (data.name || s.slug).slice(0, 1).toUpperCase(),
            date: data.date || '',
            isNew: !!data.isNew,
            source: data.source || '',
            catLabel: catMap.get(s.cat)?.label || s.cat,
          }
        } catch (e) {
          console.warn(`[build-index] skip ${s.skillPath}: ${e.message}`)
          return null
        }
      })
    )
  ).filter(Boolean)

  const byCategory = new Map()
  for (const s of skills) {
    if (!byCategory.has(s.cat)) byCategory.set(s.cat, [])
    byCategory.get(s.cat).push(s)
  }
  const categories = cats
    .map((c) => ({ ...c, count: byCategory.get(c.key)?.length || 0 }))
    .filter((c) => c.count > 0)
  categories.unshift({ key: 'all', label: '全部', order: 0, count: skills.length })

  const payload = {
    generatedAt: new Date().toISOString(),
    source: existsSync(LOCAL_REPO) && process.env.FORCE_REMOTE !== '1' ? 'local' : 'github',
    categories,
    skills,
    byCategory: Object.fromEntries(byCategory),
  }

  await mkdir(dirname(OUT_PATH), { recursive: true })
  await writeFile(OUT_PATH, JSON.stringify(payload, null, 2), 'utf8')
  console.log(`[build-index] 写入 ${OUT_PATH}`)
  console.log(
    `[build-index] 完成:${skills.length} 个 Skill,${categories.length} 个分类(含"全部")`
  )
}

main().catch((e) => {
  console.error('[build-index] 失败:', e.message)
  process.exit(1)
})
