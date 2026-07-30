/**
 * mulberry-publish-skills — 批量从 C:/Users/10214/Desktop/QoderWork-Skills
 * 复制原始 SKILL.md 到 data-repo/,只搬原始内容,加最小 mulberry 元数据。
 *
 * 新规约(替代旧的 README.md + DESIGN.md):
 *   - 每个 skill: <cat>/<slug>/SKILL.md(单文件,原样保留)
 *   - 元数据从前置 YAML 读(name, description),slug/cat/color/logo/date 走默认或显式指定
 */
import { readFile, writeFile, mkdir, rm } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const REPO = resolve(ROOT, 'data-repo')
const SRC = 'C:/Users/10214/Desktop/QoderWork-Skills'

// 配置: 20 个 Qoder skill,定义路径映射和 mulberry 元数据
// (cat, slug, sourcePath, name, color, logo)
const skills = [
  // design (2)
  { cat: 'design', slug: 'ai-page-polish',         src: 'ai-page-polish/SKILL.md',                       color: '#FF6B9D' },
  { cat: 'design', slug: 'ui-designer',            src: 'ui-designer/SKILL.md',                          color: '#FF6B9D' },
  // dev-tools (3)
  { cat: 'dev-tools', slug: 'app-version-policy',  src: 'app-version-policy/SKILL.md',                   color: '#4A90E2' },
  { cat: 'dev-tools', slug: 'frontend-design',      src: 'frontend-design/SKILL.md',                      color: '#4A90E2' },
  { cat: 'dev-tools', slug: 'prototype-factory',    src: 'prototype-factory/SKILL.md',                    color: '#4A90E2' },
  // saas (15)
  { cat: 'saas', slug: 'airtable-design',           src: 'airtable-design/SKILL.md',                     color: '#FCB400' },
  { cat: 'saas', slug: 'content-research-writer',  src: 'content-research-writer/SKILL.md',            color: '#5E6AD2' },
  { cat: 'saas', slug: 'deep-research',            src: 'deep-research/SKILL.md',                      color: '#5E6AD2' },
  { cat: 'saas', slug: 'documents',                src: 'documents/SKILL.md',                          color: '#5E6AD2' },
  { cat: 'saas', slug: 'jwynia-requirements-analysis', src: 'jwynia-requirements-analysis/SKILL.md',    color: '#5E6AD2' },
  { cat: 'saas', slug: 'natural-writing',          src: 'natural-writing/SKILL.md',                    color: '#5E6AD2' },
  // PM 子技能 (product-management-custom/skills/...)
  { cat: 'saas', slug: 'pm-prd',                   src: 'product-management-custom/skills/PRD生成/SKILL.md',        color: '#5E6AD2' },
  { cat: 'saas', slug: 'pm-metrics-review',        src: 'product-management-custom/skills/产品指标复盘/SKILL.md',  color: '#5E6AD2' },
  { cat: 'saas', slug: 'pm-brainstorm',            src: 'product-management-custom/skills/产品脑暴/SKILL.md',      color: '#5E6AD2' },
  { cat: 'saas', slug: 'pm-user-feedback',         src: 'product-management-custom/skills/用户反馈分析/SKILL.md',  color: '#5E6AD2' },
  { cat: 'saas', slug: 'pm-user-story',            src: 'product-management-custom/skills/用户故事拆解/SKILL.md',  color: '#5E6AD2' },
  { cat: 'saas', slug: 'pm-competitor',            src: 'product-management-custom/skills/竞品分析/SKILL.md',      color: '#5E6AD2' },
  { cat: 'saas', slug: 'pm-roadmap',               src: 'product-management-custom/skills/路线图更新/SKILL.md',    color: '#5E6AD2' },
  { cat: 'saas', slug: 'pm-prioritization',        src: 'product-management-custom/skills/需求优先级排序/SKILL.md', color: '#5E6AD2' },
  { cat: 'saas', slug: 'product-manager-proactive',src: 'product-manager-proactive/SKILL.md',          color: '#5E6AD2' },
]

const today = new Date().toISOString().slice(0, 10)

// 简单 YAML frontmatter 解析,处理 `>` `|` 块标量
function parseFrontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
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
    if (trimmed === '>' || trimmed === '>' + '-' || trimmed === '|' || trimmed === '|' + '-') {
      const parts = []
      i++
      while (i < lines.length && /^\s+/.test(lines[i]) && lines[i].trim() !== '') {
        parts.push(lines[i].replace(/^\s+/, ''))
        i++
      }
      let block = parts.join(' ')
      if (trimmed.startsWith('>')) {
        // 折叠块:合并为单行,空格分隔
        block = block.replace(/\s+/g, ' ').trim()
      } else {
        // 字面块:换行保留(这里用单空格替代足够)
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

// 把 mulberry 元数据注入 frontmatter(如果原 frontmatter 已有 name/description,保留;否则用 slug 兜底)
function injectMulberryMeta(originalText, { cat, slug, color, logo, date }) {
  const { data, body } = parseFrontmatter(originalText)
  const name = data.name || slug
  const desc = (data.description || data.desc || '').toString().replace(/\s+/g, ' ').trim().slice(0, 200)
  // 重新拼装:保留原 frontmatter 字段 + 追加 mulberry 字段
  const preserved = []
  for (const [k, v] of Object.entries(data)) {
    if (['name', 'desc', 'slug', 'cat', 'color', 'logo', 'date', 'isNew', 'source'].includes(k)) continue
    const s = typeof v === 'string' ? v : JSON.stringify(v)
    preserved.push(`  ${k}: ${s.includes('\n') ? '|' : s}`)
  }
  const metaLines = [
    `name: ${name}`,
    `slug: ${slug}`,
    `cat: ${cat}`,
    `desc: ${desc}`,
    `source: ${data.source || ''}`,
    `color: "${color}"`,
    `logo: "${logo}"`,
    `date: ${date}`,
  ]
  return `---\n${metaLines.join('\n')}\n${preserved.length ? '\n' + preserved.join('\n') + '\n' : ''}---\n\n${body.trim()}\n`
}

let count = 0
for (const s of skills) {
  const srcPath = join(SRC, s.src)
  const destDir = join(REPO, s.cat, s.slug)
  const destPath = join(destDir, 'SKILL.md')

  if (!existsSync(srcPath)) {
    console.warn(`⚠️  source not found: ${s.src}`)
    continue
  }

  // 清掉旧的 README.md / DESIGN.md(新规约只用 SKILL.md)
  await rm(join(destDir, 'README.md'), { force: true })
  await rm(join(destDir, 'DESIGN.md'), { force: true })

  await mkdir(destDir, { recursive: true })

  const original = await readFile(srcPath, 'utf8')
  const { data } = parseFrontmatter(original)
  const name = data.name || s.slug
  // logo: name 首字符(取第一个非空格字符)
  const logo = (name.toString().replace(/^[\s-]+/, ''))[0] || s.slug[0]

  const out = injectMulberryMeta(original, { cat: s.cat, slug: s.slug, color: s.color, logo, date: today })
  await writeFile(destPath, out, 'utf8')

  count++
  console.log(`✓ ${s.cat}/${s.slug} ← ${s.src}`)
}

console.log(`\nDONE: ${count} skills copied (as SKILL.md)`)
