/**
 * 打包工作区源码为 Vercel 部署用的 files 列表(JSON 输出到 stdout)
 * 用法: node scripts/prepare-deploy.mjs > /tmp/files.json
 *
 * 包含:
 *   - 全部 src/、api/、public/、scripts/ 源码
 *   - 关键配置文件:package.json、package-lock.json、vite.config.js、vercel.json、index.html
 *   - data-repo/(去掉 .git)— 让 Vercel 构建时无需访问 GitHub API
 *
 * 排除:
 *   - node_modules、dist、.git、.vite、.trash
 *   - 原型 HTML(detail.html、index-copy-3.html)
 *   - 顶层 assets/、uploads/、outputs/、styles/(旧项目残留)
 *   - canvas 元数据(.canvas-meta.json 等)
 *   - 本地工具(serve.mjs)
 *   - 测试产物(verify-*.png、build.log、serve.log)
 */

import { readFile, readdir, writeFile } from 'node:fs/promises'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

const EXCLUDE_DIRS = new Set([
  'node_modules',
  'dist',
  '.git',
  '.vite',
  '.trash',
  'uploads',
  'outputs',
  'assets',
  // 顶层 styles/ 是旧原型的,新版在 src/styles/
  'styles',
  // data-repo/ 是不需要上传到 Vercel 的(vercel.json 已改为只用 vite build,
  // public/index.json 已预先构建并提交)
  'data-repo',
])

const EXCLUDE_FILES = new Set([
  '.gitignore',
  '.canvas-meta.json',
  '.design.json',
  '.design-state.json',
  'AGENTS.md',
  'detail.html',
  'index-copy-3.html',
  'readme.md',
  'readme_api.json',
  'serve.mjs',
  'package-lock.json', // 用 npm install 重新生成
  'build.log',
  'serve.log',
  'serve.err',
  'deploy-files.json', // 本次部署用的中间产物
])

// 前缀匹配(用于验证截图等)
const EXCLUDE_PREFIXES = ['verify-']

// 把 .git 之类的隐藏目录/文件排除
function isHidden(name) {
  return name.startsWith('.') && name !== '.vercel'
}

// 文本/二进制判定
const TEXT_EXTS = new Set([
  '.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs',
  '.json', '.md', '.css', '.html', '.htm', '.svg', '.txt',
  '.yml', '.yaml', '.toml', '.env',
])

function isText(name) {
  const i = name.lastIndexOf('.')
  if (i < 0) return true
  return TEXT_EXTS.has(name.slice(i).toLowerCase())
}

async function walk(dir, base = dir) {
  const out = []
  let entries
  try {
    entries = await readdir(dir, { withFileTypes: true })
  } catch {
    return out
  }
  for (const ent of entries) {
    if (isHidden(ent.name) && ent.name !== '.vercel') continue
    if (EXCLUDE_DIRS.has(ent.name)) continue
    if (EXCLUDE_FILES.has(ent.name)) continue
    if (EXCLUDE_PREFIXES.some((p) => ent.name.startsWith(p))) continue
    const full = join(dir, ent.name)
    if (ent.isDirectory()) {
      out.push(...(await walk(full, base)))
    } else if (ent.isFile()) {
      out.push(full)
    }
  }
  return out
}

async function main() {
  const all = await walk(ROOT)
  const files = []
  for (const full of all) {
    const rel = relative(ROOT, full).replace(/\\/g, '/')
    // 跳过 data-repo/.git(上面 isHidden 已经跳过)
    // 跳过 package-lock(EXCLUDE_FILES)
    const buf = await readFile(full)
    if (isText(rel)) {
      files.push({ file: rel, data: buf.toString('utf8'), encoding: 'utf-8' })
    } else {
      files.push({ file: rel, data: buf.toString('base64'), encoding: 'base64' })
    }
  }
  const payload = JSON.stringify({ count: files.length, files })
  // 支持 --out FILE 直接写文件（避免 PowerShell 重定向输出 UTF-16 BOM）
  const outIdx = process.argv.indexOf('--out')
  if (outIdx >= 0) {
    const outPath = process.argv[outIdx + 1]
    await writeFile(outPath, payload, 'utf8')
    console.error(`prepare-deploy: wrote ${files.length} files to ${outPath} (${(payload.length / 1024).toFixed(1)} KB)`)
  } else {
    process.stdout.write(payload)
  }
}

main().catch((e) => {
  console.error('prepare-deploy failed:', e.message)
  process.exit(1)
})
