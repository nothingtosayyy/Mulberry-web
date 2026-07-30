import { useRef } from 'react'
import '../styles/hero.css'
import FaultyTerminal from './FaultyTerminal.jsx'
import TextType from './TextType.jsx'

/**
 * Hero 区(欢迎语 + 去探索按钮)
 * - 背景:WebGL 故障终端(FaultyTerminal),accent 紫色调
 * - 标题:打字机动画(TextType),在两句话之间循环
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
          scale={1.2}
          gridMul={[2, 1]}
          digitSize={1.4}
          timeScale={0.5}
          scanlineIntensity={0.3}
          glitchAmount={1}
          flickerAmount={1}
          noiseAmp={0.7}
          chromaticAberration={0.3}
          dither={0}
          curvature={0.3}
          tint="#7938eb"
          mouseReact={false}
          mouseStrength={1}
          pageLoadAnimation={true}
          brightness={1}
        />
      </div>
      {/* 顶部深色遮罩,让前景文字更易读 */}
      <div className="hero-overlay" aria-hidden="true" />

      <div className="hero-col hero-col--left">
        <TextType
          as="h1"
          className="hero-headline"
          text={['这是桑葚的收藏集', '期望这些内容可以帮助到你']}
          textColors={['var(--fg)', 'var(--accent-light)']}
          typingSpeed={90}
          pauseDuration={2200}
          deletingSpeed={45}
          loop={true}
          showCursor={true}
          cursorCharacter="_"
          cursorClassName="hero-cursor"
          variableSpeed={{ min: 80, max: 130 }}
        />
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
