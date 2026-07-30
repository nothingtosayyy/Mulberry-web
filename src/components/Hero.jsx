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
      {/* 实验性 WebGL 背景 — Mulberry 主题紫
          性能优先参数(v0.1.5):
          - dpr={1}              : 锁 1x,Retina/2K 屏上单帧像素 -75%
          - chromaticAberration=0: 关闭 R/B 额外 getColor,单帧 -36%
          - noiseAmp=0           : 关闭 FBM 噪声振幅
          - flickerAmount=0.3    : 降低 onOff 重算
          - glitchAmount=0.5     : 降低 displace 计算
          - curvature=0          : 关闭 barrel 桶形畸变
          - gridMul=[1,1]        : 单元格密度减半
          - pageLoadAnimation=false: 关闭逐格入场动画
      */}
      <div className="hero-bg" aria-hidden="true">
        <FaultyTerminal
          scale={1}              // 整体图案缩放(默认 1)
          gridMul={[2, 1]}         // 网格密度 [x, y]:控制数字字符行列分布
          digitSize={1.4}          // 单个数字字符的相对大小
          timeScale={0.5}          // 动画时间流速(0.5 = 半速,降低节奏以省 CPU)
          scanlineIntensity={0.8}  // 扫描线强度(0=无,1=最强)
          glitchAmount={1}       // 故障位移幅度
          flickerAmount={0.3}      // 闪烁频率(0=不闪)
          noiseAmp={0.7}            // FBM 噪声振幅(0=关闭,但此时 digit 永远返回 0 → 全黑)
          chromaticAberration={0}  // 色差偏移(0=关闭,R/B 不再额外 getColor)
          dither={1}               // 抖色强度(0=关闭)
          curvature={1}            // 桶形畸变(0=关闭 barrel)
          tint="#7938eb"           // 主色调(Mulberry 主题紫)
          mouseReact={false}       // 鼠标互动(关闭以免额外 GPU 开销)
          mouseStrength={1}        // 鼠标互动强度(仅 mouseReact=true 时生效)
          pageLoadAnimation={true} // 加载时逐格入场动画(关闭以省 GPU)
          brightness={0.6}           // 整体亮度乘子
          dpr={1}                  // 设备像素比锁 1x(Retina 屏单帧像素 -75%)
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
          typingSpeed={105}
          pauseDuration={2200}
          deletingSpeed={45}
          loop={true}
          showCursor={true}
          cursorCharacter="_"
          cursorClassName="hero-cursor"
        />
        <p className="hero-sub">与工作或学习相关，收藏能用、好用的内容</p>
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
