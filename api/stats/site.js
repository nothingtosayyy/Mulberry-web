// 站点级统计 — 4 项指标完整实现:
//   1. 今日 PV(今日总访问量)    daily_scope_stats[今天, 'site'].pv
//   2. 今日 UV(今日总访客数)    COUNT(*) FROM uv_log WHERE date=今天 AND scope='site'
//   3. 本站 PV(本站总访问量)    site_stats['pv']
//   4. 本站 UV(本站总访客数)    COUNT(DISTINCT visitor_id) FROM uv_log WHERE scope='site'
//
// POST = 计入 PV + 记录 UV(同 visitor_id 当日同 scope 重复访问只算 1 人)
// GET  = 只读,所有指标聚合查询
//
// 优雅降级:Turso 环境变量未配置时返回 { configured: false, 全部 null }

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
      sql: `CREATE TABLE IF NOT EXISTS site_stats (
        key TEXT PRIMARY KEY,
        value INTEGER NOT NULL DEFAULT 0,
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

async function incrSitePv(db) {
  const r = await db.execute({
    sql: `INSERT INTO site_stats (key, value) VALUES ('pv', 1)
          ON CONFLICT(key) DO UPDATE SET
            value = value + 1,
            updated_at = datetime('now')
          RETURNING value`,
    args: [],
  })
  return Number(r.rows[0]?.value ?? 1)
}

async function incrDailyScopePv(db, date, scope) {
  await db.execute({
    sql: `INSERT INTO daily_scope_stats (date, scope, pv) VALUES (?, ?, 1)
          ON CONFLICT(date, scope) DO UPDATE SET pv = pv + 1`,
    args: [date, scope],
  })
}

async function logVisitor(db, date, scope, vid) {
  // PRIMARY KEY (date, scope, visitor_id) 保证:同 scope+日期+vid 重复写无副作用
  await db.execute({
    sql: 'INSERT OR IGNORE INTO uv_log (date, scope, visitor_id) VALUES (?, ?, ?)',
    args: [date, scope, vid],
  })
}

async function getSitePv(db) {
  const r = await db.execute({
    sql: "SELECT value FROM site_stats WHERE key = 'pv'",
    args: [],
  })
  return Number(r.rows[0]?.value ?? 0)
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
    sitePv: null,
    siteUv: null,
    todayPv: null,
    todayUv: null,
    configured: false,
  }
}

export default async function handler(req, res) {
  const db = getDb()
  if (!db) return res.status(200).json(emptyResult())

  try {
    await ensureTables(db)
    const today = todayKey()

    if (req.method === 'POST') {
      const vid = getOrCreateVisitorId(req, res)

      // 写入:PV 总 + 当日 PV + UV 日志(去重)
      const [sitePv] = await Promise.all([
        incrSitePv(db),
        incrDailyScopePv(db, today, 'site'),
        logVisitor(db, today, 'site', vid),
      ])

      // 返回完整快照
      const [todayPv, siteUv, todayUv] = await Promise.all([
        getDailyScopePv(db, today, 'site'),
        getScopeUv(db, 'site', { todayOnly: false }),
        getScopeUv(db, 'site', { todayOnly: true }),
      ])

      return res.status(200).json({
        sitePv,
        siteUv,
        todayPv,
        todayUv,
        configured: true,
      })
    }

    if (req.method === 'GET') {
      const [sitePv, todayPv, siteUv, todayUv] = await Promise.all([
        getSitePv(db),
        getDailyScopePv(db, today, 'site'),
        getScopeUv(db, 'site', { todayOnly: false }),
        getScopeUv(db, 'site', { todayOnly: true }),
      ])
      return res.status(200).json({
        sitePv,
        siteUv,
        todayPv,
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
