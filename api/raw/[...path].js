/**
 * Vercel Edge Function — 代理 raw.githubusercontent.com
 *
 * 路径: GET /api/raw/<repo path>
 * 例:   /api/raw/auto/bmw-m/README.md
 *
 * 优势:
 *   1. 边缘缓存 5 分钟(s-maxage=300, stale-while-revalidate=86400)
 *      - 全局用户访问同一 URL,只回源 GitHub 一次
 *      - 即使公网有 1000 个并发,GitHub 也只看到 1 个请求
 *   2. 可选鉴权:env.GH_TOKEN 把限流提到 5000/h
 *   3. 统一 Content-Type,前端无需处理 markdown 嗅探
 *
 * 部署:
 *   - Vercel 自动识别 api/ 目录下的 .js / .ts 作为 Functions
 *   - 默认 runtime 是 Node.js(从 vercel.json 可显式声明 edge)
 */

const REPO = {
  owner: 'nothingtosayyy',
  repo: 'Mulberry-SKILL',
  branch: 'main',
}
const RAW_BASE = `https://raw.githubusercontent.com/${REPO.owner}/${REPO.repo}/${REPO.branch}`

// runtime 显式声明:使用 Edge Runtime(更快、全球分布)
// 导出 config 让 Vercel 识别
export const config = {
  runtime: 'edge',
}

function fileToContentType(path) {
  if (path.endsWith('.md')) return 'text/markdown; charset=utf-8'
  if (path.endsWith('.json')) return 'application/json; charset=utf-8'
  if (path.endsWith('.svg')) return 'image/svg+xml'
  if (path.endsWith('.png')) return 'image/png'
  if (path.endsWith('.jpg') || path.endsWith('.jpeg')) return 'image/jpeg'
  if (path.endsWith('.webp')) return 'image/webp'
  return 'text/plain; charset=utf-8'
}

export default async function handler(request) {
  const url = new URL(request.url)
  // /api/raw/auto/bmw-m/README.md  →  auto/bmw-m/README.md
  const rawPath = url.pathname.replace(/^\/api\/raw\//, '')

  // 安全:不允许路径穿越
  if (!rawPath || rawPath.includes('..') || rawPath.startsWith('/')) {
    return new Response('Bad path', { status: 400 })
  }

  const targetUrl = `${RAW_BASE}/${rawPath}`

  const headers = { 'User-Agent': 'mulberry-site/1.0' }
  if (process.env.GH_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GH_TOKEN}`
  }

  let upstream
  try {
    upstream = await fetch(targetUrl, { headers })
  } catch (e) {
    return new Response(`Upstream fetch failed: ${e.message}`, { status: 502 })
  }

  if (!upstream.ok) {
    return new Response(
      `Upstream ${upstream.status} for ${rawPath}`,
      { status: upstream.status }
    )
  }

  const body = await upstream.text()
  const contentType = fileToContentType(rawPath)

  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      // 边缘缓存 5 分钟,后台异步重验证 24 小时
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=86400',
      'Access-Control-Allow-Origin': '*',
      'X-Proxy-Source': 'vercel-edge',
    },
  })
}
