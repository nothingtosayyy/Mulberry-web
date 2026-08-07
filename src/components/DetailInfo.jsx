import { useToast } from '../context/ToastContext.jsx'
import { copyToClipboard } from '../utils/clipboard.js'
import { CalendarIcon, FolderIcon, ChevronLeftIcon, CopyIcon } from './Icon.jsx'
import ShareButton from './ShareButton.jsx'
import { useI18n } from '../i18n/index.jsx'
import '../styles/detail.css'

/**
 * 详情页 Info 模块
 * - 数据源:
 *     README.md(中文信息卡): title / lead / paragraphs
 *     SKILL.md frontmatter(原始): desc / date / source
 *     列表索引: catLabel / color / logo
 * - 字段优先级:
 *     标题: readme.title(中文) > meta.name
 *     副标题: readme.lead > meta.desc
 *     info-desc: readme.paragraphs > SKILL.md body 段落
 *     使用方式: 复制 raw URL(指向 GitHub SKILL.md)
 * - UI 文本走 i18n,内容(标题/正文/分类)保持原语言
 */
export default function DetailInfo({
  loading,
  error,
  skill,
  meta,
  readme,
  onBack,
}) {
  const { t } = useI18n()
  const { showToast } = useToast()

  if (error) {
    return (
      <section className="module module--info" data-component="info">
        <div className="breadcrumb">
          <button className="breadcrumb-link" type="button" onClick={onBack}>
            <ChevronLeftIcon size={14} />
            {t('detailInfo.backToList')}
          </button>
        </div>
        <p className="info-desc" style={{ color: 'var(--fg-dim)' }}>
          {t('detailInfo.errorPrefix')}{String(error.message || error)}
        </p>
      </section>
    )
  }

  const name = readme?.title || meta.name || skill?.name || ''
  const lead = readme?.lead || meta.desc || skill?.desc || ''
  const paragraphs =
    (readme?.paragraphs && readme.paragraphs.length > 0)
      ? readme.paragraphs
      : (skill?.desc ? [skill.desc] : [])
  const date = meta.date || skill?.date || ''
  const catLabel = skill?.catLabel || ''
  const source = meta.source || skill?.source || ''

  // GitHub raw URL:指向 SKILL.md
  const rawUrl = skill
    ? `https://raw.githubusercontent.com/nothingtosayyy/Mulberry-SKILL/main/${skill.skillPath}`
    : ''
  const githubUrl = skill
    ? `https://github.com/nothingtosayyy/Mulberry-SKILL/tree/main/${skill.cat}/${skill.slug}`
    : ''

  const handleCopy = async (text, msg) => {
    const ok = await copyToClipboard(text)
    showToast(ok ? msg : t('common.copyFailed'))
  }

  // usageHint 返回结构:{ prefix, source, github }
  const usageHint = t('detailInfo.usageHint', source, githubUrl)

  return (
    <section className="module module--info" data-component="info">
      {/* 返回面包屑 */}
      <div className="breadcrumb">
        <button className="breadcrumb-link" type="button" onClick={onBack}>
          <ChevronLeftIcon size={14} />
          {t('detailInfo.backToList')}
        </button>
      </div>

      {/* 标题与副标题 */}
      <header className="info-header">
        <h1 className="info-title">{loading ? t('detailInfo.loading') : name}</h1>
        {!loading && lead && <p className="info-subtitle">{lead}</p>}
      </header>

      {/* 元信息行 */}
      {!loading && (
        <div className="info-meta">
          {date && (
            <>
              <div className="info-meta-item">
                <CalendarIcon size={14} />
                {t('detailInfo.includedOn', date)}
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
          <span className="info-meta-spacer" />
          <ShareButton />
        </div>
      )}

      {/* 描述 */}
      {!loading && paragraphs.length > 0 && (
        <div className="info-desc">
          {paragraphs.map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      )}

      {/* 使用方式 */}
      {!loading && (
        <div className="info-usage">
          <div className="usage-label">{t('detailInfo.usage')}</div>
          <div className="code-block">
            <code>{rawUrl}</code>
            <button
              className="code-copy"
              type="button"
              onClick={() => handleCopy(rawUrl, t('detailInfo.copyRawHint'))}
              title={t('detailInfo.copyRawTitle')}
              aria-label={t('detailInfo.copyRawTitle')}
            >
              <CopyIcon size={16} />
            </button>
          </div>
          <p className="usage-hint">
            {usageHint.prefix}
            {source && (
              <>
                {' '}
                {t('detailInfo.sourceLabel')}
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
              {t('detailInfo.viewOnGithub')}
            </a>
          </p>
        </div>
      )}
    </section>
  )
}
