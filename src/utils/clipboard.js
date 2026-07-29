/**
 * 将文本写入系统剪贴板,失败时回退到 textarea + execCommand
 * @param {string} text
 * @returns {Promise<boolean>} 是否复制成功
 */
export async function copyToClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch (e) {
      // 权限被拒,降级
    }
  }
  // 降级方案
  const ta = document.createElement('textarea')
  ta.value = text
  ta.style.position = 'fixed'
  ta.style.opacity = '0'
  document.body.appendChild(ta)
  ta.select()
  let ok = false
  try {
    ok = document.execCommand('copy')
  } catch (e) {
    ok = false
  }
  document.body.removeChild(ta)
  return ok
}
