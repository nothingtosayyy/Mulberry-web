/**
 * 文章详情页(/word/:slug)
 *
 * 风格参考 getdesign.md 的 Blog Detail:
 *   - 面包屑:Home / 文章 / 标题
 *   - 大标题
 *   - 副标题(摘要)
 *   - 元信息行(作者 · 日期 · 阅读时长)
 *   - 主体:左 2/3 正文(800px)+ 右 1/3 "目录" 锚点列表
 *
 * 适配化调整:
 *   - 用现有 detail.css 的 module / md-body 模式(800px 正文,token 化样式)
 *   - 标签色用 Mulberry 紫(--accent-light / --accent-bg)
 *   - 阅读时长用构建时估算的数据(articles.json 已有)
 *   - 锚点数据来自 articles.json.toc(构建时从 h2/h3 提取,marked 默认 slugger)
 */

import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useArticleDetail, useArticleIndex } from '../hooks/useArticles.js'
import { ChevronLeftIcon } from '../components/Icon.jsx'
import MarkdownBody from '../components/MarkdownBody.jsx'
import SEO from '../components/SEO.jsx'
import ShareButton from '../components/ShareButton.jsx'
import NotFound from './NotFound.jsx'
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
    // 路由匹配但文章不存在 → 走统一 404 + 推荐
    return <NotFound />
  }

  return (
    <main className="word-detail-page" data-component="word-detail">
      <SEO
        title={article?.title || '文章'}
        description={article?.desc || '随笔与想法'}
        type="article"
        url={article ? `https://mulberrytian.vercel.app/word/${article.slug}` : undefined}
        publishedAt={article?.date ? `${article.date}T00:00:00+08:00` : undefined}
      />
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

  // 阅读数:三态 loading / ready / hidden(拉失败 或 KV 未配置)
  // 同会话只 +1,避免刷新暴增
  const [views, setViews] = useState(null)
  // null = 还在加载,'hidden' = 静默隐藏(失败 / 未配置),数字 = 就绪
  const [viewStatus, setViewStatus] = useState(null)
  const countedRef = useRef(false)

  useEffect(() => {
    if (countedRef.current) return
    const key = `mulberry:viewed:${article.slug}`
    const isCounted = sessionStorage.getItem(key) === '1'
    const settle = (j) => {
      if (j && typeof j.views === 'number') {
        setViews(j.views)
        setViewStatus('ready')
      } else {
        setViewStatus('hidden')
      }
    }
    if (isCounted) {
      // 本会话已计过,只读不增
      fetch(`/api/views/${encodeURIComponent(article.slug)}`)
        .then((r) => (r.ok ? r.json() : null))
        .then(settle)
        .catch(() => setViewStatus('hidden'))
      return
    }
    countedRef.current = true
    sessionStorage.setItem(key, '1')
    fetch(`/api/views/${encodeURIComponent(article.slug)}`, { method: 'POST' })
      .then((r) => (r.ok ? r.json() : null))
      .then(settle)
      .catch(() => setViewStatus('hidden'))
  }, [article.slug])

  return (
    <div className="word-detail-grid">
      {/* 主体 */}
      <article className="word-detail-main">
        {/* 面包屑 */}
        <nav className="word-detail-breadcrumb" aria-label="breadcrumb">
          <Link to="/" className="word-breadcrumb-link">首页</Link>
          <span className="word-breadcrumb-sep">/</span>
          <Link to="/words" className="word-breadcrumb-link">文章</Link>
          <span className="word-breadcrumb-sep">/</span>
          <span className="word-breadcrumb-current">{article.title}</span>
        </nav>

        {/* 标题区 */}
        <header className="word-detail-header">
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
          {(article.readingTime || article.date) && viewStatus === 'ready' && (
            <span className="word-detail-meta-sep">·</span>
          )}
          {viewStatus === 'ready' && (
            <span className="word-detail-views">{views.toLocaleString()} 次阅读</span>
          )}
          {(article.readingTime || article.date) && viewStatus === null && (
            <span className="word-detail-meta-sep">·</span>
          )}
          {viewStatus === null && (
            <span className="word-detail-views word-detail-views--loading" aria-label="阅读数加载中">
              <span className="word-detail-views-skel" />
            </span>
          )}
          <span className="word-detail-meta-spacer" />
          <ShareButton />
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
            <MarkdownBody html={data.html} className="md-body" />
          )}
        </div>
      </article>

      {/* 右侧 目录 */}
      <aside className="word-detail-toc" aria-label="目录">
        <div className="word-toc-label">目录</div>
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
