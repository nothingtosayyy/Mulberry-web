/**
 * 简体中文 UI 文本
 *
 * 注意边界:
 *   - 本字典**只收录系统 UI 文本**(导航、按钮、提示、标签、空状态、表头)
 *   - **不**收录文章 / skill 的内容(那些由内容仓库提供,保持原语言)
 *   - **不**收录 SEO 文案(那些由 <SEO> 组件 / index.html 管,跟语言无关)
 *   - **不**收录 MarkdownBody 渲染的代码块复制按钮(无文字,通用)
 *
 * 字段值可以是字符串,也可以是函数(用于动态文案,如 "N 篇" / "N min read")
 */
export default {
  // 通用
  common: {
    loading: '加载中…',
    loadFailed: (reason) => `加载失败:${reason}`,
    back: '返回',
    cancel: '取消',
    close: '关闭',
    copy: '复制',
    copied: '已复制',
    linkCopied: '链接已复制',
    copyFailed: '复制失败,请手动复制地址栏',
    openInNew: '新窗口打开',
    more: '更多',
  },

  // 顶部导航
  nav: {
    resource: '资源',
    about: '关于',
    starOnGithub: 'Star on GitHub',
    toggleTheme: '切换主题',
    toggleLang: 'Switch to English',
    themeDark: '暗色',
    themeLight: '亮色',
  },

  // 首页 HomePage
  home: {
    heroTitle: '期望这些内容可以帮助到你_',
    heroDesc: '与工作或学习相关,收藏能用、好用的内容',
    heroExplore: '去探索',
    findTitle: '查找 Skills',
    searchPlaceholder: '搜索所有 skill',
    allCategory: '全部',
    colName: '名称',
    colDate: '日期',
    empty: '暂无内容。',
  },

  // 文章列表页 WordListPage
  wordList: {
    title: '随笔与想法',
    sub: '关于产品、设计、AI 的一些记录。',
    count: (n) => `${n} 篇`,
    loading: '正在从 GitHub 加载…',
    errorPrefix: '加载失败:',
    empty: (repo) => `暂无文章。在 ${repo} 仓库添加 <cat>/<slug>/README.md 即可出现在此。`,
    rssTitle: '订阅新文章',
    rssDesc: (link) => (
      // 这里没法直接返回 JSX,实际在调用处展开为字符串
      // 调用方会拿到一个结构化对象
      { text: '用 RSS 阅读器(Feedly / NetNewsWire / Inoreader 等)可以订阅 ', link, suffix: ',有新文章时自动推送,不用刷网页。' }
    ),
  },

  // 文章详情页 WordPage
  wordDetail: {
    backToList: '返回文章列表',
    notFound: '未找到该文章',
    backToListHint: '返回列表',
    loading: '正在从 GitHub 加载…',
    errorPrefix: '加载失败:',
    readingTimeUnit: 'min read',
    views: (n) => `${n.toLocaleString()} 次阅读`,
    viewsLoading: '阅读数加载中',
    tocLabel: '目录',
    breadcrumbHome: '首页',
    breadcrumbArticles: '文章',
  },

  // 技能详情页 DetailInfo
  detailInfo: {
    backToList: '返回收藏集',
    loading: '加载中…',
    errorPrefix: '加载失败:',
    notFound: '未找到该 Skill',
    backHome: '返回首页',
    includedOn: (date) => `收录于 ${date}`,
    usage: '使用方式',
    usageHint: (source, github) => (
      { prefix: '复制此链接,让 AI 助手拉取 SKILL.md 并按规范使用;', source, github }
    ),
    sourceLabel: '原始网站:',
    viewOnGithub: '在 GitHub 查看',
    copyRawHint: '已复制 SKILL.md 链接',
    copyRawTitle: '复制 SKILL.md 链接',
  },

  // AboutPage
  about: {
    pageTitle: '关于',
    pageDesc: '关于这个站、它的内容,以及站长的二三事。',
    sectionAuthor: '关于作者',
    authorName: '桑葚',
    authorBio: '产品 / 设计 / AI 应用从业者。这里是我整理的私人收藏与随笔,如果你也想做点什么 — 欢迎聊聊。',
    sectionContact: '联系',
    github: 'GitHub',
    rss: 'RSS 订阅',
    sectionLicense: '许可',
    license: '本站内容采用 MIT 协议发布,数据公开,二次创作只需注明来源。',
    sectionStats: '数据',
    statsPv: '本站访问量',
    statsUv: '本站访客数',
    statsDays: (n) => `本站已运营 ${n} 天`,
  },

  // 404 NotFound
  notFound: {
    title: '404',
    subtitle: '这里什么都没放',
    pathLabel: '访问路径:',
    back: '返回上页',
    home: '回首页',
    recommendTitle: '也许你想看',
    recommendLoading: '正在加载推荐…',
    skillsLabel: '热门 Skill',
    articlesLabel: '最新文章',
  },

  // 分享按钮
  share: {
    label: '复制链接',
    title: '复制链接',
  },
}
