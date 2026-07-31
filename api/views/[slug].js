// 单页统计(通用) — 4 项指标完整实现:
//   1. 今日 PV(本页今日总阅读量)  daily_scope_stats[今天, slug].pv
//   2. 今日 UV(本页今日总访客数)  COUNT(*) FROM uv_log WHERE date=今天 AND scope=slug
//   3. 本页 PV(本页总阅读量)      article_views[slug].views
//   4. 本页 UV(本页总访客数)      COUNT(DISTINCT visitor_id) FROM uv_log WHERE scope=slug
//
// 适用:文章页(slug = /word/rag-...) / 关于页(slug = 'about') / 任意 path
// 用 slug 当 scope,跟 site 端共用同一套 uv_log / daily_scope_stats 表
//
// 优雅降级保持(原来 { views: null, configured: false } 的契约)

import { createClient } from '@libsql/client'
import { getOrCreateVisitorId, todayKey } from '../_lib/visitor.js'

let db = null

function getDb() {
  if (db) return db
  const url = process.env.TURSO_DATABASE_URL
  const authToken = process.env.TURSO_AUTH_TOKEN
  if (!url || !authToken) return null
  db = createClient({ url, authToken })
  return db
}

async function ensureTables(db) {
  await db.batch([
    {
      sql: `CREATE TABLE IF NOT EXISTS article_views (
        slug TEXT PRIMARY KEY,
        views INTEGER NOT NULL DEFAULT 0,
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      )`,
    },
    {
      sql: `CREATE TABLE IF NOT EXISTS daily_scope_stats (
        date TEXT NOT NULL,
        scope TEXT NOT NULL,
        pv INTEGER NOT NULL DEFAULT 0,
        PRIMARY KEY (date, scope)
      )`,
    },
    {
      sql: `CREATE TABLE IF NOT EXISTS uv_log (
        date TEXT NOT NULL,
        scope TEXT NOT NULL,
        visitor_id TEXT NOT NULL,
        PRIMARY KEY (date, scope, visitor_id)
      )`,
    },
  ])
}

function isValidSlug(slug) {
  return (
    typeof slug === 'string' &&
    slug.length > 0 &&
    slug.length <= 100 &&
    /^[a-z0-9\-_/]+$/i.test(slug)
  )
}

async function incrPageView(db, slug) {
  const r = await db.execute({
    sql: `INSERT INTO article_views (slug, views) VALUES (?, 1)
          ON CONFLICT(slug) DO UPDATE SET
            views = views + 1,
            updated_at = datetime('now')
          RETURNING views`,
    args: [slug],
  })
  return Number(r.rows[0]?.views ?? 1)
}

async function incrDailyScopePv(db, date, scope) {
  await db.execute({
    sql: `INSERT INTO daily_scope_stats (date, scope, pv) VALUES (?, ?, 1)
          ON CONFLICT(date, scope) DO UPDATE SET pv = pv + 1`,
    args: [date, scope],
  })
}

async function logVisitor(db, date, scope, vid) {
  await db.execute({
    sql: 'INSERT OR IGNORE INTO uv_log (date, scope, visitor_id) VALUES (?, ?, ?)',
    args: [date, scope, vid],
  })
}

async function getPageView(db, slug) {
  const r = await db.execute({
    sql: 'SELECT views FROM article_views WHERE slug = ?',
    args: [slug],
  })
  return Number(r.rows[0]?.views ?? 0)
}

async function getDailyScopePv(db, date, scope) {
  const r = await db.execute({
    sql: 'SELECT pv FROM daily_scope_stats WHERE date = ? AND scope = ?',
    args: [date, scope],
  })
  return Number(r.rows[0]?.pv ?? 0)
}

async function getScopeUv(db, scope, { todayOnly = false } = {}) {
  const sql = todayOnly
    ? 'SELECT COUNT(*) AS uv FROM uv_log WHERE scope = ? AND date = ?'
    : 'SELECT COUNT(DISTINCT visitor_id) AS uv FROM uv_log WHERE scope = ?'
  const args = todayOnly ? [scope, todayKey()] : [scope]
  const r = await db.execute({ sql, args })
  return Number(r.rows[0]?.uv ?? 0)
}

function emptyResult() {
  return {
    views: null,
    uv: null,
    todayViews: null,
    todayUv: null,
    configured: false,
  }
}

export default async function handler(req, res) {
  const { slug } = req.query

  if (!slug || !isValidSlug(slug)) {
    return res.status(400).json({ error: 'invalid slug' })
  }

  const db = getDb()
  if (!db) return res.status(200).json(emptyResult())

  try {
    await ensureTables(db)
    const today = todayKey()

    if (req.method === 'POST') {
      const vid = getOrCreateVisitorId(req, res)

      const [views] = await Promise.all([
        incrPageView(db, slug),
        incrDailyScopePv(db, today, slug),
        logVisitor(db, today, slug, vid),
      ])

      const [todayViews, uv, todayUv] = await Promise.all([
        getDailyScopePv(db, today, slug),
        getScopeUv(db, slug, { todayOnly: false }),
        getScopeUv(db, slug, { todayOnly: true }),
      ])

      return res.status(200).json({
        views,
        uv,
        todayViews,
        todayUv,
        configured: true,
      })
    }

    if (req.method === 'GET') {
      const [views, todayViews, uv, todayUv] = await Promise.all([
        getPageView(db, slug),
        getDailyScopePv(db, today, slug),
        getScopeUv(db, slug, { todayOnly: false }),
        getScopeUv(db, slug, { todayOnly: true }),
      ])
      return res.status(200).json({
        views,
        uv,
        todayViews,
        todayUv,
        configured: true,
      })
    }

    res.setHeader('Allow', 'GET, POST')
    return res.status(405).json({ error: 'method not allowed' })
  } catch (e) {
    return res.status(500).json({ error: 'db error', detail: String(e?.message || e) })
  }
}
