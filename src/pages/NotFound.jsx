/**
 * 404 页 — 找不到的路由
 *
 * 设计:
 *   - 顶部 "404" 大字 + 路径回显 + 返回首页/返回上页两个按钮
 *   - 底部 "也许你想看" — 拉最新 3 个 Skill + 3 篇文章
 *     数据源用 useArticleIndex / useSkillIndex,跟首页共用缓存
 *     如果数据还在 loading,显示骨架;如果出错,降级为只剩按钮
 */
import { useEffect, useMemo } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useArticleIndex } from '../hooks/useArticles.js'
import { useSkillIndex } from '../hooks/useSkillData.js'
import SEO from '../components/SEO.jsx'
import '../styles/notfound.css'

const TOP_N = 3

function getLatestSkills(skills) {
  if (!skills) return []
  return [...skills]
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
    .slice(0, TOP_N)
}

export default function NotFound() {
  const location = useLocation()
  const navigate = useNavigate()
  const { data: articleData } = useArticleIndex()
  const { data: skillData } = useSkillIndex()

  const latestArticles = useMemo(
    () => (articleData?.articles || []).slice(0, TOP_N),
    [articleData]
  )
  const latestSkills = useMemo(
    () => getLatestSkills(skillData?.skills),
    [skillData]
  )

  // 路由变化时自动滚到顶
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' })
  }, [location.pathname])

  return (
    <main className="notfound-page" data-component="notfound">
      <SEO
        title="404 · 找不到"
        description="你访问的页面不存在,这里是一些可能感兴趣的内容。"
        url="https://mulberrytian.vercel.app/404"
      />

      {/* 顶部 404 区 */}
      <section className="notfound-hero">
        <div className="notfound-code" aria-hidden="true">
          404
        </div>
        <h1 className="notfound-title">这里什么都没放</h1>
        <p className="notfound-path">
          <code>{location.pathname}</code>
        </p>
        <p className="notfound-hint">可能是地址写错了,或者页面已经被搬走。</p>
        <div className="notfound-actions">
          <button
            type="button"
            className="notfound-btn notfound-btn--primary"
            onClick={() => navigate(-1)}
          >
            ← 返回上页
          </button>
          <Link to="/" className="notfound-btn notfound-btn--secondary">
            回首页
          </Link>
        </div>
      </section>

      {/* 也许你想看 */}
      <section className="notfound-recommend">
        <h2 className="notfound-recommend-title">也许你想看</h2>

        <div className="notfound-recommend-grid">
          {/* Skills */}
          <div className="notfound-col">
            <div className="notfound-col-head">
              <span className="notfound-col-label">最新 Skill</span>
              <Link to="/" className="notfound-col-more">更多 →</Link>
            </div>
            <ul className="notfound-list">
              {latestSkills.length === 0 ? (
                Array.from({ length: TOP_N }).map((_, i) => (
                  <li key={i} className="notfound-item notfound-item--skel" />
                ))
              ) : (
                latestSkills.map((s) => (
                  <li key={`${s.cat}-${s.slug}`} className="notfound-item">
                    <Link
                      to={`/skill/${s.cat}/${s.slug}`}
                      className="notfound-item-link"
                    >
                      <span className="notfound-item-title">{s.name || s.slug}</span>
                      {s.desc && (
                        <span className="notfound-item-desc">{s.desc}</span>
                      )}
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </div>

          {/* 文章 */}
          <div className="notfound-col">
            <div className="notfound-col-head">
              <span className="notfound-col-label">最新文章</span>
              <Link to="/words" className="notfound-col-more">更多 →</Link>
            </div>
            <ul className="notfound-list">
              {latestArticles.length === 0 ? (
                Array.from({ length: TOP_N }).map((_, i) => (
                  <li key={i} className="notfound-item notfound-item--skel" />
                ))
              ) : (
                latestArticles.map((a) => (
                  <li key={a.slug} className="notfound-item">
                    <Link to={`/word/${a.slug}`} className="notfound-item-link">
                      <span className="notfound-item-title">{a.title}</span>
                      {a.desc && (
                        <span className="notfound-item-desc">{a.desc}</span>
                      )}
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </section>
    </main>
  )
}
