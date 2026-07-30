/**
 * generate-skill-readmes — 按 mulberry 详情页 Info 模块的结构,
 * 给每个 skill 写一份"信息浓缩版" README.md(中文),供详情页 Info 模块使用。
 *
 * 与 SKILL.md 的区别:
 *   - SKILL.md: 原始作者的完整 skill 文档(英文为主),详情页 MarkdownPreview 区域展示
 *   - README.md: mulberry AI 读 SKILL.md 后,按 Info 模块结构重写的中文信息卡(浓缩),详情页 Info 模块展示
 *
 * README.md 结构(供 build-index.mjs 解析):
 *   ---
 *   title: <中文标题>   # 必填,首页卡片 + 详情页 Info 标题
 *   slug: <slug>        # 与目录名一致
 *   cat: <cat>          # 与父目录一致
 *   ---
 *   # <中文标题>
 *
 *   <一句话定位>         # 详情页副标题
 *
 *   <段落 1>             # 详情页 info-desc 段 1
 *
 *   <段落 2>             # 详情页 info-desc 段 2
 */
import { writeFile, mkdir } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const REPO = resolve(ROOT, 'data-repo')

// 20 个 skill 的中文 title + 信息描述(读 SKILL.md 后按 Info 模块结构重写)
const skills = [
  {
    cat: 'design', slug: 'ai-page-polish',
    title: 'AI 页面打磨',
    desc: '系统化打磨 AI 生成页面，从 demo 质量提升到产品级。',
    lead: '系统化打磨 AI 生成页面，从对齐、间距、视觉层级、状态完整四个维度把 demo 质量提升到产品级。围绕“逐项可执行修复”展开，不替代整体设计。',
    body: [
      '由“启动AI味检查”命令触发；其他说法（“优化一下”/“页面不好看”）不触发，避免误用。',
      '检查覆盖对齐（基线、边距）、间距（8/16/24 网格）、视觉层级（字号/字重/字距）、状态（空/加载/错误/成功）四类问题，逐项给出可执行修复指引，而不是模糊的“再好看一点”。',
    ],
  },
  {
    cat: 'design', slug: 'ui-designer',
    title: 'UI 设计参考提取',
    desc: '从 UI 参考图中提取可落地的设计系统与提示词。',
    lead: '从参考 UI 图片中提取设计系统，产出可落地的 UI 提示词。围绕“视觉规律抽取 + 提示词落地”展开，适用于 MVP、设计改版、多页一致性场景。',
    body: [
      '接收 UI 截图或设计稿，系统性抽取配色、字体、间距、组件样式、动效等视觉规律。',
      '把视觉规律整理成可执行的 UI 设计提示词，结合 PRD 产出可直接用于开发的实现指引。',
    ],
  },
  {
    cat: 'dev-tools', slug: 'app-version-policy',
    title: '应用版本与更新记录',
    desc: '应用代码变更时递增版本号并维护更新记录。',
    lead: '可运行应用/产品交付物做开发性变更时触发，按规则递增应用版本号，并维护项目更新记录 md。',
    body: [
      '触发场景包括修改代码、运行配置、构建发布配置、数据库/接口契约、用户可见产品文案或应用内业务文档。',
      '不用于普通问答、概念解释、资料整理、知识库/会议纪要/方案文档、只读排查、数据表格处理、Codex Skill 或个人配置修改。',
    ],
  },
  {
    cat: 'dev-tools', slug: 'frontend-design',
    title: '高质量前端设计',
    desc: '制作有特色、生产级的前端界面，刻意拉开 AI 通用审美。',
    lead: '制作有特色、生产级的前端界面，避免通用 AI 审美。围绕“鲜明视觉语言 + 高完成度”展开，适用于组件、页面、应用、Poster 等场景。',
    body: [
      '不产出“看起来像 AI 做的”页面：刻意拉开审美距离，做出有作者视角的视觉。',
      '从设计到落地全程打通，产出可作为最终交付物的高保真实现，而不是概念稿。',
    ],
  },
  {
    cat: 'dev-tools', slug: 'prototype-factory',
    title: '高保真原型工厂',
    desc: '用 Flutter / SwiftUI / React 快速做出 pitch-ready 高保真原型。',
    lead: '制作 Flutter / SwiftUI / React 高保真交互原型，带动效、配图和可交付的演示输出。围绕“pitch-ready 演示”展开，适用于 demo / MVP / 演示场合。',
    body: [
      '支持多端：Flutter 移动端、SwiftUI 原生 iOS、React Web 都能产出。',
      '附带动效、占位图、可演示交互，直接可拿去给团队/投资人演示，不需要再做一轮设计。',
    ],
  },
  {
    cat: 'saas', slug: 'airtable-design',
    title: 'Airtable 视觉系统',
    desc: 'Airtable 视觉系统完整复刻，可直接用于前端落地。',
    lead: 'Airtable 品牌设计系统的完整复刻，含配色、字体（Haas Grotesk / Inter Display）、间距、圆角、阴影、组件（按钮/卡片/导航/输入/价格）与响应式断点。',
    body: [
      '把 Airtable 官网的视觉规律整理成可落地的设计 token 和组件规范，直接用于前端实现。',
      '适合需要做“类 Airtable 视觉”的产品落地页、控制台、表单密集型页面。',
    ],
  },
  {
    cat: 'saas', slug: 'content-research-writer',
    title: '高质量内容写作',
    desc: '带研究、引用、迭代的高质量内容写作助手。',
    lead: '带研究、引用、迭代的写作助手，产出有出处、有钩子、有迭代大纲的高质量内容。围绕“边写边研究”展开，逐步给反馈。',
    body: [
      '在写作过程中插入研究、添加引用，边写边迭代大纲；针对每个段落给实时反馈。',
      '适合长文、白皮书、营销文案、报告等需要扎实出处和迭代打磨的内容。',
    ],
  },
  {
    cat: 'saas', slug: 'deep-research',
    title: '深度技术调研',
    desc: '系统性深度调研技术主题，产出可信赖的结论。',
    lead: '系统性深度调研技术主题，带源验证、三角校验和带引用的报告。围绕“高质量技术调研”展开，产出可信赖的结论。',
    body: [
      '对每个论点都做源验证和三角校验（多源交叉），避免“看上去合理但其实有偏”的结论。',
      '产出带引用、可追溯的技术调研报告，适合技术选型、可行性分析、行业 mapping 类工作。',
    ],
  },
  {
    cat: 'saas', slug: 'documents',
    title: '文档处理',
    desc: 'PDF / DOCX / XLSX / PPTX 统一读、写、转换、分析。',
    lead: 'PDF / DOCX / XLSX / PPTX 的读取、写入、转换、分析，统一路由到对应子 skill。围绕“全格式文档处理”展开，处理 / 转换 / 提取一句话可达。',
    body: [
      '对每种文档格式路由到对应子 skill：PDF 单独处理，DOCX/XLSX/PPTX 走各自的读写、转换、提取链路。',
      '适合需要批量处理文档（合同审阅、报告生成、表格汇总、幻灯片改版）的场景。',
    ],
  },
  {
    cat: 'saas', slug: 'jwynia-requirements-analysis',
    title: '需求问题诊断',
    desc: '诊断需求中隐藏的问题，引导发现真实需求。',
    lead: '诊断需求中存在的问题，引导发现真实需求与约束。围绕“问题诊断 + 需求发现”展开，避免一开始就跳到方案设计。',
    body: [
      '不直接给方案，而是先诊断需求本身是否有问题（伪需求、镀金、规则黑洞、越界等）。',
      '适合在动手做产品/功能之前，先把“问题”问清楚；尤其适合复杂业务、多方诉求、技术债务重的项目。',
    ],
  },
  {
    cat: 'saas', slug: 'natural-writing',
    title: '自然写作',
    desc: '写出像人而不是像 AI 的文字，适用多类场景。',
    lead: '写出像人而不是像语言模型的文字，适用于邮件、报告、随笔、文章、营销文案、文档、创意写作、社交媒体。',
    body: [
      '主动规避“AI 味”表达：堆砌的形容词、空洞的开头、过于对称的结构、过度承诺的语气。',
      '保留作者本人的语感、口吻、节奏；适合需要“听起来像你”而不是“听起来像 AI”的场景。',
    ],
  },
  {
    cat: 'saas', slug: 'pm-prd',
    title: 'PRD 生成',
    desc: '输入需求描述，生成含背景/目标/功能/验收的结构化 PRD。',
    lead: '输入功能需求描述，生成结构化 PRD 文档，含背景分析、目标定义、功能清单、交互说明、数据埋点和验收标准。按产品类型（B2C/B2B/内部工具/平台型）走差异化模板。',
    body: [
      '内置产品类型分支：B2C 重交互与增长、B2B 重权限与集成、平台型重角色与规则。',
      '附带 PRD 质量自检清单（10 项逐项校验）+ 常见反模式（需求镀金、伪需求、规则黑洞等）的防护。',
    ],
  },
  {
    cat: 'saas', slug: 'pm-metrics-review',
    title: '产品指标复盘',
    desc: '基于指标数据，输出健康度评估与可执行行动建议。',
    lead: '输入产品指标数据或时间周期，输出指标健康度评估、趋势分析、归因分析、行动建议。内置北极星指标拆解、留存分析、转化漏斗、A/B 实验解读等方法。',
    body: [
      '覆盖从“看到数据”到“知道下一步做什么”的完整链路：不只是图表解读，而是给出可执行行动。',
      '适合周报/月报/季度复盘、异常指标排查、A/B 实验结论汇总等场景。',
    ],
  },
  {
    cat: 'saas', slug: 'pm-brainstorm',
    title: '产品脑暴',
    desc: '用结构化框架驱动产品创意发散与快速筛选。',
    lead: '围绕产品问题或机会点进行结构化创意发散，输出经过初步筛选的创意清单。内置 SCAMPER 法、5Why 追问、约束创新等发散框架，以及 Impact/Effort 快速评估矩阵。',
    body: [
      '不是“漫无目的发散”，而是用结构化框架驱动，确保产出有质量、有广度的创意。',
      '附带 Impact/Effort 矩阵快速筛选，直接对接后续的优先级排序与排期。',
    ],
  },
  {
    cat: 'saas', slug: 'pm-user-feedback',
    title: '用户反馈分析',
    desc: '从用户反馈中自动分类、聚类，提取共性需求与痛点。',
    lead: '上传用户反馈数据（Excel/CSV/文本），自动分类统计并提取高频模式，输出含情感分析、痛点排序和改进建议的洞察报告。支持主题聚类、趋势分析、三角验证。',
    body: [
      '从零散的用户声音里抽出共性需求、情感倾向、痛点优先级，而不是逐条 review。',
      '支持多源数据三角验证，适合 NPS 分析、应用商店评论分析、客诉聚类、调研报告整理等场景。',
    ],
  },
  {
    cat: 'saas', slug: 'pm-user-story',
    title: '用户故事拆解',
    desc: '从 Epic 拆出独立可交付的 User Story，带验收标准。',
    lead: '从 Epic 或大需求中拆解出独立可交付的 User Story，附带 Acceptance Criteria 和 Story Point 估算。内置 INVEST 原则校验和 5 种 Story 拆分模式库。',
    body: [
      'INVEST 原则逐项校验，避免“一个 Story 干一个 Epic”或“过于细碎无法估算”的两类极端。',
      '附带 5 种拆分模式（按角色、按流程、按数据 CRUD、按异常路径、按优先级），直接套用。',
    ],
  },
  {
    cat: 'saas', slug: 'pm-competitor',
    title: '竞品分析',
    desc: '对比竞品功能与战略，输出差异化的策略报告。',
    lead: '输入竞品列表或产品方向，输出功能对比矩阵、SWOT 分析、Porter 五力分析和差异化策略报告。按分析目的（产品设计/融资 BP/战略规划/年度汇报）走差异化模板。',
    body: [
      '不只列功能差异，还做战略推演、竞争定位、机会点识别。',
      '按受众定制输出深度：给设计师看交互拆解，给投资人看增长曲线，给老板看战略地图。',
    ],
  },
  {
    cat: 'saas', slug: 'pm-roadmap',
    title: '路线图更新',
    desc: '汇总迭代状态，输出路线图更新报告与下一步规划。',
    lead: '汇总迭代状态、评估里程碑进度、记录优先级变更，输出路线图更新报告和下一步规划建议。支持从 Linear 等项目管理工具自动拉取项目状态。',
    body: [
      '把分散在各处的迭代状态、延期、阻塞整合成可读性强的路线图更新，直接给团队/老板看。',
      '支持从 Linear / Jira 等工具自动拉取数据，避免手工维护两份。',
    ],
  },
  {
    cat: 'saas', slug: 'pm-prioritization',
    title: '需求优先级排序',
    desc: '用 RICE/ICE/Kano 等模型辅助需求优先级排序。',
    lead: '输入需求列表，用 RICE/ICE/MoSCoW/Kano 模型辅助排序，输出优先级矩阵和 Sprint 规划建议。内置框架选择决策树——根据数据充分度和决策场景自动推荐最适合的排序框架。',
    body: [
      '不只是套一个模型打分，而是根据“数据是否充分”+“决策场景”自动推荐 RICE/ICE/MoSCoW/Kano。',
      '输出直接对接 Sprint 规划，降低“排完优先级还要再排一次”的二次返工。',
    ],
  },
  {
    cat: 'saas', slug: 'product-manager-proactive',
    title: '主动产品经理',
    desc: '主动 PM 视角，覆盖业务/需求/路线图/复盘全链路。',
    lead: '主动 PM 模式，辅助业务决策、需求、路线图、复盘等所有 PM 工作。围绕“主动 PM 视角”展开，任何需要 PM 的场景都触发。',
    body: [
      '不是被动回答“帮我写个 PRD”，而是主动追问背景、目标用户、约束，引导出真正的需求。',
      '覆盖 PM 全链路：业务对接、需求评审、产品决策、路线图规划、复盘分析。',
    ],
  },
]

let count = 0
for (const s of skills) {
  const dest = join(REPO, s.cat, s.slug, 'README.md')
  await mkdir(dirname(dest), { recursive: true })

  const out =
`---
title: ${s.title}
desc: ${s.desc}
slug: ${s.slug}
cat: ${s.cat}
---

# ${s.title}

${s.lead}

${s.body.join('\n\n')}
`
  await writeFile(dest, out, 'utf8')
  count++
  console.log(`✓ ${s.cat}/${s.slug}/README.md (${s.title})`)
}

console.log(`\nDONE: ${count} skill readmes generated`)
