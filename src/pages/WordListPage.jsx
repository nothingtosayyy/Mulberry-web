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
import { RssIcon } from '../components/Icon.jsx'
import { useI18n } from '../i18n/index.jsx'
import '../styles/word.css'

export default function WordListPage() {
  const { t, lang } = useI18n()
  const { loading, error, data } = useArticleIndex()

  // 日期 locale 跟系统语言走(语言切换时即时刷新)
  const dateLocale = lang === 'en-US' ? 'en-US' : 'zh-CN'

  return (
    <main className="word-list-page" data-component="word-list">
      <SEO
        title={t('wordList.title')}
        description={t('wordList.sub')}
        url="https://mulberrytian.vercel.app/words"
      />
      {/* 顶部介绍 */}
      <header className="word-list-hero">
        <h1 className="word-list-title">{t('wordList.title')}</h1>
        <p className="word-list-sub">{t('wordList.sub')}</p>
      </header>

      {/* Latest Posts */}
      <section className="word-list-section">
        <div className="word-list-section-head">
          <h2 className="word-list-section-title">Posts</h2>
          <span className="word-list-section-count">
            {data ? t('wordList.count', data.articles.length) : '…'}
          </span>
        </div>

        <div className="word-list-body">
          {loading && (
            <div className="word-list-empty">{t('wordList.loading')}</div>
          )}
          {error && !loading && (
            <div className="word-list-empty">
              {t('wordList.errorPrefix')}{String(error.message || error)}
            </div>
          )}
          {!loading && !error && data?.articles.length === 0 && (
            <div className="word-list-empty">
              {t('wordList.empty', 'Mulberry-word')}
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
                          ? new Date(a.date).toLocaleDateString(dateLocale, {
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

      {/* RSS 订阅入口 */}
      <section className="word-list-rss" aria-label={t('wordList.rssTitle')}>
        <div className="word-list-rss-icon" aria-hidden="true">
          <RssIcon size={20} />
        </div>
        <div className="word-list-rss-body">
          <div className="word-list-rss-title">{t('wordList.rssTitle')}</div>
          {(() => {
            const rss = t('wordList.rssDesc', (
              <a
                href="/rss.xml"
                target="_blank"
                rel="noopener noreferrer"
                className="word-list-rss-link"
              >
                /rss.xml
              </a>
            ))
            // rssDesc 返回 { text, link, suffix } 结构
            return (
              <p className="word-list-rss-desc">
                {rss.text}{rss.link}{rss.suffix}
              </p>
            )
          })()}
        </div>
      </section>
    </main>
  )
}
