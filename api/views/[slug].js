/**
 * 单篇文章阅读数 API(/api/views/[slug])
 *
 * GET  → { views: N }   读取当前计数
 * POST → { views: N+1 } 自增并返回新值
 *
 * 后端:Vercel Serverless Function + Turso(libSQL 边缘数据库)
 * 环境变量(由用户在 Vercel 项目中链接 Turso 后自动注入):
 *   - TURSO_DATABASE_URL
 *   - TURSO_AUTH_TOKEN
 *
 * 库未配置时,优雅返回 views: null(不报错 5xx),
 * 前端拿到 null 不显示阅读数,静态站点不崩。
 */
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

// 首次访问时建表(幂等,无副作用)
async function ensureTable(db) {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS article_views (
      slug TEXT PRIMARY KEY,
      views INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `)
}

export default async function handler(req, res) {
  const { slug } = req.query
  if (!slug || typeof slug !== 'string') {
    return res.status(400).json({ error: 'slug required' })
  }
  // 防滥用:slug 限制为 100 字符,只允许 [a-z0-9-]
  if (slug.length > 100 || !/^[a-z0-9-]+$/.test(slug)) {
    return res.status(400).json({ error: 'invalid slug' })
  }

  const db = getDb()
  if (!db) {
    // Turso 未配置,返回 null 让前端隐藏阅读数
    return res.status(200).json({ views: null, configured: false })
  }

  try {
    await ensureTable(db)

    if (req.method === 'POST') {
      // 原子 upsert + 自增,RETURNING 一并拿新值(避免二次查询)
      const r = await db.execute({
        sql: `INSERT INTO article_views (slug, views) VALUES (?, 1)
              ON CONFLICT(slug) DO UPDATE SET
                views = views + 1,
                updated_at = datetime('now')
              RETURNING views`,
        args: [slug],
      })
      const views = Number(r.rows[0]?.views ?? 1)
      return res.status(200).json({ views, configured: true })
    }

    if (req.method === 'GET') {
      const r = await db.execute({
        sql: 'SELECT views FROM article_views WHERE slug = ?',
        args: [slug],
      })
      const views = Number(r.rows[0]?.views ?? 0)
      return res.status(200).json({ views, configured: true })
    }

    return res.status(405).json({ error: 'method not allowed' })
  } catch (e) {
    return res.status(500).json({ error: 'db error', detail: String(e?.message || e) })
  }
}
