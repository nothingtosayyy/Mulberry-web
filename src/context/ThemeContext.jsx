/**
 * 主题管理 Context
 *
 * 模式:'light' | 'dark'(两态)
 * - 默认 'dark'
 * - 切换按钮循环:light → dark → light
 * - 持久化:localStorage 'mulberry-theme-v1'
 * - 防闪烁:index.html 内联 script 在 React 挂载前同步设 <html data-theme>
 *
 * 关键设计:
 *   - 整站只有两个主题,但 nav 顶栏 + Hero 区是"主题无关"深色局部(详见 styles)
 *   - 其他部分(首页列表、详情页、About 内容区等)随主题切换
 *
 * 用法:
 *   const { theme, setTheme } = useTheme()
 */
import { createContext, useContext, useEffect, useState, useCallback } from 'react'

const STORAGE_KEY = 'mulberry-theme-v1'
const DEFAULT_THEME = 'dark'
const VALID = ['light', 'dark']
const ThemeContext = createContext(null)

function readInitial() {
  if (typeof window === 'undefined') return DEFAULT_THEME
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return VALID.includes(stored) ? stored : DEFAULT_THEME
  } catch (_) {
    return DEFAULT_THEME
  }
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(readInitial)

  // 同步到 <html data-theme>(index.html 已经设了首屏值,这里保持一致)
  useEffect(() => {
    if (typeof document === 'undefined') return
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const setTheme = useCallback(next => {
    if (!VALID.includes(next)) return
    setThemeState(next)
    try { localStorage.setItem(STORAGE_KEY, next) } catch (_) { /* noop */ }
  }, [])

  // 循环切换:light → dark → light
  const cycleTheme = useCallback(() => {
    setThemeState(prev => {
      const next = prev === 'light' ? 'dark' : 'light'
      try { localStorage.setItem(STORAGE_KEY, next) } catch (_) { /* noop */ }
      return next
    })
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, cycleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>')
  return ctx
}
