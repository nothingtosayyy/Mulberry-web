// 站点总 PV 计数 — Vercel Serverless Function + Turso (libSQL)
// 复用文章阅读数用的同套架构,确保数据真正属于本站
//
// 表 site_stats:
//   key TEXT PRIMARY KEY  ('pv' = 站点总 PV,后续可加 'uv:*' 之类)
//   value INTEGER NOT NULL DEFAULT 0
//   updated_at TEXT NOT NULL DEFAULT (datetime('now'))
//
// POST = 计入 +1 并返回新值(用于 about 页挂载时自增)
// GET  = 仅查询(用于弹窗打开时刷新展示)
//
// 优雅降级:Turso 环境变量未配置时返回 { pv: null, configured: false }

import { createClient } from '@libsql/client'

let db = null

function getDb() {
  if (db) return db
  const url = process.env.TURSO_DATABASE_URL
  const authToken = process.env.TURSO_AUTH_TOKEN
  if (!url || !authToken) return null
  db = createClient({ url, authToken })
  return db
}

async function ensureTable(db) {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS site_stats (
      key TEXT PRIMARY KEY,
      value INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `)
}

async function getCount(db, key) {
  const r = await db.execute({
    sql: 'SELECT value FROM site_stats WHERE key = ?',
    args: [key],
  })
  return Number(r.rows[0]?.value ?? 0)
}

async function incr(db, key) {
  const r = await db.execute({
    sql: `INSERT INTO site_stats (key, value) VALUES (?, 1)
          ON CONFLICT(key) DO UPDATE SET
            value = value + 1,
            updated_at = datetime('now')
          RETURNING value`,
    args: [key],
  })
  return Number(r.rows[0]?.value ?? 1)
}

export default async function handler(req, res) {
  const db = getDb()
  if (!db) {
    return res.status(200).json({ pv: null, configured: false })
  }

  try {
    await ensureTable(db)

    if (req.method === 'POST') {
      const pv = await incr(db, 'pv')
      return res.status(200).json({ pv, configured: true })
    }

    if (req.method === 'GET') {
      const pv = await getCount(db, 'pv')
      return res.status(200).json({ pv, configured: true })
    }

    res.setHeader('Allow', 'GET, POST')
    return res.status(405).json({ error: 'method not allowed' })
  } catch (e) {
    return res.status(500).json({ error: 'db error', detail: String(e?.message || e) })
  }
}
