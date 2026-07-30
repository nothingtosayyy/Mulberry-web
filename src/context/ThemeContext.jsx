/**
 * 主题管理 Context
 *
 * 模式:'system' | 'light' | 'dark'(三态)
 * - system 模式:跟随操作系统的 prefers-color-scheme,媒体查询变化时自动跟随
 * - light / dark:用户强制指定
 *
 * 持久化:localStorage 'mulberry-theme-v1'
 * 防闪烁:由 index.html 内联 script 在 React 挂载前同步设好 <html data-theme>
 *
 * 用法:
 *   const { theme, setTheme, resolved } = useTheme()
 *   - theme: 当前用户选择('system' | 'light' | 'dark')
 *   - setTheme(next): 切换
 *   - resolved: 实际生效('light' | 'dark'),theme === 'system' 时跟系统
 */
import { createContext, useContext, useEffect, useState, useCallback } from 'react'

const STORAGE_KEY = 'mulberry-theme-v1'
const ThemeContext = createContext(null)

function resolveTheme(theme) {
  if (theme !== 'system') return theme
  if (typeof window === 'undefined' || !window.matchMedia) return 'dark'
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

function readInitial() {
  if (typeof window === 'undefined') return 'system'
  try {
    return localStorage.getItem(STORAGE_KEY) || 'system'
  } catch (_) {
    return 'system'
  }
}

export function ThemeProvider({ children }) {
  // 用 function 形式初始化,避免每次 render 重读 localStorage
  const [theme, setThemeState] = useState(readInitial)
  const [systemPref, setSystemPref] = useState(() => resolveTheme('system'))

  // 监听系统主题变化(仅 system 模式生效)
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mq = window.matchMedia('(prefers-color-scheme: light)')
    const onChange = e => setSystemPref(e.matches ? 'light' : 'dark')
    // 老 Safari 用 addListener
    if (mq.addEventListener) mq.addEventListener('change', onChange)
    else mq.addListener(onChange)
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', onChange)
      else mq.removeListener(onChange)
    }
  }, [])

  // 解析后的主题:system 跟随系统,否则就是用户选的
  const resolved = theme === 'system' ? systemPref : theme

  // 把 resolved 同步到 <html data-theme>(index.html 已经设了首屏值,这里保持一致)
  useEffect(() => {
    if (typeof document === 'undefined') return
    document.documentElement.setAttribute('data-theme', resolved)
  }, [resolved])

  const setTheme = useCallback(next => {
    setThemeState(next)
    try { localStorage.setItem(STORAGE_KEY, next) } catch (_) { /* noop */ }
  }, [])

  // 循环切换:system → light → dark → system
  const cycleTheme = useCallback(() => {
    setThemeState(prev => {
      const order = ['system', 'light', 'dark']
      const next = order[(order.indexOf(prev) + 1) % order.length]
      try { localStorage.setItem(STORAGE_KEY, next) } catch (_) { /* noop */ }
      return next
    })
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolved, cycleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>')
  return ctx
}
