/**
 * useArticles — 文章数据 Hook
 *
 * 工作流(与 useSkillData 平行):
 *   - useArticleIndex():  从 /articles.json 读(构建时固化)
 *   - useArticleDetail(): 从 /api/word/<path> 读(走 Vercel Edge 代理,5min 缓存)
 *   - 详情页正文由前端 marked 渲染(避免后端预处理 toc 与正文重复)
 *   - toc 来自 articles.json(构建时从 h2/h3 提取)
 */

import { useEffect, useState } from 'react'
import { markdownToHtml } from '../data/parser.js'

const INDEX_URL = '/articles.json'
const CACHE_KEY = 'mulberry:article-index:v1'
const CACHE_TTL = 5 * 60 * 1000

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
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), payload }))
  } catch {}
}

async function loadIndex() {
  const cached = readCache()
  if (cached) return cached
  const res = await fetch(INDEX_URL, { cache: 'no-cache' })
  if (!res.ok) {
    throw new Error(
      `articles.json failed: ${res.status} — 请先执行 "npm run build:articles" 生成静态索引`
    )
  }
  const payload = await res.json()
  writeCache(payload)
  return payload
}

/**
 * 顶层 hook:文章索引
 * @returns {{ loading, error, data: { categories, articles, generatedAt } }}
 */
export function useArticleIndex() {
  const [state, setState] = useState({ loading: true, error: null, data: null })
  useEffect(() => {
    let cancelled = false
    loadIndex()
      .then((data) => {
        if (!cancelled) setState({ loading: false, error: null, data })
      })
      .catch((err) => {
        if (!cancelled) setState({ loading: false, error: err, data: null })
      })
    return () => {
      cancelled = true
    }
  }, [])
  return state
}

/**
 * 详情页 hook:拉单篇文章原文 + 客户端 marked 渲染
 * @param {{ path: string }} opts
 * @returns {{ loading, error, data: { meta, html } | null }}
 */
export function useArticleDetail({ path }) {
  const [state, setState] = useState({ loading: true, error: null, data: null })
  useEffect(() => {
    if (!path) {
      setState({ loading: false, error: new Error('Missing path'), data: null })
      return
    }
    let cancelled = false
    fetch(`/api/word/${path}`)
      .then((r) => {
        if (!r.ok) throw new Error(`fetch article failed: ${r.status}`)
        return r.text()
      })
      .then((text) => {
        if (cancelled) return
        const html = markdownToHtml(text)
        setState({ loading: false, error: null, data: { html } })
      })
      .catch((err) => {
        if (!cancelled) setState({ loading: false, error: err, data: null })
      })
    return () => {
      cancelled = true
    }
  }, [path])
  return state
}
