---
name: mulberry-publish-skill
description: 将用户提供的 skill 文档按 mulberry 个人收藏集站点的约定格式整理为 README.md + DESIGN.md,写入本地 data-repo/ 并推送到 nothingtosayyy/Mulberry-SKILL 数据仓库,然后触发 mulberry 站点(mulberrytian.vercel.app)更新。当用户提到"上传 skill"、"发布 skill"、"新加一个 skill"、"格式化 skill"、"publish skill"、或粘贴/指明一个 skill.md 路径时触发。不要用于普通问答、只读排查、或不涉及 skill 上传的任务。
---

# Mulberry Publish Skill

## Overview

将用户提供的 skill 文档,按 mulberry 个人收藏集站点的约定格式整理,推送到 `nothingtosayyy/Mulberry-SKILL` 数据仓库,并触发 `nothingtosayyy/Mulberry-web`(站点)更新,使该 skill 在 https://mulberrytian.vercel.app 上自动出现。

**约定源**:
- 数据仓库:`https://github.com/nothingtosayyy/Mulberry-SKILL` (branch: main)
- 站点仓库:`https://github.com/nothingtosayyy/Mulberry-web` (生产域名: mulberrytian.vercel.app)
- 站点代码:`c:\Users\10214\.qoderwork\workspace\ms5gmexp4ubcf6qt`(用户工作区,本 skill 所在项目)

**约定格式**(必须遵守,站点 `scripts/build-index.mjs` 据此解析):
- 路径:`<category>/<slug>/README.md` + `<category>/<slug>/DESIGN.md`
- 分类(9 个,见数据仓库根目录 `categories.json`):
  `ai-and-llm`, `dev-tools`, `backend`, `saas`, `design`, `fintech`, `ecommerce`, `media`, `auto`
- README.md frontmatter(YAML,字段名严格,值格式见下方模板)
- DESIGN.md 7 章节(见模板)

---

## When to Use

触发场景:
- 用户粘贴 skill.md 内容 / 给出 skill.md 路径
- 用户说"上传这个 skill"、"新加 skill"、"格式化"、"publish skill"、"加到 mulberry"
- 用户在一个目录下指明某个文件是 skill(如 `xxx/SKILL.md`)

不触发:
- 普通问答、知识整理、只读排查
- 用户没说"上传"且没指明文件

---

## Workflow

按以下 7 步执行。每步完成后,在最终报告中向用户确认(尤其是涉及 git push / vercel deploy 的步骤)。

### Step 1:定位源文件

向用户获取 skill.md 的**绝对路径**。若用户已粘贴内容,先用内容生成临时文件(放在 `uploads/` 或 `.trash/`),再开始处理。

支持的输入格式有 3 种,**先识别再继续**:

| 格式 | 识别方式 | 处理方式 |
|---|---|---|
| **A. Qoder skill 格式** | 文件以 `---` 开头且包含 `name:` + `description:` | 解析 frontmatter(取 name、可能的 description);body 作为设计参考;自动从 `name_zh` 等字段补信息 |
| **B. 自由格式** | 任意 md / txt / 一段话 | 视为简略描述,需向用户补充 5 个关键字段(见 Step 3) |
| **C. 已分好的 README + DESIGN** | 用户给两个文件路径 | 直接拷贝到目标目录,跳过生成步骤 |

如果用户给的是**目录**而不是单文件,提示:skill.md 应该是单文件(README/DESIGN 由本 skill 生成)。

### Step 2:解析已存在的元数据

从前置 frontmatter(Qoder 格式)或从正文,提取尽可能多的字段:

- `name` (必需,显示名,如 "Claude Code" / "Stripe")
- `slug` (必需,目录名,小写 + 连字符,如 `claude-code` / `stripe`)
- `cat` (必需,9 个分类 key 之一)
- `desc` (必需,一句话简介,≤ 50 字)
- `source` (可选,官方 URL)
- `color` (可选,品牌主色 `#hex`,如 `#cc785c`)
- `logo` (可选,卡片首字母,如 `"C"`)
- `date` (必需,YYYY-MM-DD)
- `isNew` (可选,bool,默认 true)

**自动补全规则**:
- `slug`: 取 `name` 转小写 + 空格转连字符 + 去特殊字符(如 `Claude Code` → `claude-code`)
- `logo`: 取 `name` 第一个字母大写
- `date`: 今天 (本地日期)
- `isNew`: true(本 skill 流程用于"新增")
- `color`: 若未提供,**必须**问用户(不要瞎猜)

### Step 3:补全缺失字段(必填项)

向用户**逐项**确认缺失的必填项,直到全部就绪:

```
确认 5 个关键字段:
  name:    Claude Code
  cat:     ai-and-llm   (9 选 1)
  desc:    Anthropic 推出的 AI 编程助手...
  source:  https://www.anthropic.com   (可空)
  color:   #cc785c                    (品牌主色 #hex)
```

**分类推断**辅助(若用户不确定):
- AI/大模型 → `ai-and-llm`
- 编程语言/IDE/CLI → `dev-tools`
- 数据库/后端/CI/CD → `backend`
- 团队协作/项目管理 → `saas`
- Figma/设计/创意 → `design`
- 支付/银行/金融 → `fintech`
- 电商/零售 → `ecommerce`
- 音乐/视频/媒体 → `media`
- 汽车 → `auto`

若用户给的 skill 不属于任何现有分类,**停下来**,提示:需要先在 `Mulberry-SKILL/categories.json` 加新分类(本 skill 不自动改 categories.json)。

### Step 4:生成 README.md + DESIGN.md

按下面模板生成两个文件。**严格使用模板结构**,站点 build 脚本才能正确解析。

#### README.md 模板

```markdown
---
name: <name>
slug: <slug>
cat: <cat>
desc: <desc>
source: <source 或留空>
color: "<color>"   <!-- 必须用双引号包裹 #hex -->
logo: "<logo>"     <!-- 必须用双引号包裹 -->
date: <YYYY-MM-DD>
isNew: true
---

<一段简介,30-80 字,2-3 句话概括核心定位>

把本目录的 `DESIGN.md` 拷到目标项目根目录,然后向 AI 助手提示:"请按 DESIGN.md 规范重新生成 UI",即可获得一套与该 skill 视觉语言一致的全新设计。
```

#### DESIGN.md 模板(7 章节,缺一不可)

```markdown
# <name> · 设计系统速查

<name> 的视觉语言以品牌色 `<color>` 为锚点,围绕"<一句话概括设计哲学>"展开。

## 视觉调性

- **整体氛围**: <影院感 / 办公感 / 极简 / 复古 / ...>
- **品牌色使用**: 仅作为强调色(关键 CTA、激活态、品牌点缀),不当背景
- **辅助色**: 中性灰阶为主(<具体灰阶>),搭配 1-2 个状态色(<success/warning/danger>)

## 调色板

| 名称 | 色值 | 用途 |
|---|---|---|
| Canvas | `#0A0A0A` | 主背景 |
| Surface | `#1A1A1A` | 卡片/容器背景 |
| Text Primary | `#F0F0F0` | 正文、标题 |
| Text Muted | `#888888` | 次要文本、占位符 |
| Border | `rgba(255,255,255,0.08)` | 卡片边框、分隔线 |
| Brand | `<color>` | 品牌强调(CTA、激活、点缀) |
| Accent | `<color>` | 链接、hover 高亮 |

## 字号体系

| 层级 | 字号 | 字重 | 字距 |
|---|---|---|---|
| Display | 48-72px | 700 | -0.03em |
| Heading | 24-32px | 600 | -0.02em |
| Body | 15-16px | 400 | 0 |
| Caption | 11-12px | 400 | 0.02em |

强调字号使用全大写 + 字距 0.06-0.1em。

## 组件样式

### 按钮

- **主按钮**: 品牌色背景,白字,圆角 6px,padding 10px 24px
- **次按钮**: 透明背景,1px 边框 `rgba(255,255,255,0.12)`,圆角 6px
- **品牌按钮**: 品牌色填充,圆角 8px,内边距加大(padding 12px 32px)

### 卡片

- 背景 `#1A1A1A`,边框 `rgba(255,255,255,0.08)`,圆角 12px,内边距 24px
- hover 时边框升至 `rgba(255,255,255,0.15)`,过渡 150ms

## 布局原则

- 内容容器最大宽度 `1200px`,水平居中
- 间距采用 8px 基准单位,常用 16 / 24 / 32 / 48px
- 页面区块之间至少 `64px` 上下间距
- 标题与正文之间 `16-24px` 间距

## Do's and Don'ts

### ✅ Do

- 品牌色仅用于关键 CTA 和品牌点缀,每屏 1-2 处为佳
- 文字层级清晰,正文与标题对比度足够
- 强调字号全大写 + 字距加宽

### ❌ Don't

- 不要用品牌色做大面积背景
- 不要在正文里滥用品牌色(限链接/激活/CTA)
- 卡片圆角不超过 12px
- 不要使用过多阴影
```

**根据源文件**填充 `<...>` 占位符:
- `<name>` `<color>` `<logo>` — 来自 Step 3
- "视觉调性"、"调色板"、"组件样式"的具体描述 — 从源 skill.md / 用户补充 / 品牌官网截图推断
- 若源信息严重不足,**停下来问用户**,不要瞎编

### Step 5:写入本地 data-repo

目标目录:`<mulberry-repo>/data-repo/<cat>/<slug>/`

步骤:
1. 确认 `data-repo/` 存在(若不存在,提示用户:`cd <mulberry-repo> && git clone https://github.com/nothingtosayyy/Mulberry-SKILL.git data-repo`)
2. 创建 `data-repo/<cat>/<slug>/` 目录
3. 写入 `README.md` 和 `DESIGN.md`
4. 验证:`scripts/build-index.mjs` 能识别该新 skill(本地跑 `cd <mulberry-repo> && node scripts/build-index.mjs` 不会报 skip,且 `public/index.json` 包含该 skill)

### Step 6:推送数据仓库

```bash
cd <mulberry-repo>/data-repo
git add <cat>/<slug>/
git commit -m "skill: add <name> (<slug>) to <cat>"
git push origin main
```

**SSL/TLS 失败**:重试一次,沙箱机制可能导致偶发失败。

### Step 7:触发 mulberry 站点更新

**Mulberry-SKILL 仓库的 push 不会自动触发 mulberry 站点**(站点 Vercel 集成接的是 Mulberry-web 仓库)。需要手动:

```bash
cd <mulberry-repo>
npm run build:index   # 重建 public/index.json
git add public/index.json
git commit -m "index: add <name>"
git push origin main  # Vercel 自动部署
```

或(更快,跳过等待 GitHub 集成):
```bash
cd <mulberry-repo>
npx vercel --prod --yes
```

**默认策略(用户已确认)**:完成后**停下,问用户是否立即 `vercel --prod --yes`**,不要自动部署。

部署成功标志(用户偏好的极简验证):
- Vercel CLI 输出 `Aliased: https://mulberrytian.vercel.app` + `Ready in Ns`
- 不要做 DOM 探测 / bundle hash 对比 / 多次截图(用户明确反感过度验证)

---

## Examples

### Example 1:Qoder skill 格式输入

**用户提供**:`C:\Users\10214\Desktop\QoderWork-Skills\claude-code\SKILL.md`(已是 Qoder 格式)

执行:
1. 读取 frontmatter → 提取 `name: claude-code`, `description: ...`, `name_zh: Claude Code`
2. 向用户确认:`cat=ai-and-llm`, `color=#cc785c`, `desc=Anthropic 推出的 AI 编程助手`
3. 生成 `data-repo/ai-and-llm/claude-code/README.md` + `DESIGN.md`
4. `git add/commit/push` 数据仓库
5. 停下,问:"是否立即 `vercel --prod` 部署到 mulberrytian.vercel.app?"

### Example 2:自由格式输入

**用户粘贴**:"Notion 是一款 all-in-one 工作区。白色 + 黑色,极简,文字密度高。品牌色 #000000。官网 https://notion.so"

执行:
1. 识别为"自由格式",**逐项**问用户:
   - name: Notion
   - cat: saas
   - slug: notion
   - desc: all-in-one 工作区,极简白底
   - source: https://notion.so
   - color: #000000
   - logo: N
2. 生成 README + DESIGN(简化版 DESIGN,因为源信息少)
3. 推数据仓库,停下问部署

### Example 3:已分好 README + DESIGN

**用户提供**:`./my-skill/README.md` 和 `./my-skill/DESIGN.md`

执行:
1. 验证两个文件存在且 frontmatter 完整
2. 推断 cat(问用户)
3. 拷贝到 `data-repo/<cat>/<slug>/`
4. 推数据仓库,停下问部署

---

## Notes

- **数据仓库 vs 站点仓库**:用户可能混淆。本 skill 操作的是**数据仓库**(`Mulberry-SKILL`),只在 Step 7 才碰站点仓库(`Mulberry-web`)。Vercel 域名是 mulberrytian.vercel.app。
- **冲突处理**:若 `data-repo/<cat>/<slug>/` 已存在,**先停**,问用户是要覆盖 / 跳过 / 改 slug。
- **categories.json**:**不自动改**。若新 skill 不属于 9 个现有分类,提示用户先手动加新分类。
- **回滚**:
  - 数据仓库:`cd data-repo && git revert HEAD && git push`
  - 站点:`npx vercel rollback`(回滚到上一个 production 部署)
- **首次运行**:本 skill 第一次被调用时,可能 `data-repo/` 不存在,需要先 `git clone`。
- **本地 vs GitHub 数据源**:`scripts/build-index.mjs` 默认读 `data-repo/`(本地优先),所以必须先把数据写本地。
- **不触发本 skill 的常见误判**:
  - "把这段文字整理成 skill.md" — 整理完即可,不要触发上传
  - "看看 Mulberry 上有什么 skill" — 只读,不触发
  - "改一下这个 skill 的描述" — 应当用"修改现有 skill"流程(本 skill 是"新增"流程,改用编辑模式)
