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

// 统计项渲染:
// - 'loading' → skeleton 脉动占位
// - 数字      → toLocaleString()
// - 'error'   → 显式提示,不静默
function renderStat(value) {
  if (value === 'loading') {
    return <span className="about-stat-skel" aria-label="加载中" />
  }
  if (value === 'error') {
    return <span className="about-stat-error">!</span>
  }
  return value.toLocaleString()
}

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

  // 8 项统计指标(全部接入,不留 TODO):
  //   site:今日 PV / 今日 UV / 本站 PV / 本站 UV
  //   page:今日本页 PV / 今日本页 UV / 本页 PV / 本页 UV
  // 状态: 'loading' → 数字 → 'error'
  // 来自两个 endpoint: /api/stats/site (site) + /api/views/about (page)
  const [sitePv, setSitePv] = useState('loading')
  const [siteUv, setSiteUv] = useState('loading')
  const [todayPv, setTodayPv] = useState('loading')
  const [todayUv, setTodayUv] = useState('loading')
  const [pagePv, setPagePv] = useState('loading')
  const [pageUv, setPageUv] = useState('loading')
  const [todayPagePv, setTodayPagePv] = useState('loading')
  const [todayPageUv, setTodayPageUv] = useState('loading')

  // mount:两个 endpoint 各 POST 一次,带回全部 8 项指标
  useEffect(() => {
    fetch('/api/stats/site', { method: 'POST' })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (j && j.configured) {
          setSitePv(typeof j.sitePv === 'number' ? j.sitePv : 'error')
          setSiteUv(typeof j.siteUv === 'number' ? j.siteUv : 'error')
          setTodayPv(typeof j.todayPv === 'number' ? j.todayPv : 'error')
          setTodayUv(typeof j.todayUv === 'number' ? j.todayUv : 'error')
        } else {
          setSitePv('error'); setSiteUv('error'); setTodayPv('error'); setTodayUv('error')
        }
      })
      .catch(() => { setSitePv('error'); setSiteUv('error'); setTodayPv('error'); setTodayUv('error') })

    fetch('/api/views/about', { method: 'POST' })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (j && j.configured) {
          setPagePv(typeof j.views === 'number' ? j.views : 'error')
          setPageUv(typeof j.uv === 'number' ? j.uv : 'error')
          setTodayPagePv(typeof j.todayViews === 'number' ? j.todayViews : 'error')
          setTodayPageUv(typeof j.todayUv === 'number' ? j.todayUv : 'error')
        } else {
          setPagePv('error'); setPageUv('error'); setTodayPagePv('error'); setTodayPageUv('error')
        }
      })
      .catch(() => { setPagePv('error'); setPageUv('error'); setTodayPagePv('error'); setTodayPageUv('error') })
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

  // 弹窗打开时:重新 GET,拿最新值(可能别的设备刚刚打开过)
  useEffect(() => {
    if (!statsOpen) return
    let cancelled = false
    fetch('/api/stats/site')
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (!cancelled && j && j.configured) {
          setSitePv(typeof j.sitePv === 'number' ? j.sitePv : 'error')
          setSiteUv(typeof j.siteUv === 'number' ? j.siteUv : 'error')
          setTodayPv(typeof j.todayPv === 'number' ? j.todayPv : 'error')
          setTodayUv(typeof j.todayUv === 'number' ? j.todayUv : 'error')
        }
      })
      .catch(() => {})
    fetch('/api/views/about')
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (!cancelled && j && j.configured) {
          setPagePv(typeof j.views === 'number' ? j.views : 'error')
          setPageUv(typeof j.uv === 'number' ? j.uv : 'error')
          setTodayPagePv(typeof j.todayViews === 'number' ? j.todayViews : 'error')
          setTodayPageUv(typeof j.todayUv === 'number' ? j.todayUv : 'error')
        }
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
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
              <li className="about-modal-group-label">
                <span>今日</span>
              </li>
              <li className="about-modal-item">
                <span>今日总访问量</span>
                <strong>{renderStat(todayPv)}</strong>
              </li>
              <li className="about-modal-item">
                <span>今日总访客数</span>
                <strong>{renderStat(todayUv)}</strong>
              </li>

              <li className="about-modal-group-label">
                <span>本站</span>
              </li>
              <li className="about-modal-item">
                <span>本站总访问量</span>
                <strong>{renderStat(sitePv)}</strong>
              </li>
              <li className="about-modal-item">
                <span>本站总访客数</span>
                <strong>{renderStat(siteUv)}</strong>
              </li>

              <li className="about-modal-group-label">
                <span>本页(关于)</span>
              </li>
              <li className="about-modal-item">
                <span>本页总阅读量</span>
                <strong>{renderStat(pagePv)}</strong>
              </li>
              <li className="about-modal-item">
                <span>本页总访客数</span>
                <strong>{renderStat(pageUv)}</strong>
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
