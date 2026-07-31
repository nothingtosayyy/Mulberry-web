/**
 * Lightbox — 全屏图片查看器
 *
 * 交互:
 *   - 点击背景 / 右上角 × 关闭
 *   - ESC 关闭
 *   - 打开时锁滚动(body.overflow: hidden),关闭时还原
 *
 * 注意:
 *   - 用 onClick 关闭背景,但图片本身的 click 阻止冒泡(避免点图片触发关闭)
 *   - 渲染在 fixed 层,不受任何容器 overflow:hidden 影响
 */
import { useEffect } from 'react'

export default function Lightbox({ image, onClose }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    // 锁滚动(避免背景跟着滚)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])

  return (
    <div
      className="lightbox"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={image.alt || '图片预览'}
    >
      <button
        type="button"
        className="lightbox-close"
        onClick={onClose}
        aria-label="关闭"
      >
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */}
      <img
        src={image.src}
        alt={image.alt}
        className="lightbox-img"
        onClick={(e) => e.stopPropagation()}
      />
      {image.alt && (
        <div className="lightbox-caption">{image.alt}</div>
      )}
    </div>
  )
}
