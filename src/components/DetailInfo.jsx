import { useToast } from '../context/ToastContext.jsx'
import { copyToClipboard } from '../utils/clipboard.js'
import { CalendarIcon, FolderIcon, ChevronLeftIcon, CopyIcon } from './Icon.jsx'
import '../styles/detail.css'

/**
 * 详情页 Info 模块
 * - 数据源:Skill(列表索引里的元数据)+ meta(README frontmatter) + body(README 正文)
 * - 字段映射:
 *     标题: meta.name
 *     副标题: meta.desc
 *     日期: meta.date
 *     分类: skill.catLabel
 *     描述: body(README 主体)
 *     使用方式: "复制 raw URL"(指向 GitHub DESIGN.md 原始链接)
 */
export default function DetailInfo({
  loading,
  error,
  skill,
  meta,
  body,
  designRaw,
  onBack,
}) {
  const { showToast } = useToast()

  if (error) {
    return (
      <section className="module module--info" data-component="info">
        <div className="breadcrumb">
          <button className="breadcrumb-link" type="button" onClick={onBack}>
            <ChevronLeftIcon size={14} />
            返回收藏集
          </button>
        </div>
        <p className="info-desc" style={{ color: 'var(--fg-dim)' }}>
          加载失败:{String(error.message || error)}
        </p>
      </section>
    )
  }

  const name = meta.name || skill?.name || ''
  const desc = meta.desc || skill?.desc || ''
  const date = meta.date || skill?.date || ''
  const catLabel = skill?.catLabel || ''
  const source = meta.source || skill?.source || ''

  // GitHub raw URL:指向 DESIGN.md
  const rawUrl = skill
    ? `https://raw.githubusercontent.com/nothingtosayyy/Mulberry-SKILL/main/${skill.designPath}`
    : ''
  const githubUrl = skill
    ? `https://github.com/nothingtosayyy/Mulberry-SKILL/tree/main/${skill.cat}/${skill.slug}`
    : ''

  const handleCopy = async (text, msg) => {
    const ok = await copyToClipboard(text)
    showToast(ok ? msg : '复制失败')
  }

  return (
    <section className="module module--info" data-component="info">
      {/* 返回面包屑 */}
      <div className="breadcrumb">
        <button className="breadcrumb-link" type="button" onClick={onBack}>
          <ChevronLeftIcon size={14} />
          返回收藏集
        </button>
      </div>

      {/* 标题与副标题 */}
      <header className="info-header">
        <h1 className="info-title">{loading ? '加载中…' : `Skill: ${name}`}</h1>
        {!loading && <p className="info-subtitle">{desc}</p>}
      </header>

      {/* 元信息行 */}
      {!loading && (
        <div className="info-meta">
          {date && (
            <>
              <div className="info-meta-item">
                <CalendarIcon size={14} />
                收录于 {date}
              </div>
              <span className="info-meta-sep">·</span>
            </>
          )}
          {catLabel && (
            <div className="info-meta-item">
              <FolderIcon size={14} />
              {catLabel}
            </div>
          )}
        </div>
      )}

      {/* 描述 */}
      {!loading && body && (
        <div className="info-desc">
          {body.split(/\n{2,}/).map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      )}

      {/* 使用方式 */}
      {!loading && (
        <div className="info-usage">
          <div className="usage-label">使用方式</div>
          <div className="code-block">
            <code>{rawUrl}</code>
            <button
              className="code-copy"
              type="button"
              onClick={() => handleCopy(rawUrl, '已复制 DESIGN.md 链接')}
              title="复制 DESIGN.md 链接"
              aria-label="复制 DESIGN.md 链接"
            >
              <CopyIcon size={16} />
            </button>
          </div>
          <p className="usage-hint">
            复制此链接,让 AI 助手拉取 DESIGN.md 并按规范生成 UI;
            {source && (
              <>
                {' '}原始网站:
                <a
                  href={source}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--accent-light)', marginLeft: 4 }}
                >
                  {source}
                </a>
              </>
            )}
            {' · '}
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--accent-light)' }}
            >
              在 GitHub 查看
            </a>
          </p>
        </div>
      )}
    </section>
  )
}
