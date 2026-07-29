import { useRef } from 'react'
import '../styles/hero.css'
import FaultyTerminal from './FaultyTerminal.jsx'

/**
 * Hero 区(欢迎语 + 去探索按钮)
 * - 背景:WebGL 故障终端(FaultyTerminal),accent 紫色调
 * - 点击「去探索」平滑滚动到下一个 section
 */
export default function Hero() {
  const sectionRef = useRef(null)

  const handleExplore = () => {
    // 滚动到页面下一个 section
    const next = sectionRef.current?.nextElementSibling
    if (next) {
      next.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <section className="hero" data-component="hero" ref={sectionRef}>
      {/* 实验性 WebGL 背景 — Mulberry 主题紫 */}
      <div className="hero-bg" aria-hidden="true">
        <FaultyTerminal
          scale={1.6}
          gridMul={[2, 1]}
          digitSize={1.4}
          timeScale={1.5}
          scanlineIntensity={0.4}
          glitchAmount={1}
          flickerAmount={1}
          noiseAmp={0.8}
          chromaticAberration={0}
          dither={0}
          curvature={0.3}
          tint="#7938eb"
          mouseReact={true}
          mouseStrength={0.3}
          pageLoadAnimation={true}
          brightness={0.45}
        />
      </div>
      {/* 顶部深色遮罩,让前景文字更易读 */}
      <div className="hero-overlay" aria-hidden="true" />

      <div className="hero-col hero-col--left">
        <h1 className="hero-headline">
          这是桑葚的收藏集
          <br />
          <span className="accent">期望这些内容可以帮助到你</span>
        </h1>
        <p className="hero-sub">与工作或学习相关,只收藏能用、好用的内容</p>
        <div className="hero-ctas">
          <button className="btn btn-white" type="button" onClick={handleExplore}>
            去探索
            <span className="hero-arrow" aria-hidden="true">
              →
            </span>
          </button>
        </div>
      </div>
    </section>
  )
}
