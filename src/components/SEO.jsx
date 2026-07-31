/**
 * SEO 组件 — 运行时设置 meta / canonical / JSON-LD
 *
 * 覆盖范围(分享卡片):
 *   - 微信内嵌浏览器(分享到聊天/朋友圈)— 读 og:
 *   - 微博分享 — 读 og:
 *   - QQ / 知乎 / 朋友圈 — 读 og:
 *   - Twitter / Telegram — 读 twitter:card(顺手放)
 *
 * 设计决策:
 *   - **不**改 document.title:浏览器 tab 始终显示 index.html 的固定 title,
 *     避免 SPA 路由切换导致 tab 闪动 / 用户混淆
 *   - canonical:告诉搜索引擎"哪条 URL 是权威版本",防 ?id= / 跟踪参数重复收录
 *   - JSON-LD:Article schema → Google 搜索结果可能展示富卡片(作者、日期、阅读时间)
 *     仅 article 类型注入,避免无意义噪声
 *
 * SPA 特殊性:
 *   - 首屏 SEO 由 index.html 的默认 meta 兜底(JS 挂载前的快照)
 *   - JS 挂载后由本组件覆盖(用户停留期间分享,看到的是当前页的 meta)
 *   - 搜索引擎爬虫(百度/Google)不跑 JS,收录到的是 index.html 的默认 og — 已知限制
 */
import { useEffect } from 'react'

const SITE_NAME = '桑葚集'
const SITE_DESC = '收藏能用、好用的内容,数据公开在 GitHub 仓库。'
const SITE_URL = 'https://mulberrytian.vercel.app'
const OG_DEFAULT = '/og-default.png'

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

function setLink(rel, href) {
  if (!href) return
  let el = document.head.querySelector(`link[rel="${rel}"]`)
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

/**
 * 注入/更新 <script type="application/ld+json">
 *  - 仅一个站点级 JSON-LD 块:每次更新前清空之前的 article / breadcrumb 等
 *  - 站点级别(WebSite + Person)在 index.html 静态注入,这里只管页面级别
 */
function setJsonLd(data) {
  if (!data) return
  let el = document.getElementById('seo-page-jsonld')
  if (!el) {
    el = document.createElement('script')
    el.type = 'application/ld+json'
    el.id = 'seo-page-jsonld'
    document.head.appendChild(el)
  }
  el.textContent = JSON.stringify(data)
}

function clearJsonLd() {
  const el = document.getElementById('seo-page-jsonld')
  if (el) el.textContent = ''
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
 * @param {string} [props.title]        页面标题(用于 og:title)
 * @param {string} [props.description]  页面描述,默认站点描述
 * @param {string} [props.image]        og:image 路径或绝对 URL,默认 /og-default.png
 * @param {string} [props.type]         og:type,默认 website,文章页用 article
 * @param {string} [props.url]          og:url,默认当前 URL
 * @param {string} [props.publishedAt]  ISO 时间,文章页 og:article:published_time
 * @param {string} [props.author]       作者名,默认 "桑葚"
 * @param {string[]} [props.keywords]   文章关键词,会拼成 meta keywords
 * @param {string} [props.section]      文章分类(中文,如"产品观察"),会写进 JSON-LD articleSection
 * @param {string} [props.modifiedAt]   ISO 时间,可选,文章 lastModified
 */
export default function SEO({
  title,
  description = SITE_DESC,
  image,
  type = 'website',
  url,
  publishedAt,
  author = '桑葚',
  keywords,
  section,
  modifiedAt,
}) {
  const fullTitle = title ? `${title} · ${SITE_NAME}` : SITE_NAME
  const fullDescription = description
  const fullImage = buildImage(image)
  const fullUrl = buildUrl(url)

  useEffect(() => {
    // ── 基础 SEO(不改 document.title)──
    setMeta('name', 'description', fullDescription)
    setMeta('name', 'author', author)
    if (keywords && keywords.length > 0) {
      setMeta('name', 'keywords', keywords.join(','))
    }

    // ── canonical:防重复内容(搜索参数 / 跟踪链接)──
    // 强制走 https + 裸域名(去掉末尾 / 防止 ?ref= 等污染)
    const canonical = fullUrl.split('?')[0].split('#')[0]
    setLink('canonical', canonical)

    // ── Open Graph(微信/微博/QQ/知乎 都吃这一套) ──
    setMeta('property', 'og:title', fullTitle)
    setMeta('property', 'og:description', fullDescription)
    setMeta('property', 'og:image', fullImage)
    setMeta('property', 'og:url', canonical)
    setMeta('property', 'og:type', type)
    setMeta('property', 'og:site_name', SITE_NAME)
    setMeta('property', 'og:locale', 'zh_CN')

    if (type === 'article') {
      if (publishedAt) setMeta('property', 'article:published_time', publishedAt)
      if (modifiedAt) setMeta('property', 'article:modified_time', modifiedAt)
      if (author) {
        setMeta('property', 'article:author', author)
      }
      if (section) setMeta('property', 'article:section', section)
      if (keywords) {
        keywords.forEach((kw) => setMeta('property', 'article:tag', kw))
      }
    }

    // ── Twitter / Telegram(海外渠道,顺手放) ──
    setMeta('name', 'twitter:card', 'summary_large_image')
    setMeta('name', 'twitter:title', fullTitle)
    setMeta('name', 'twitter:description', fullDescription)
    setMeta('name', 'twitter:image', fullImage)

    // ── JSON-LD 结构化数据(仅 article 页)──
    if (type === 'article' && publishedAt) {
      setJsonLd({
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: title,
        description: fullDescription,
        datePublished: publishedAt,
        dateModified: modifiedAt || publishedAt,
        author: {
          '@type': 'Person',
          name: author,
          url: `${SITE_URL}/about`,
        },
        publisher: {
          '@type': 'Organization',
          name: SITE_NAME,
          url: SITE_URL,
          logo: {
            '@type': 'ImageObject',
            url: `${SITE_URL}/og-default.png`,
          },
        },
        mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
        image: fullImage,
        articleSection: section,
        keywords: keywords ? keywords.join(', ') : undefined,
        inLanguage: 'zh-CN',
      })
    } else {
      clearJsonLd()
    }
  }, [
    fullTitle,
    fullDescription,
    fullImage,
    type,
    fullUrl,
    publishedAt,
    modifiedAt,
    author,
    section,
    keywords && keywords.join(','),
  ])

  return null
}
