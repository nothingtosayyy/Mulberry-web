import { FileIcon } from './Icon.jsx'
import { markdownToHtml } from '../data/parser.js'
import MarkdownBody from './MarkdownBody.jsx'
import '../styles/detail.css'

/**
 * 详情页下半部:Markdown 预览
 * - 顶部展示文件名(默认 SKILL.md)
 * - 主体使用 marked 将 body 解析为 HTML
 * - HTML 渲染至 .md-body,沿用原型中的全部样式(token、表、列表、代码等)
 */
export default function MarkdownPreview({
  loading,
  error,
  filename = 'SKILL.md',
  body = '',
}) {
  const html = body ? markdownToHtml(body) : ''

  return (
    <section className="module module--preview" data-component="preview">
      <div className="md-header">
        <div className="md-filename">
          <FileIcon size={16} />
          {filename}
        </div>
      </div>

      <div className="md-content">
        <div className="md-body">
          {loading && (
            <p style={{ color: 'var(--fg-dim)' }}>正在从 GitHub 加载…</p>
          )}
          {error && (
            <p style={{ color: 'var(--fg-dim)' }}>加载失败:{String(error.message || error)}</p>
          )}
          {!loading && !error && (
            // marked 生成的 HTML,内容来自你本人维护的 GitHub 仓库,可信
            <MarkdownBody html={html} className="md-body" />
          )}
        </div>
      </div>
    </section>
  )
}
