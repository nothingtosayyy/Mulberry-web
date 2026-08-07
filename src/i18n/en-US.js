/**
 * English UI strings
 *
 * Mirror of zh-CN.js — same keys, English values.
 * Only system UI strings; content stays in its original language.
 */
export default {
  common: {
    loading: 'Loading…',
    loadFailed: (reason) => `Failed to load: ${reason}`,
    back: 'Back',
    cancel: 'Cancel',
    close: 'Close',
    copy: 'Copy',
    copied: 'Copied',
    linkCopied: 'Link copied',
    copyFailed: 'Copy failed. Please copy from the address bar.',
    openInNew: 'Open in new tab',
    more: 'More',
  },

  nav: {
    resource: 'Resources',
    about: 'About',
    starOnGithub: 'Star on GitHub',
    toggleTheme: 'Toggle theme',
    toggleLang: '切换为中文',
    themeDark: 'Dark',
    themeLight: 'Light',
  },

  home: {
    heroTitle: 'Hope these help you_',
    heroDesc: 'Curated, useful content for work & study',
    heroExplore: 'Explore →',
    findTitle: 'Find Skills',
    searchPlaceholder: 'Search all skills',
    allCategory: 'All',
    colName: 'Name',
    colDate: 'Date',
    empty: 'Nothing here yet.',
  },

  wordList: {
    title: 'Essays & Notes',
    sub: 'Reflections on product, design, and AI.',
    count: (n) => `${n} ${n === 1 ? 'post' : 'posts'}`,
    loading: 'Loading from GitHub…',
    errorPrefix: 'Failed to load: ',
    empty: (repo) => `No articles yet. Add <cat>/<slug>/README.md to the ${repo} repo.`,
    rssTitle: 'Subscribe',
    rssDesc: (link) => (
      { text: 'Use any RSS reader (Feedly / NetNewsWire / Inoreader) to subscribe to ', link, suffix: ' — get notified of new posts automatically.' }
    ),
  },

  wordDetail: {
    backToList: 'Back to list',
    notFound: 'Article not found',
    backToListHint: 'back to list',
    loading: 'Loading from GitHub…',
    errorPrefix: 'Failed to load: ',
    readingTimeUnit: 'min read',
    views: (n) => `${n.toLocaleString()} views`,
    viewsLoading: 'loading views',
    tocLabel: 'Contents',
    breadcrumbHome: 'Home',
    breadcrumbArticles: 'Articles',
  },

  detailInfo: {
    backToList: 'Back to collection',
    loading: 'Loading…',
    errorPrefix: 'Failed to load: ',
    notFound: 'Skill not found',
    backHome: 'back to home',
    includedOn: (date) => `Added on ${date}`,
    usage: 'Usage',
    usageHint: (source, github) => (
      { prefix: 'Copy this link and have your AI assistant pull the SKILL.md.', source, github }
    ),
    sourceLabel: 'Source: ',
    viewOnGithub: 'View on GitHub',
    copyRawHint: 'SKILL.md link copied',
    copyRawTitle: 'Copy SKILL.md link',
  },

  about: {
    pageTitle: 'About',
    pageDesc: 'About this site, its content, and the person behind it.',
    sectionAuthor: 'About the author',
    authorName: 'Mulberry',
    authorBio: 'Product / design / AI practitioner. These are my private notes and curated finds — feel free to reach out.',
    sectionContact: 'Contact',
    github: 'GitHub',
    rss: 'RSS',
    sectionLicense: 'License',
    license: 'MIT — content is open. Attribution appreciated but not required.',
    sectionStats: 'Stats',
    statsPv: 'Total page views',
    statsUv: 'Total unique visitors',
    statsDays: (n) => `${n} day${n === 1 ? '' : 's'} online`,
  },

  notFound: {
    title: '404',
    subtitle: 'Nothing here',
    pathLabel: 'Path: ',
    back: 'Back',
    home: 'Home',
    recommendTitle: 'You might like',
    recommendLoading: 'Loading recommendations…',
    skillsLabel: 'Popular Skills',
    articlesLabel: 'Recent posts',
  },

  share: {
    label: 'Copy link',
    title: 'Copy link',
  },
}
