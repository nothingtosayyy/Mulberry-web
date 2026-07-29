import { createContext, useCallback, useContext, useState } from 'react'

/**
 * 全局 Toast 上下文
 * - showToast(message): 触发一次提示,2 秒后自动消失
 * - 同一时间仅展示一个 toast,后触发的会覆盖前者
 */
const ToastContext = createContext({ showToast: () => {} })

export function ToastProvider({ children }) {
  const [message, setMessage] = useState('')
  const [visible, setVisible] = useState(false)

  const showToast = useCallback((msg) => {
    setMessage(msg)
    setVisible(true)
    window.clearTimeout(showToast._timer)
    showToast._timer = window.setTimeout(() => {
      setVisible(false)
    }, 2000)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast, message, visible }}>
      {children}
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}
