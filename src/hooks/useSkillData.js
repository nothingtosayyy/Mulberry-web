/**
 * useSkillData — 公开站的核心数据 Hook
 *
 * 工作流:
 *   - useSkillIndex():  从 /index.json 读(构建时固化,CDN 永久缓存)
 *   - useSkillDetail(): 从 /api/raw/<path> 读(走 Vercel Edge 代理,s-maxage=300)
 *
 * 性能与限流:
 *   - 首页:1 个静态文件请求,GitHub 完全不参与
 *   - 详情页:2 个边缘代理请求,首字节 5 分钟内命中边缘缓存
 *   - 完全不直接访问 api.github.com / raw.githubusercontent.com(前端)
 */

import { useEffect, useState } from 'react'
import { parseFrontmatter } from '../data/parser.js'

const INDEX_URL = '/index.json'
const CACHE_KEY = 'mulberry:skill-index:v1'
const CACHE_TTL = 5 * 60 * 1000 // 5 分钟(浏览器内,用于版本切换时即时刷新)

function readCache() {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const { ts, payload } = JSON.parse(raw)
    if (Date.now() - ts > CACHE_TTL) return null
    return payload
  } catch {
    return null
  }
}

function writeCache(payload) {
  try {
    sessionStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ ts: Date.now(), payload })
    )
  } catch {}
}

/**
 * 解析 README.md 信息卡:
 *   - frontmatter.title → title
 *   - frontmatter.lead / 第一段 → lead
 *   - 其余段落 → paragraphs(详情页 info-desc 展示)
 * 返回 null 表示没有 README.md
 */
function parseReadme(text) {
  if (!text) return null
  const { data, body } = parseFrontmatter(text)
  // 去掉首行 # 标题(避免与 frontmatter.title 重复)
  const lines = body.split(/\r?\n/)
  let i = 0
  while (i < lines.length && lines[i].trim() === '') i++
  if (i < lines.length && /^#\s+/.test(lines[i].trim())) i++
  const rest = lines.slice(i).join('\n').trim()
  // 按空行分段
  const paragraphs = rest
    .split(/\n{2,}/)
    .map((p) => p.replace(/^\s+|\s+$/g, ''))
    .filter((p) => p.length > 0)
  return {
    title: (data.title || '').toString().trim() || null,
    lead: paragraphs[0] || '',
    paragraphs: paragraphs.slice(1),
    meta: data,
  }
}

async function fetchIndex() {
  // cache: 'no-cache' = 浏览器本地仍缓存,但每次请求都带 ETag/If-Modified-Since revalidate。
  // 资源未变 → 304 Not Modified(几百字节,几乎零成本)
  // 资源已变(部署后) → 立即拿到新版本,用户无需手动刷新
  const res = await fetch(INDEX_URL, { cache: 'no-cache' })
  if (!res.ok) {
    throw new Error(
      `index.json failed: ${res.status} — 请先执行 "npm run build:index" 生成静态索引`
    )
  }
  return res.json()
}

async function loadIndex() {
  const cached = readCache()
  if (cached) return cached
  const payload = await fetchIndex()
  // byCategory 重新转回 Map(API 给的是 plain object)
  if (payload.byCategory && !payload.byCategory.__isMap) {
    const m = new Map()
    for (const [k, v] of Object.entries(payload.byCategory)) m.set(k, v)
    payload.byCategory = m
    payload.byCategory.__isMap = true
  }
  writeCache(payload)
  return payload
}

/**
 * 顶层 hook:首页列表
 * @returns {{ loading, error, data: { categories, skills, byCategory, generatedAt } }}
 */
export function useSkillIndex() {
  const [state, setState] = useState({
    loading: true,
    error: null,
    data: null,
  })

  useEffect(() => {
    let cancelled = false
    loadIndex()
      .then((data) => {
        if (cancelled) return
        setState({ loading: false, error: null, data })
      })
      .catch((err) => {
        if (cancelled) return
        setState({ loading: false, error: err, data: null })
      })
    return () => {
      cancelled = true
    }
  }, [])

  return state
}

/**
 * 详情页 hook:拉单个 Skill 的两个文件
 *   - SKILL.md: 原始完整文档(详情页 MarkdownPreview 展示)
 *   - README.md: 中文信息卡(详情页 Info 模块展示 + 中文 title 源)
 * 走 Vercel Edge 代理,边缘 5 分钟缓存
 */
export function useSkillDetail({ cat, slug, skillPath, readmePath }) {
  const [state, setState] = useState({ loading: true, error: null, data: null })

  useEffect(() => {
    if (!skillPath) {
      setState({ loading: false, error: new Error('Missing skillPath'), data: null })
      return
    }
    let cancelled = false
    Promise.all([
      fetch(`/api/raw/${skillPath}`).then((r) => {
        if (!r.ok) throw new Error(`SKILL.md ${r.status}`)
        return r.text()
      }),
      readmePath
        ? fetch(`/api/raw/${readmePath}`).then((r) => {
            if (!r.ok) throw new Error(`README.md ${r.status}`)
            return r.text()
          })
        : Promise.resolve(null),
    ])
      .then(([skillText, readmeText]) => {
        if (cancelled) return
        const fm = parseFrontmatter(skillText)
        const readme = parseReadme(readmeText)
        setState({
          loading: false,
          error: null,
          data: { meta: fm.data, body: fm.body, readme, cat, slug },
        })
      })
      .catch((err) => {
        if (cancelled) return
        setState({ loading: false, error: err, data: null })
      })
    return () => {
      cancelled = true
    }
  }, [cat, slug, skillPath, readmePath])

  return state
}
