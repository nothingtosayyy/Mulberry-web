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
          waveColor={[0.475, 0.219, 0.922]}      // RGB 0-1 颜色数组(当前=Mulberry 紫 #895DF5)
          disableAnimation={false}                // 关闭后波纹静止(节能场景)
          enableMouseInteraction={true}           // 鼠标靠近时波纹被吸引偏移
          mouseRadius={0.3}                       // 鼠标影响半径(0=很小,1=全屏)
          colorNum={0}                            // dither 调色板颜色数(越小越复古)
          waveAmplitude={0.3}                     // 噪声振幅(0=平面,1=起伏强烈)
          waveFrequency={4}                       // fbm 频率倍乘(越大越细密)
          waveSpeed={0.05}                        // 波纹流速(0.05=缓慢,1=快速)
          pixelSize={3}                           // dither 像素块大小(1=细粒,4=粗块)
        />
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
