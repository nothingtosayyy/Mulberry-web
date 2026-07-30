/**
 * 动画配置中心 — 用户可在这里直接调整 WebGL 动画参数
 *
 * 设计原则:
 *   - Hero 区(整个 .hero section + 顶栏)始终保持深色模式下的样子,
 *     所以 Hero 动画色 **不随主题变化**,始终是 Mulberry 紫。
 *   - About 页内容区随主题切换,所以 Dither 动画色根据主题切换。
 *
 * 调整指引:
 *   - Hero:改 HERO_BASE 常量即可,两态不区分
 *   - About:ABOUT_DITHER_DARK / ABOUT_DITHER_LIGHT 各自独立调
 */
import { useTheme } from '../context/ThemeContext.jsx'

// ── Hero 区 FaultyTerminal 配置 ────────────────────────────
// Hero 区始终深色局部卡片 → 动画色不随主题变化,统一 Mulberry 紫
const HERO_BASE = {
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
  tint: '#7938eb',             // ★ 主色调:始终 Mulberry 紫
  mouseReact: false,           // 鼠标互动(关=省 GPU)
  mouseStrength: 1,
  pageLoadAnimation: true,     // 加载时逐格入场动画
  brightness: 0.6,             // 整体亮度乘子
  dpr: 1                       // 设备像素比锁 1x
}

/**
 * Hero 动画 props hook
 *  - 不依赖 theme:Hero 区视觉始终深色,动画色也始终紫色
 *  - 单一来源:Hero.jsx 不再硬编码任何动画参数
 */
export function useHeroAnimationProps() {
  return HERO_BASE
}

// ── About 区 Dither 配置 ──────────────────────────────────
// About 页内容区随主题切换,Dither 动画色也跟着切
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

// 亮色模式:白底上紫色 Bayer 矩阵几乎看不见,白色对比最强
const ABOUT_DITHER_LIGHT = {
  ...ABOUT_DITHER_DARK,
  waveColor: [1, 1, 1]                // ★ 亮色模式=白色
}

/**
 * About 页 Dither 动画 props hook
 *  - 跟随整站主题
 */
export function useDitherAnimationProps() {
  const { theme } = useTheme()
  return theme === 'light' ? ABOUT_DITHER_LIGHT : ABOUT_DITHER_DARK
}
