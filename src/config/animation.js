/**
 * 动画配置中心 — 用户可在这里直接调整 WebGL 动画参数
 *
 * 每个 get*Config 函数根据当前主题('dark' | 'light')返回对应主题下的动画 props。
 * 主题切换时,FaultyTerminal / Dither 会自动用对应主题的配置。
 *
 * 调整指引:
 *   - tint / waveColor: 主题色,直接改十六进制 / RGB 三元组即可
 *   - 其他参数(noise / dither / glitch 等)跟主题无关,只跟"风格"有关
 *   - 想要 dark/light 不同的参数?在对应分支里覆盖
 */
import { useTheme } from '../context/ThemeContext.jsx'

// ── Hero 区 FaultyTerminal 配置 ────────────────────────────
// 深色模式:Mulberry 主题紫
const HERO_DARK = {
  scale: 1,                    // 整体图案缩放
  gridMul: [2, 1],             // 网格密度 [x, y]
  digitSize: 1.4,              // 单个数字字符大小
  timeScale: 0.5,              // 动画时间流速(降低节奏以省 CPU)
  scanlineIntensity: 0.8,      // 扫描线强度(0=无,1=最强)
  glitchAmount: 1,             // 故障位移幅度
  flickerAmount: 0.3,          // 闪烁频率
  noiseAmp: 0.7,               // FBM 噪声振幅(0=全黑,务必 > 0)
  chromaticAberration: 0,      // 色差偏移
  dither: 1,                   // 抖色强度
  curvature: 1,                // 桶形畸变
  tint: '#7938eb',             // ★ 主色调(深色=Mulberry 紫)
  mouseReact: false,           // 鼠标互动(关=省 GPU)
  mouseStrength: 1,
  pageLoadAnimation: true,     // 加载时逐格入场动画
  brightness: 0.6,             // 整体亮度乘子
  dpr: 1                       // 设备像素比锁 1x
}

// 亮色模式:Hero 区仍是深色背景,动画色改白色
const HERO_LIGHT = {
  ...HERO_DARK,
  tint: '#ffffff'              // ★ 亮色模式=白色
}

/**
 * Hero 动画 props hook
 *  - 主题切换时返回对应配置
 *  - 单一来源:Hero.jsx 不再硬编码任何动画参数
 */
export function useHeroAnimationProps() {
  const { resolved } = useTheme()
  return resolved === 'light' ? HERO_LIGHT : HERO_DARK
}

// ── About 区 Dither 配置 ──────────────────────────────────
// 深色模式:Mulberry 紫
const ABOUT_DITHER_DARK = {
  waveColor: [0.475, 0.219, 0.922],  // RGB 0-1,Mulberry 紫 #7938eb
  disableAnimation: false,
  enableMouseInteraction: true,
  mouseRadius: 0.3,
  colorNum: 4,                         // 调色板颜色数(越小越复古)
  waveAmplitude: 0.3,
  waveFrequency: 3,
  waveSpeed: 0.05,
  pixelSize: 2
}

// 亮色模式:用户没明确要求改,这里保守用白色 —
// (亮色背景上紫色 Bayer 抖动几乎看不见,白色对比最强)
const ABOUT_DITHER_LIGHT = {
  ...ABOUT_DITHER_DARK,
  waveColor: [1, 1, 1]                // ★ 亮色模式=白色
}

/**
 * About 页 Dither 动画 props hook
 */
export function useDitherAnimationProps() {
  const { resolved } = useTheme()
  return resolved === 'light' ? ABOUT_DITHER_LIGHT : ABOUT_DITHER_DARK
}
