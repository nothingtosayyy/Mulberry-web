/**
 * 单篇文章阅读数 API(/api/views/[slug])
 *
 * GET  → { views: N }   读取当前计数
 * POST → { views: N+1 } 自增并返回新值
 *
 * 后端:Vercel Serverless Function + Upstash Redis
 * 环境变量(由 Vercel Marketplace 装库后自动注入):
 *   - KV_REST_API_URL
 *   - KV_REST_API_TOKEN
 *
 * KV 没装好时,优雅返回 views: null(不报错 5xx),
 * 前端拿到 null 不显示阅读数,静态站点不崩。
 */
import { Redis } from '@upstash/redis'

let redis = null
function getRedis() {
  if (redis) return redis
  const url = process.env.KV_REST_API_URL
  const token = process.env.KV_REST_API_TOKEN
  if (!url || !token) return null
  redis = new Redis({ url, token })
  return redis
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

  const r = getRedis()
  if (!r) {
    // KV 未配置,返回 null 让前端隐藏阅读数
    return res.status(200).json({ views: null, configured: false })
  }

  const key = `views:${slug}`

  try {
    if (req.method === 'POST') {
      const v = await r.incr(key)
      return res.status(200).json({ views: Number(v), configured: true })
    }
    if (req.method === 'GET') {
      const v = (await r.get(key)) || 0
      return res.status(200).json({ views: Number(v), configured: true })
    }
    return res.status(405).json({ error: 'method not allowed' })
  } catch (e) {
    return res.status(500).json({ error: 'redis error', detail: String(e?.message || e) })
  }
}
