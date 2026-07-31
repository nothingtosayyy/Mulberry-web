// Visitor identification helper(Vercel Function 公用)
//
// 原则(坦诚说明):
//   - 同 IP + UA + 同一天 → 算 1 个访客
//   - 跨天自动重算(每日 salt 注入哈希)
//   - 浏览器清 cookie 后再访问 → 算新人
//   - 多个设备共用同 IP(公司 / 学校网络)→ 算同一人
//   - 这跟不蒜子、百度统计、Google Analytics 同类:轻量近似,不是 100% 精确
//
// cookie 策略:1 年 HttpOnly,SameSite=Lax(防止 CSRF),生产环境加 Secure

import { createHash } from 'node:crypto'

const COOKIE_NAME = 'mulberry_vid'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365 // 1 年

function hash(input) {
  return createHash('sha256').update(input).digest('hex').slice(0, 16)
}

function todayKey() {
  return new Date().toISOString().slice(0, 10) // YYYY-MM-DD (UTC)
}

/**
 * 从请求中取 visitor_id;没就生成一个(基于 IP+UA+日 salt)并写回 cookie
 * @param {object} req - Vercel request(支持 req.headers / req.socket)
 * @param {object} res - Vercel response(支持 setHeader)
 * @returns {string} 16 字符哈希
 */
function getOrCreateVisitorId(req, res) {
  // 1. 优先从 cookie 读
  const cookieHeader = req.headers?.cookie || ''
  const m = cookieHeader.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]+)`))
  if (m && m[1]) return m[1]

  // 2. IP(优先 Vercel 注入的 x-forwarded-for,取第一个)
  const xff = req.headers?.['x-forwarded-for'] || ''
  const ip = (xff.split(',')[0] || '').trim()
    || req.headers?.['x-real-ip']
    || req.socket?.remoteAddress
    || 'unknown'

  // 3. UA(浏览器标识)
  const ua = req.headers?.['user-agent'] || 'unknown'

  // 4. 生成 16 字符 hash(注入当日 salt,跨天自动变)
  const id = hash(`${ip}|${ua}|${todayKey()}`)

  // 5. 写 cookie(1 年,跨设备不共享,清 cookie 后算新人)
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  const newCookie = `${COOKIE_NAME}=${id}; Path=/; Max-Age=${COOKIE_MAX_AGE}; SameSite=Lax${secure}; HttpOnly`

  const existing = res.getHeader('Set-Cookie')
  if (!existing) {
    res.setHeader('Set-Cookie', newCookie)
  } else if (Array.isArray(existing)) {
    res.setHeader('Set-Cookie', [...existing, newCookie])
  } else {
    res.setHeader('Set-Cookie', [existing, newCookie])
  }

  return id
}

export { getOrCreateVisitorId, todayKey }
