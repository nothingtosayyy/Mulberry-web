/**
 * 文章详情页(/word/:slug)
 *
 * 风格参考 getdesign.md 的 Blog Detail:
 *   - 面包屑:Home / 文章 / 标题
 *   - 大标题
 *   - 副标题(摘要)
 *   - 元信息行(作者 · 日期 · 阅读时长)
 *   - 主体:左 2/3 正文(800px)+ 右 1/3 "ON THIS PAGE" 锚点列表
 *
 * 适配化调整:
 *   - 用现有 detail.css 的 module / md-body 模式(800px 正文,token 化样式)
 *   - 标签色用 Mulberry 紫(--accent-light / --accent-bg)
 *   - 阅读时长用构建时估算的数据(articles.json 已有)
 *   - 锚点数据来自 articles.json.toc(构建时从 h2/h3 提取,marked 默认 slugger)
 */

import { useEffect, useMemo } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useArticleDetail, useArticleIndex } from '../hooks/useArticles.js'
import { ChevronLeftIcon } from '../components/Icon.jsx'
import '../styles/word.css'

export default function WordPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { data: index } = useArticleIndex()

  const article = useMemo(
    () => index?.articles.find((a) => a.slug === slug),
    [index, slug]
  )

  // 路由切换时滚到顶部
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' })
  }, [slug])

  if (index && !article) {
    return (
      <main className="word-detail-page">
        <div className="word-detail-breadcrumb">
          <button
            className="word-breadcrumb-link"
            type="button"
            onClick={() => navigate('/words')}
          >
            <ChevronLeftIcon size={14} />
            返回文章列表
          </button>
        </div>
        <p className="word-detail-empty">未找到该文章,<Link to="/words" className="link-back">返回列表</Link>。</p>
      </main>
    )
  }

  return (
    <main className="word-detail-page" data-component="word-detail">
      {article ? (
        <WordContent article={article} />
      ) : (
        <div className="word-detail-empty" style={{ color: 'var(--fg-dim)' }}>
          正在加载…
        </div>
      )}
    </main>
  )
}

function WordContent({ article }) {
  const { loading, error, data } = useArticleDetail({ path: article.path })

  return (
    <div className="word-detail-grid">
      {/* 主体 */}
      <article className="word-detail-main">
        {/* 面包屑 */}
        <nav className="word-detail-breadcrumb" aria-label="breadcrumb">
          <Link to="/" className="word-breadcrumb-link">Home</Link>
          <span className="word-breadcrumb-sep">/</span>
          <Link to="/words" className="word-breadcrumb-link">文章</Link>
          <span className="word-breadcrumb-sep">/</span>
          <span className="word-breadcrumb-current">{article.title}</span>
        </nav>

        {/* 标题区 */}
        <header className="word-detail-header">
          {article.tag && <span className="word-card-tag word-detail-tag">{article.tag}</span>}
          <h1 className="word-detail-title">{article.title}</h1>
          {article.desc && <p className="word-detail-subtitle">{article.desc}</p>}
        </header>

        {/* 元信息 */}
        <div className="word-detail-meta">
          {article.author && <span>{article.author}</span>}
          {article.author && article.date && <span className="word-detail-meta-sep">·</span>}
          {article.date && <span>{article.date}</span>}
          {(article.author || article.date) && article.readingTime && (
            <span className="word-detail-meta-sep">·</span>
          )}
          {article.readingTime && <span>{article.readingTime} min read</span>}
        </div>

        {/* 正文 */}
        <div className="word-detail-body">
          {loading && (
            <p style={{ color: 'var(--fg-dim)' }}>正在从 GitHub 加载…</p>
          )}
          {error && (
            <p style={{ color: 'var(--fg-dim)' }}>加载失败:{String(error.message || error)}</p>
          )}
          {!loading && !error && data?.html && (
            <div
              className="md-body"
              dangerouslySetInnerHTML={{ __html: data.html }}
            />
          )}
        </div>
      </article>

      {/* 右侧 ON THIS PAGE */}
      <aside className="word-detail-toc" aria-label="on this page">
        <div className="word-toc-label">ON THIS PAGE</div>
        {article.toc && article.toc.length > 0 ? (
          <ul className="word-toc-list">
            {article.toc.map((item, i) => (
              <li
                key={`${item.id}-${i}`}
                className={item.level === 3 ? 'word-toc-item word-toc-item--h3' : 'word-toc-item'}
              >
                <a href={`#${item.id}`}>{item.text}</a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="word-toc-empty">本文章无小节</p>
        )}
      </aside>
    </div>
  )
}
