import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Vite 配置
 * - /api/raw/<path>:dev middleware 代理 raw.githubusercontent.com(让本地与生产同接口)
 * - 生产时由 Vercel Edge Function(api/raw/[...path].js)接管
 */

const REPO = {
  owner: 'nothingtosayyy',
  repo: 'Mulberry-SKILL',
  branch: 'main',
}
const RAW_BASE = `https://raw.githubusercontent.com/${REPO.owner}/${REPO.repo}/${REPO.branch}`

function fileToContentType(path) {
  if (path.endsWith('.md')) return 'text/markdown; charset=utf-8'
  if (path.endsWith('.json')) return 'application/json; charset=utf-8'
  if (path.endsWith('.svg')) return 'image/svg+xml'
  if (path.endsWith('.png')) return 'image/png'
  if (path.endsWith('.jpg') || path.endsWith('.jpeg')) return 'image/jpeg'
  if (path.endsWith('.webp')) return 'image/webp'
  return 'text/plain; charset=utf-8'
}

// Vite dev server middleware:把 /api/raw/* 代理到 raw.githubusercontent.com
function rawProxyPlugin() {
  return {
    name: 'mulberry-raw-proxy',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url || !req.url.startsWith('/api/raw/')) return next()
        const rawPath = req.url.slice('/api/raw/'.length).split('?')[0]
        if (!rawPath || rawPath.includes('..')) {
          res.statusCode = 400
          res.end('Bad path')
          return
        }
        const targetUrl = `${RAW_BASE}/${rawPath}`
        try {
          const headers = { 'User-Agent': 'mulberry-dev/1.0' }
          if (process.env.GH_TOKEN) headers.Authorization = `Bearer ${process.env.GH_TOKEN}`
          const upstream = await fetch(targetUrl, { headers })
          if (!upstream.ok) {
            res.statusCode = upstream.status
            res.end(`Upstream ${upstream.status} for ${rawPath}`)
            return
          }
          const body = await upstream.text()
          res.statusCode = 200
          res.setHeader('Content-Type', fileToContentType(rawPath))
          res.setHeader('Cache-Control', 'no-cache')
          res.setHeader('X-Proxy-Source', 'vite-dev-middleware')
          res.end(body)
        } catch (e) {
          res.statusCode = 502
          res.end(`Proxy error: ${e.message}`)
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), rawProxyPlugin()],
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: false,
  },
})
