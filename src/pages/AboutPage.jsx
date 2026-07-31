import { useEffect, useRef, useState } from 'react'
import Dither from '../components/Dither.jsx'
import { useDitherAnimationProps } from '../config/animation.js'
import '../styles/about.css'

// 站点上线日期（取自 更新记录.md v0.1.0 + Mulberry-web 仓库 initial commit 0d356b2）
const SITE_LAUNCH_DATE = '2026-07-29'

function daysSinceLaunch() {
  const start = new Date(SITE_LAUNCH_DATE).getTime()
  const now = Date.now()
  const days = Math.floor((now - start) / 86400000)
  return Math.max(1, days)
}

// 连续点击 3 次的时间窗(毫秒)
const TRIPLE_CLICK_WINDOW_MS = 700

/**
 * 关于页 — 单屏布局
 * - 左侧(50%):Dither WebGL 动画(Mulberry 紫,带鼠标互动)
 * - 中间:1px 垂直分割线
 * - 右侧(50%):站点介绍 + 作者介绍
 *
 * 隐藏彩蛋:作者"桑葚"可被连续点击 3 次,触发全量站点统计弹窗
 * (不蒜子 PV / UV + 当前页 PV + 运营天数)
 */
export default function AboutPage() {
  const ditherProps = useDitherAnimationProps()

  // 运营天数:仅依赖本地日期差
  const [days, setDays] = useState(1)
  useEffect(() => {
    setDays(daysSinceLaunch())
  }, [])

  // 动态注入不蒜子 script(全量指标 PV / UV / page_pv)
  useEffect(() => {
    if (document.getElementById('busuanzi-script')) return
    const s = document.createElement('script')
    s.id = 'busuanzi-script'
    s.async = true
    s.src = 'https://busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js'
    document.body.appendChild(s)
  }, [])

  // 彩蛋:连点 3 次作者名 → 弹窗
  const [statsOpen, setStatsOpen] = useState(false)
  const clickCountRef = useRef(0)
  const clickTimerRef = useRef(null)

  const handleAuthorClick = () => {
    clickCountRef.current += 1
    if (clickTimerRef.current) clearTimeout(clickTimerRef.current)
    clickTimerRef.current = setTimeout(() => {
      clickCountRef.current = 0
    }, TRIPLE_CLICK_WINDOW_MS)
    if (clickCountRef.current >= 3) {
      clickCountRef.current = 0
      if (clickTimerRef.current) clearTimeout(clickTimerRef.current)
      setStatsOpen(true)
    }
  }

  // ESC 关闭弹窗
  useEffect(() => {
    if (!statsOpen) return
    const onKey = (e) => {
      if (e.key === 'Escape') setStatsOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [statsOpen])

  return (
    <main className="about-page">
      {/* 左:Dither 动画 */}
      <section className="about-art" aria-hidden="true">
        <Dither {...ditherProps} />
      </section>

      {/* 中:分割线 */}
      <div className="about-divider" aria-hidden="true" />

      {/* 右:站点介绍 + 作者介绍 */}
      <section className="about-content">
        <div className="about-inner">
          {/* ── 站点 ── */}
          <header className="about-header">
            <h1 className="about-title">桑葚集</h1>
            <p className="about-subtitle">收藏"能用、好用"的内容</p>
          </header>

          <section className="about-section">
            <h2 className="about-h2">关于站点</h2>
            <p className="about-p">
              收藏工作与学习里真正用过、觉得值得留下来的内容
            </p>
            <p className="about-p">
              数据完全公开在 GitHub 仓库,欢迎 fork,也可以直接 clone 到本地当个人收藏夹用。
            </p>
          </section>

          <div className="about-divider-h" aria-hidden="true" />

          {/* ── 作者(连续点击 3 次触发统计弹窗) ── */}
          <section className="about-section">
            <h2 className="about-h2">关于作者</h2>
            <p className="about-p">
              <button
                type="button"
                className="about-author-name"
                onClick={handleAuthorClick}
                aria-label="桑葚(连续点击 3 次查看站点统计)"
                title="桑葚"
              >
                桑葚
              </button>
            </p>
          </section>

          <footer className="about-footer">
            <a className="about-link" href="https://github.com/nothingtosayyy" target="_blank" rel="noopener noreferrer">
              GitHub ↗
            </a>
            <span className="about-footer-sep">·</span>
            <a className="about-link" href="mailto:tiange1@agent.qq.com">
              联系我 ↗
            </a>
          </footer>
        </div>
      </section>

      {/* ── 彩蛋:全量统计弹窗 ── */}
      {statsOpen && (
        <div
          className="about-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="站点访问统计"
          onClick={() => setStatsOpen(false)}
        >
          <div
            className="about-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="about-modal-title">站点访问统计</h3>
            <ul className="about-modal-list">
              <li className="about-modal-item">
                <span>站点 PV</span>
                <strong><span id="busuanzi_value_site_pv">…</span></strong>
              </li>
              <li className="about-modal-item">
                <span>站点 UV</span>
                <strong><span id="busuanzi_value_site_uv">…</span></strong>
              </li>
              <li className="about-modal-item">
                <span>本页 PV</span>
                <strong><span id="busuanzi_value_page_pv">…</span></strong>
              </li>
              <li className="about-modal-item about-modal-item--local">
                <span>已运营</span>
                <strong>{days} 天</strong>
              </li>
            </ul>
            <button
              type="button"
              className="about-modal-close"
              onClick={() => setStatsOpen(false)}
            >
              关闭
            </button>
          </div>
        </div>
      )}
    </main>
  )
}
