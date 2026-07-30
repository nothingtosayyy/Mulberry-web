/**
 * 主题切换按钮 — 导航栏右上角
 * - 三态循环:system → light → dark → system
 * - 图标随状态变化
 *   - system:显示器图标(半个太阳/月亮)
 *   - light :太阳
 *   - dark  :月亮
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

const SystemIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2" y="4" width="20" height="14" rx="2" />
    <path d="M8 21h8M12 18v3" />
  </svg>
)

const LABEL = {
  system: '跟随系统',
  light: '浅色',
  dark: '深色'
}

export default function ThemeToggle() {
  const { theme, cycleTheme, resolved } = useTheme()
  const Icon = theme === 'light' ? SunIcon : theme === 'dark' ? MoonIcon : SystemIcon
  const label = `${LABEL[theme]}(当前${LABEL[resolved]})`

  return (
    <button
      type="button"
      className="nav-theme-btn"
      onClick={cycleTheme}
      title={label}
      aria-label={label}
    >
      <Icon />
    </button>
  )
}
