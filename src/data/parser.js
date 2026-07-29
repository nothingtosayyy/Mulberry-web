/**
 * 文本解析工具
 *
 * 1) parseFrontmatter(md)  → { data: { key: value }, body: string }
 *    极简 YAML 解析:只支持 key: value 与 key: true/false 两种行格式,
 *    满足 README frontmatter 的所有字段需求(无需引入 js-yaml 依赖)。
 *
 * 2) markdownToHtml(md)    → string
 *    走 marked 解析,GFM 开启。
 */

import { marked } from 'marked'

marked.setOptions({
  gfm: true,
  breaks: false,
})

/**
 * 解析 YAML frontmatter
 * @param {string} text 原始 markdown 文本
 * @returns {{ data: Record<string, any>, body: string }}
 */
export function parseFrontmatter(text) {
  if (!text.startsWith('---')) return { data: {}, body: text }

  // 找第二个 ---
  const endIdx = text.indexOf('\n---', 3)
  if (endIdx < 0) return { data: {}, body: text }

  const fmText = text.slice(3, endIdx).replace(/^\n/, '')
  const body = text.slice(endIdx + 4).replace(/^\n/, '')

  const data = {}
  for (const rawLine of fmText.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_-]*)\s*:\s*(.*)$/)
    if (!m) continue
    const [, key, rawValue] = m
    let value = rawValue.trim()

    // 去掉包裹引号
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    // 布尔
    if (value === 'true') value = true
    else if (value === 'false') value = false
    // 数字
    else if (/^-?\d+(\.\d+)?$/.test(value)) value = Number(value)
    // 数组暂不处理(本项目 frontmatter 不需要)

    data[key] = value
  }
  return { data, body }
}

/**
 * 将 markdown 文本转为 HTML
 * @param {string} md
 * @returns {string}
 */
export function markdownToHtml(md) {
  if (!md) return ''
  // marked v18: parse 是同步的(默认 lexer/parser 同步)
  return marked.parse(md)
}
