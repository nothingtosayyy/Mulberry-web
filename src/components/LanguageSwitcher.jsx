/**
 * 语言切换按钮 — 导航栏右上角(主题切换按钮旁边)
 *
 * 形态:
 *   - 循环 zh-CN ↔ en-US
 *   - 按钮文字始终显示**目标语言**(中显示 EN 提示"切到英文",英显示 中 提示"切到中文")
 *   - 不显示"当前语言"标签 — 多数语言切换器这种设计更直观
 *
 * 持久化由 LanguageContext 处理(<html lang> 也由 context 同步)
 */
import { useI18n } from '../i18n/index.jsx'
import { GlobeIcon } from './Icon.jsx'

const TARGET_LABEL = { 'zh-CN': 'EN', 'en-US': '中' }
const TARGET_TITLE = { 'zh-CN': 'Switch to English', 'en-US': '切换为中文' }

export default function LanguageSwitcher() {
  const { lang, cycleLang } = useI18n()
  const label = TARGET_LABEL[lang] || 'EN'
  const title = TARGET_TITLE[lang] || ''

  return (
    <button
      type="button"
      className="nav-lang-btn"
      onClick={cycleLang}
      title={title}
      aria-label={title}
    >
      <GlobeIcon size={14} />
      <span className="nav-lang-label">{label}</span>
    </button>
  )
}
