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
 *
 * i18n:按钮文字 + 提示 toast 都走 t('key')
 */
import { useState } from 'react'
import { useToast } from '../context/ToastContext.jsx'
import { useI18n } from '../i18n/index.jsx'
import { copyToClipboard } from '../utils/clipboard.js'
import { ShareIcon } from './Icon.jsx'

export default function ShareButton() {
  const { t } = useI18n()
  const { showToast } = useToast()
  const [ok, setOk] = useState(false)

  const handleClick = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : ''
    const success = await copyToClipboard(url)
    if (success) {
      showToast(t('common.linkCopied'))
      setOk(true)
      setTimeout(() => setOk(false), 1500)
    } else {
      showToast(t('common.copyFailed'))
    }
  }

  return (
    <button
      type="button"
      className={`share-button ${ok ? 'share-button--ok' : ''}`}
      onClick={handleClick}
      aria-label={t('share.label')}
      title={t('share.title')}
    >
      <ShareIcon size={14} />
      <span>{ok ? t('common.copied') : t('share.label')}</span>
    </button>
  )
}
