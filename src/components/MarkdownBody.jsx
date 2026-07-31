/**
 * MarkdownBody — markdown 渲染后的 HTML 容器
 *
 * 职责(取代直接的 dangerouslySetInnerHTML):
 *   - 调用 enhanceHtml 给 <pre> 注入复制按钮、给 <img> 注入可放大标识
 *   - 容器 onClick 委托:
 *       · 点复制按钮 → 复制 <pre> 内文本到剪贴板,按钮短暂变 ✓
 *       · 点图片    → 打开 Lightbox
 *   - Lightbox state 本地管理(每篇文章独立一份,关闭即销毁)
 *
 * 容错:
 *   - clipboard API 不可用时降级 textarea + execCommand('copy')
 *   - 复制内容自动剔除按钮自身文字(<pre> 包含按钮 innerText 会污染)
 */
import { useState, useCallback } from 'react'
import { enhanceHtml } from '../utils/enhanceMarkdown.js'
import Lightbox from './Lightbox.jsx'

/**
 * 复制文本到剪贴板。
 * 优先用现代 API(Chrome 66+ / Safari 13.1+ / Firefox 63+),失败回退 textarea 旧法。
 * @param {string} text
 * @returns {Promise<boolean>}
 */
async function copyToClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      // 落到 fallback
    }
  }
  try {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.setAttribute('readonly', '')
    ta.style.position = 'fixed'
    ta.style.top = '0'
    ta.style.left = '0'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.focus()
    ta.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(ta)
    return ok
  } catch {
    return false
  }
}

/**
 * 从 pre 节点取出"纯代码"文本(剔除复制按钮自身的 innerText)。
 */
function extractCodeText(pre) {
  if (!pre) return ''
  // 优先用 <code>:块级代码必有 <code>
  const code = pre.querySelector('code')
  if (code) return code.textContent
  // 兜底:克隆节点删除按钮
  const clone = pre.cloneNode(true)
  clone.querySelectorAll('button').forEach((b) => b.remove())
  return clone.textContent
}

export default function MarkdownBody({ html, className = 'md-body', onClick }) {
  const [lightbox, setLightbox] = useState(null)
  const enhanced = enhanceHtml(html)

  const handleClick = useCallback(
    (e) => {
      // 1) 复制按钮
      const copyBtn = e.target.closest('.md-code-copy')
      if (copyBtn) {
        e.preventDefault()
        e.stopPropagation()
        const pre = copyBtn.closest('pre')
        const text = extractCodeText(pre)
        copyToClipboard(text).then((ok) => {
          if (!ok || !copyBtn.isConnected) return
          copyBtn.classList.add('md-code-copy--ok')
          // 用一次性 timer 避免快速连点叠加
          if (copyBtn._resetTimer) clearTimeout(copyBtn._resetTimer)
          copyBtn._resetTimer = setTimeout(() => {
            copyBtn.classList.remove('md-code-copy--ok')
            copyBtn._resetTimer = null
          }, 1200)
        })
        return
      }

      // 2) 可放大图片
      const img = e.target.closest('img.md-zoomable')
      if (img) {
        e.preventDefault()
        setLightbox({ src: img.src, alt: img.alt || '' })
        return
      }

      // 3) 透传
      onClick?.(e)
    },
    [onClick]
  )

  return (
    <>
      <div
        className={className}
        onClick={handleClick}
        dangerouslySetInnerHTML={{ __html: enhanced }}
      />
      {lightbox && (
        <Lightbox image={lightbox} onClose={() => setLightbox(null)} />
      )}
    </>
  )
}
