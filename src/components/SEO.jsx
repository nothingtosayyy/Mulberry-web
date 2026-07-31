/**
 * SEO 组件 — 运行时改 document.title + meta tags(微信/微博/QQ/知乎分享卡片用)
 *
 * 为什么不引入 react-helmet:
 *   - 项目只在路由切换时改 meta,场景单一
 *   - 自写一个 useEffect + DOM 操作,~50 行搞定
 *   - 少装一个依赖,打包更小
 *
 * 分享卡覆盖范围:
 *   - 微信内嵌浏览器(分享到聊天/朋友圈)— 读 og:
 *   - 微博分享 — 读 og:
 *   - QQ/知乎 — 读 og:
 *   - Twitter / Telegram — 读 twitter:card(顺手放了,不多成本)
 *
 * SPA 特殊性:
 *   - 首屏 SEO 由 index.html 的默认 meta 兜底(JS 挂载前的快照)
 *   - JS 挂载后由本组件覆盖(用户停留期间分享,看到的是当前页的 meta)
 *   - 搜索引擎爬虫(百度/Google)不跑 JS,收录到的是 index.html 的默认 og — 这是已知限制
 */
import { useEffect } from 'react'

const SITE_NAME = '桑葚集'
const SITE_DESC = '收藏"能用、好用"的内容,数据公开在 GitHub 仓库。'
const SITE_URL = 'https://mulberrytian.vercel.app'
const OG_DEFAULT = '/og-default.png'

/**
 * 安全地设置一个 <meta> 标签的 content,不存在则创建。
 * 必须在 useEffect 中调用,SSR 框架会报错(我们纯 CSR,无此问题)。
 */
function setMeta(attr, key, content) {
  if (content === undefined || content === null || content === '') return
  let el = document.head.querySelector(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

/**
 * 把页面级 props 标准化成最终展示值。
 */
function buildTitle(pageTitle) {
  if (!pageTitle) return `${SITE_NAME} · 收藏"能用、好用"的内容`
  return `${pageTitle} · ${SITE_NAME}`
}

function buildImage(image) {
  if (!image) return `${SITE_URL}${OG_DEFAULT}`
  if (image.startsWith('http')) return image
  return `${SITE_URL}${image}`
}

function buildUrl(url) {
  if (url) return url
  if (typeof window !== 'undefined') return window.location.href
  return SITE_URL
}

/**
 * @param {object} props
 * @param {string} [props.title]        页面标题(会拼成 `<page> · 桑葚集`)
 * @param {string} [props.description]  页面描述,默认站点描述
 * @param {string} [props.image]        og:image 路径或绝对 URL,默认 /og-default.png
 * @param {string} [props.type]         og:type,默认 website,文章页用 article
 * @param {string} [props.url]          og:url,默认当前 URL
 * @param {string} [props.publishedAt]  ISO 时间,文章页 og:article:published_time
 * @param {string} [props.author]       作者名,默认 "桑葚"
 */
export default function SEO({
  title,
  description = SITE_DESC,
  image,
  type = 'website',
  url,
  publishedAt,
  author = '桑葚',
}) {
  const fullTitle = buildTitle(title)
  const fullDescription = description
  const fullImage = buildImage(image)
  const fullUrl = buildUrl(url)

  useEffect(() => {
    document.title = fullTitle

    // ── 基础 SEO ──
    setMeta('name', 'description', fullDescription)
    setMeta('name', 'author', author)

    // ── Open Graph(微信/微博/QQ/知乎 都吃这一套) ──
    setMeta('property', 'og:title', fullTitle)
    setMeta('property', 'og:description', fullDescription)
    setMeta('property', 'og:image', fullImage)
    setMeta('property', 'og:url', fullUrl)
    setMeta('property', 'og:type', type)
    setMeta('property', 'og:site_name', SITE_NAME)
    setMeta('property', 'og:locale', 'zh_CN')
    if (publishedAt) {
      setMeta('property', 'article:published_time', publishedAt)
    }

    // ── Twitter / Telegram(海外渠道,顺手放) ──
    setMeta('name', 'twitter:card', 'summary_large_image')
    setMeta('name', 'twitter:title', fullTitle)
    setMeta('name', 'twitter:description', fullDescription)
    setMeta('name', 'twitter:image', fullImage)
  }, [fullTitle, fullDescription, fullImage, type, fullUrl, publishedAt, author])

  return null
}
