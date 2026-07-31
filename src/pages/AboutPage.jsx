import { useEffect, useState } from 'react'
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

/**
 * 关于页 — 单屏布局
 * - 左侧(50%):Dither WebGL 动画(Mulberry 紫,带鼠标互动)
 * - 中间:1px 垂直分割线
 * - 右侧(50%):站点介绍 + 作者介绍 + 不蒜子 PV / 运营天数
 *
 * 文案由作者自行修改,改下面 ABOUT 段落的 JSX 文本即可
 */
export default function AboutPage() {
  // Dither 参数由 src/config/animation.js 统一管理
  // - 深色模式:Mulberry 紫
  // - 亮色模式:白色
  const ditherProps = useDitherAnimationProps()

  // 运营天数:仅依赖本地日期差,不蒜子挂了他也准
  const [days, setDays] = useState(1)
  useEffect(() => {
    setDays(daysSinceLaunch())
  }, [])

  // 动态注入不蒜子 PV 计数 script(避免污染 index.html,且仅关于页需要)
  useEffect(() => {
    if (document.getElementById('busuanzi-script')) return
    const s = document.createElement('script')
    s.id = 'busuanzi-script'
    s.async = true
    s.src = 'https://busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js'
    document.body.appendChild(s)
  }, [])

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
            {/* <span className="about-eyebrow">About</span> */}
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

          {/* ── 作者 ── */}
          <section className="about-section">
            <h2 className="about-h2">关于作者</h2>
            <p className="about-p">
              桑葚
            </p>
          </section>

          {/* ── 数据:不蒜子 PV + 运营天数(跟随作者之后,排版跟随 footer 风格) ── */}
          <div className="about-stats">
            <span>
              本站访问量 <span id="busuanzi_value_site_pv">…</span> 次
            </span>
            <span className="about-stats-sep">·</span>
            <span>已运营 {days} 天</span>
          </div>

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
    </main>
  )
}
