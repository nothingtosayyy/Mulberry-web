/**
 * 主题切换按钮 — 导航栏右上角
 * - 两态循环:light → dark → light
 * - 图标:
 *   - light:太阳(提示"点击切到深色")
 *   - dark :月亮(提示"点击切到浅色")
 * - 持久化由 ThemeContext 处理
 */
import { useTheme } from '../context/ThemeContext.jsx'

const SunIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
  </svg>
)

const MoonIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
)

const LABEL = { light: '浅色', dark: '深色' }

export default function ThemeToggle() {
  const { theme, cycleTheme } = useTheme()
  // 始终显示"当前模式"的图标
  const Icon = theme === 'light' ? SunIcon : MoonIcon
  const next = theme === 'light' ? '深色' : '浅色'
  const title = `当前${LABEL[theme]} · 点击切换到${next}`

  return (
    <button
      type="button"
      className="nav-theme-btn"
      onClick={cycleTheme}
      title={title}
      aria-label={title}
    >
      <Icon />
    </button>
  )
}
