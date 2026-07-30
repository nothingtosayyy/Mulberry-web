/**
 * GitHub 仓库作为数据源
 *
 * 约定(v0.1.4+):
 *   - 仓库: nothingtosayyy/Mulberry-SKILL
 *   - 顶级目录 = 分类(从 categories.json 查 label)
 *   - <cat>/<slug>/SKILL.md = 单文件(frontmatter 存元数据 + body 存完整说明)
 *   - 兼容老规约: 若有 README.md(无 DESIGN.md 也算)也认
 *
 * 所有读操作通过 raw.githubusercontent.com 拉,免认证。
 * 写操作不在公开站范围内(用户在 GitHub 直接改)。
 */

const REPO = {
  owner: 'nothingtosayyy',
  repo: 'Mulberry-SKILL',
  branch: 'main',
}

const RAW_BASE = `https://raw.githubusercontent.com/${REPO.owner}/${REPO.repo}/${REPO.branch}`
const API_BASE = `https://api.github.com/repos/${REPO.owner}/${REPO.repo}`

/**
 * 拉取仓库文件树,聚合为分类 + Skill 列表的骨架
 * 注:这一步只拿到文件名/sha,还需要第二步拉每个 README 的 frontmatter
 */
export async function fetchRepoTree() {
  const url = `${API_BASE}/git/trees/${REPO.branch}?recursive=1`
  const res = await fetch(url, {
    headers: { Accept: 'application/vnd.github+json' },
  })
  if (!res.ok) {
    throw new Error(`GitHub tree API failed: ${res.status} ${res.statusText}`)
  }
  const json = await res.json()
  return json.tree || []
}

/**
 * 拉取 categories.json(分类 label 映射)
 */
export async function fetchCategories() {
  const url = `${RAW_BASE}/categories.json`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`categories.json not found: ${res.status}`)
  return res.json()
}

/**
 * 拉取单个文件内容(原文)
 */
export async function fetchRaw(path) {
  const url = `${RAW_BASE}/${path}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch ${path}: ${res.status}`)
  return res.text()
}

/**
 * 从仓库树构建 Skill 骨架
 * - 排除 _template 等非 Skill 目录
 * - 优先匹配 SKILL.md,兼容 README.md
 * - 输入:fetchRepoTree() 的 tree 数组
 * - 输出:Array<{ cat, slug, skillPath }>
 */
export function buildSkillIndex(tree) {
  // 收集所有目录的子文件,便于判断每个 Skill 用的是哪个文件
  const byDir = new Map() // dir path -> Set(file)
  for (const node of tree) {
    if (node.type !== 'blob') continue
    const idx = node.path.lastIndexOf('/')
    if (idx < 0) continue
    const dir = node.path.slice(0, idx)
    if (!byDir.has(dir)) byDir.set(dir, new Set())
    byDir.get(dir).add(node.path.slice(idx + 1))
  }

  const skills = []
  // 约定:二级目录(只有一层) = Skill 目录
  for (const [dir, files] of byDir) {
    const parts = dir.split('/')
    if (parts.length !== 2) continue
    const [cat, slug] = parts
    // 排除约定目录
    if (cat.startsWith('_') || cat === '.github') continue
    if (slug.startsWith('_')) continue
    // 优先 SKILL.md,兼容 README.md
    const file = files.has('SKILL.md') ? 'SKILL.md' : files.has('README.md') ? 'README.md' : null
    if (!file) continue

    skills.push({
      cat,
      slug,
      skillPath: `${dir}/${file}`,
    })
  }
  return skills
}

/** 仓库元信息(供调试) */
export const REPO_META = REPO
