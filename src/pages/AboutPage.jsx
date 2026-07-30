import Dither from '../components/Dither.jsx'
import '../styles/about.css'

/**
 * 关于页 — 单屏布局
 * - 左侧(50%):Dither WebGL 动画(Mulberry 紫,带鼠标互动)
 * - 中间:1px 垂直分割线
 * - 右侧(50%):站点介绍 + 作者介绍
 *
 * 文案由作者自行修改,改下面 ABOUT 段落的 JSX 文本即可
 */
export default function AboutPage() {
  return (
    <main className="about-page">
      {/* 左:Dither 动画 */}
      <section className="about-art" aria-hidden="true">
        <Dither
          waveColor={[0.475, 0.219, 0.922]} // Mulberry 紫 #7938eb
          disableAnimation={false}
          enableMouseInteraction={true}
          mouseRadius={0.3}
          colorNum={4}
          waveAmplitude={0.3}
          waveFrequency={3}
          waveSpeed={0.05}
          pixelSize={2}
        />
      </section>

      {/* 中:分割线 */}
      <div className="about-divider" aria-hidden="true" />

      {/* 右:站点介绍 + 作者介绍 */}
      <section className="about-content">
        <div className="about-inner">
          {/* ── 站点 ── */}
          <header className="about-header">
            <span className="about-eyebrow">About</span>
            <h1 className="about-title">桑葚集</h1>
            <p className="about-subtitle">一个只收藏"能用、好用"内容的小站</p>
          </header>

          <section className="about-section">
            <h2 className="about-h2">关于这个站</h2>
            <p className="about-p">
              桑葚集(Mulberry)是一个纯前端静态站,集中收藏工作与学习里真正用过、觉得值得留下来的内容 —
              Skills、工具、设计参考、流程模板。不追求数量,只在意每条东西能立刻被复用。
            </p>
            <p className="about-p">
              数据完全公开在 GitHub 仓库(见页脚链接),欢迎 fork,也可以直接 clone 到本地当个人收藏夹用。
            </p>
          </section>

          <div className="about-divider-h" aria-hidden="true" />

          {/* ── 作者 ── */}
          <section className="about-section">
            <h2 className="about-h2">关于作者</h2>
            <p className="about-p">
              {/* ↓↓↓ 这里改成你的自我介绍 ↓↓↓ */}
              一个喜欢把工作流程打磨成可复用模板的产品经理/独立开发者。
              日常折腾的方向:产品决策框架、PM 工具链、AI 辅助创作、复古视觉系统。
            </p>
            <p className="about-p">
              {/* ↓↓↓ 这里改成你想表达的 ↓↓↓ */}
              收藏癖严重 — 见到好用的工具、写得好的文档、做得好的产品,都会忍不住整理出来。
              这个站就是我的私人收藏夹,顺便公开。
            </p>
          </section>

          <footer className="about-footer">
            <a className="about-link" href="https://github.com/nothingtosayyy" target="_blank" rel="noopener noreferrer">
              GitHub ↗
            </a>
            <span className="about-footer-sep">·</span>
            <a className="about-link" href="mailto:hi@example.com">
              联系我 ↗
            </a>
          </footer>
        </div>
      </section>
    </main>
  )
}
