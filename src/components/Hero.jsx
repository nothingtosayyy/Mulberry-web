import { useRef } from 'react'
import '../styles/hero.css'

/**
 * Hero 区(欢迎语 + 去探索按钮)
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
