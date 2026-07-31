/**
 * 文章列表页(/words)
 * 风格适配自 getdesign.md 的 Blog 页:
 *   - 顶部大标题 + 副标题
 *   - "Latest Posts" 区域
 *   - 卡片行:左侧序号 + 中部 TAG/标题/摘要 + 右部日期 + 箭头
 * 适配化调整:
 *   - 不用 getdesign 粉色调,改用 Mulberry 紫
 *   - 用现有 FindSkills 表格的 border 风格 + hover 背景
 *   - 卡片左加序号(01、02…) — 跟 getdesign 一致
 */

import { Link } from 'react-router-dom'
import { useArticleIndex } from '../hooks/useArticles.js'
import SEO from '../components/SEO.jsx'
import '../styles/word.css'

export default function WordListPage() {
  const { loading, error, data } = useArticleIndex()

  return (
    <main className="word-list-page" data-component="word-list">
      <SEO
        title="随笔与想法"
        description="关于产品、设计、AI 的随笔 — 收录在 GitHub 仓库,数据公开。"
        url="https://mulberrytian.vercel.app/words"
      />
      {/* 顶部介绍 */}
      <header className="word-list-hero">
        <h1 className="word-list-title">随笔与想法</h1>
        <p className="word-list-sub">
          随笔与想法
        </p>
      </header>

      {/* Latest Posts */}
      <section className="word-list-section">
        <div className="word-list-section-head">
          <h2 className="word-list-section-title">Posts</h2>
          <span className="word-list-section-count">
            {data ? `${data.articles.length} 篇` : '…'}
          </span>
        </div>

        <div className="word-list-body">
          {loading && (
            <div className="word-list-empty">正在从 GitHub 加载…</div>
          )}
          {error && !loading && (
            <div className="word-list-empty">加载失败:{String(error.message || error)}</div>
          )}
          {!loading && !error && data?.articles.length === 0 && (
            <div className="word-list-empty">
              暂无文章。在 <code>Mulberry-word</code> 仓库添加 <code>&lt;cat&gt;/&lt;slug&gt;/README.md</code> 即可出现在此。
            </div>
          )}
          {!loading && !error && data && data.articles.length > 0 && (
            <ul className="word-cards">
              {data.articles.map((a, i) => (
                <li key={a.slug} className="word-card">
                  <Link
                    to={`/word/${a.slug}`}
                    className="word-card-link"
                    aria-label={a.title}
                  >
                    <span className="word-card-num">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="word-card-main">
                      <span className="word-card-title">{a.title}</span>
                      {a.desc && (
                        <span className="word-card-desc">{a.desc}</span>
                      )}
                    </span>
                    <span className="word-card-meta">
                      <span className="word-card-date">
                        {a.date
                          ? new Date(a.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: '2-digit',
                              year: 'numeric',
                            })
                          : ''}
                      </span>
                      <span className="word-card-arrow" aria-hidden="true">→</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  )
}
