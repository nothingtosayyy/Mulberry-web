/**
 * 增强 markdown 渲染后的 HTML。
 *
 * 处理两件事:
 *   1) 每个 <pre> 末尾注入"复制"按钮(用户读不到 marked 输出,不能改 AST,
 *      只能事后扫字符串改 HTML)
 *   2) 每个 <img> 加 md-zoomable + data-md-zoomable,容器委托 click → 灯箱
 *
 * 重复执行是幂等的(data-md-pre / data-md-zoomable 标记位),开发时 hot reload 不会重复注入。
 */
const COPY_BTN_HTML =
  '<button type="button" class="md-code-copy" aria-label="复制代码" tabindex="-1">' +
  '<svg class="md-code-copy-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" ' +
  'stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
  '<rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>' +
  '<path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"></path>' +
  '</svg>' +
  '<svg class="md-code-copy-ok" viewBox="0 0 24 24" width="14" height="14" fill="none" ' +
  'stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">' +
  '<polyline points="20 6 9 17 4 12"></polyline>' +
  '</svg>' +
  '</button>'

/**
 * @param {string} html marked 输出的 HTML
 * @returns {string} 增强后的 HTML
 */
export function enhanceHtml(html) {
  if (!html) return ''

  // 1) <pre>...</pre> 末尾追加复制按钮
  // 用 [\s\S]*? 非贪婪匹配,匹配最近的 </pre>
  html = html.replace(
    /<pre\b([^>]*)>([\s\S]*?)<\/pre>/g,
    (m, attrs, inner) => {
      if (m.includes('data-md-pre')) return m
      return `<pre${attrs} data-md-pre="1">${inner}${COPY_BTN_HTML}</pre>`
    }
  )

  // 2) <img ...> 加 md-zoomable 类 + data-md-zoomable 标记
  html = html.replace(/<img\b([^>]*?)\/?>/g, (m, attrs) => {
    if (m.includes('data-md-zoomable')) return m
    let newAttrs = attrs
    if (/\bclass="([^"]*)"/.test(newAttrs)) {
      newAttrs = newAttrs.replace(/class="([^"]*)"/, 'class="$1 md-zoomable"')
    } else {
      newAttrs = newAttrs + ' class="md-zoomable"'
    }
    return `<img data-md-zoomable="1"${newAttrs}>`
  })

  return html
}
