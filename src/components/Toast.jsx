import { useToast } from '../context/ToastContext.jsx'
import '../styles/toast.css'

/**
 * 全局 Toast 容器
 * - 监听上下文中的 message / visible 状态
 * - 仅在有 message 时渲染,2 秒后通过 context 自动隐藏
 */
export default function Toast() {
  const { message, visible } = useToast()
  if (!message) return null
  return (
    <div className={`toast${visible ? ' toast--show' : ''}`} role="status" aria-live="polite">
      {message}
    </div>
  )
}
