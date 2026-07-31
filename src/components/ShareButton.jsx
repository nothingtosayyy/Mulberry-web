/**
 * ShareButton — 复制当前页 URL 到剪贴板
 *
 * 设计动机(替代分享卡):
 *   - SPA 模式下 og:* meta 由 JS 注入,微信/微博爬虫抓不到 → 分享卡不一定生效
 *   - 给用户一个"主动分享"按钮,行为可控:点 → 复制 → 自己去微信/微博贴
 *   - 用现有 useToast 反馈"已复制"
 *
 * 容错:
 *   - clipboard API 不可用 / 权限被拒时降级 textarea + execCommand
 *   - 失败给清晰提示"复制失败,请手动复制地址栏",不静默
 */
import { useState } from 'react'
import { useToast } from '../context/ToastContext.jsx'
import { copyToClipboard } from '../utils/clipboard.js'
import { ShareIcon } from './Icon.jsx'

export default function ShareButton() {
  const { showToast } = useToast()
  const [ok, setOk] = useState(false)

  const handleClick = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : ''
    const success = await copyToClipboard(url)
    if (success) {
      showToast('链接已复制,去微信/微博贴吧')
      setOk(true)
      setTimeout(() => setOk(false), 1500)
    } else {
      showToast('复制失败,请手动复制地址栏')
    }
  }

  return (
    <button
      type="button"
      className={`share-button ${ok ? 'share-button--ok' : ''}`}
      onClick={handleClick}
      aria-label="复制链接"
      title="复制链接"
    >
      <ShareIcon size={14} />
      <span>{ok ? '已复制' : '分享'}</span>
    </button>
  )
}
