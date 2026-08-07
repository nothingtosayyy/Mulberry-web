/**
 * i18n 核心:LanguageContext + useI18n hook + 持久化
 *
 * 设计原则(跟现有 ThemeContext 保持一致):
 *   - 零新依赖
 *   - localStorage 持久化(STORAGE_KEY = 'mulberry-lang-v1')
 *   - 防闪烁:index.html 内联 script 在 React 挂载前同步设 <html lang>
 *   - 默认中文(zh-CN)— 内容站以中文起家,首次访问者看到熟悉的语言
 *   - 切换按钮循环:zh-CN → en-US → zh-CN
 *   - **不**翻译内容:文章 / skill 的 Markdown 保持原语言
 *
 * 用法:
 *   const { lang, setLang, cycleLang, t } = useI18n()
 *   t('common.loading')                         // '加载中…'
 *   t('wordList.count', 5)                     // '5 篇'  (函数型)
 */
import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import zhCN from './zh-CN.js'
import enUS from './en-US.js'

export const STORAGE_KEY = 'mulberry-lang-v1'
export const DEFAULT_LANG = 'zh-CN'
export const SUPPORTED = ['zh-CN', 'en-US']

const DICTS = {
  'zh-CN': zhCN,
  'en-US': enUS,
}

/**
 * 在 SSR / 加载失败时回退到默认语言
 */
function readInitial() {
  if (typeof window === 'undefined') return DEFAULT_LANG
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return SUPPORTED.includes(stored) ? stored : DEFAULT_LANG
  } catch (_) {
    return DEFAULT_LANG
  }
}

const LanguageContext = createContext(null)

/**
 * 按 "a.b.c" 路径从嵌套对象取值。
 * 不存在时返回 fallback(默认 key,方便定位缺失文案)。
 */
function getByPath(obj, path) {
  const parts = path.split('.')
  let cur = obj
  for (const k of parts) {
    if (cur == null) return undefined
    cur = cur[k]
  }
  return cur
}

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(readInitial)

  // 同步 <html lang> — index.html 已经设了首屏值,这里保持一致
  useEffect(() => {
    if (typeof document === 'undefined') return
    document.documentElement.setAttribute('lang', lang === 'zh-CN' ? 'zh-CN' : 'en')
  }, [lang])

  const setLang = useCallback((next) => {
    if (!SUPPORTED.includes(next)) return
    setLangState(next)
    try { localStorage.setItem(STORAGE_KEY, next) } catch (_) { /* noop */ }
  }, [])

  const cycleLang = useCallback(() => {
    setLangState((prev) => {
      const next = prev === 'zh-CN' ? 'en-US' : 'zh-CN'
      try { localStorage.setItem(STORAGE_KEY, next) } catch (_) { /* noop */ }
      return next
    })
  }, [])

  // 字典查表 — 支持函数型(动态文案)
  const dict = DICTS[lang] || DICTS[DEFAULT_LANG]
  const t = useMemo(() => {
    return function t(key, ...args) {
      const value = getByPath(dict, key)
      if (value === undefined) {
        // 找不到时返回 key 本身,方便定位
        if (typeof window !== 'undefined' && import.meta?.env?.DEV) {
          // eslint-disable-next-line no-console
          console.warn(`[i18n] missing key: ${key}`)
        }
        return key
      }
      return typeof value === 'function' ? value(...args) : value
    }
  }, [dict])

  const value = useMemo(
    () => ({ lang, setLang, cycleLang, t, dict }),
    [lang, setLang, cycleLang, t, dict]
  )

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useI18n() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useI18n must be used inside <LanguageProvider>')
  return ctx
}
