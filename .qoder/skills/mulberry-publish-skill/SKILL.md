---
name: mulberry-publish-skill
description: 将用户提供的 skill 文档(SKILL.md)原样写入 mulberry 个人收藏集站点(mulberrytian.vercel.app)的数据仓库,只追加 mulberry 索引所需的最小元数据(分类/色值/日期)。当用户提到"上传 skill"、"发布 skill"、"新加一个 skill"、"publish skill"、或粘贴/指明一个 SKILL.md 路径时触发。不要用于普通问答、只读排查、或不涉及 skill 上传的任务。
---

# Mulberry Publish Skill

## Overview

把用户给的 SKILL.md 整文件原样落到 `nothingtosayyy/Mulberry-SKILL` 数据仓库里,**只**在 YAML frontmatter 头部追加 mulberry 索引必需的 4 个字段(slug/cat/color/date)。原文件里的所有内容(标题、章节、代码、表格、引用、原始字段如 `description`/`name_zh`/`name_en` 等)全部保留,不做任何改写、不生成"设计系统"模板。

**约定源**

| 角色 | 仓库 / 路径 |
|---|---|
| 数据仓库 | `nothingtosayyy/Mulberry-SKILL`(branch: main) |
| 站点仓库 | `nothingtosayyy/Mulberry-web`(生产域名: mulberrytian.vercel.app) |
| 本地 data-repo 镜像 | `<mulberry-repo>/data-repo/`(`git clone` 下来的本地副本) |
| 站点代码 | `c:\Users\10214\.qoderwork\workspace\ms5gmexp4ubcf6qt`(本 skill 所在项目) |

**约定格式(必须遵守,build-index 据此解析)**

- 每个 skill: `<category>/<slug>/SKILL.md`(单文件)
- YAML frontmatter 字段:
  - `name`(显示名,从原 frontmatter 读)
  - `slug`(目录名)
  - `cat`(分类 key,见 `data-repo/categories.json`)
  - `desc`(一句话简介,从原 `description` 截前 200 字)
  - `source`(可选,原 `source`)
  - `color`(品牌主色 `#hex`,必填,问用户)
  - `logo`(卡片首字母,默认取 name 首字符)
  - `date`(`YYYY-MM-DD`,默认今天)
- body:原 SKILL.md 的正文部分,**完全保留**,不要补"使用方式"段落、不要塞设计模板、不要改写章节
- 已废弃:不要再生成本 skill 早期规约里的 `README.md` + `DESIGN.md` 双文件方案;若 `data-repo/<cat>/<slug>/` 下有遗留的 `README.md`/`DESIGN.md`,**删除掉**

---

## When to Use

触发场景:
- 用户粘贴 SKILL.md 内容 / 给出 SKILL.md 绝对路径 / 给出 skill 目录
- 用户说"上传这个 skill"、"新加 skill"、"publish skill"、"加到 mulberry"
- 用户在一个目录下指明某个文件是 skill

不触发:
- 普通问答、知识整理、只读排查
- 用户没说"上传"且没指明文件

---

## Workflow

按以下步骤执行。每步完成后,在最终报告中向用户确认(尤其是涉及 git push / vercel deploy 的步骤)。

### Step 1:定位源文件

向用户获取 SKILL.md 的**绝对路径**。若用户已粘贴内容,先用内容生成临时文件(放在 `uploads/` 或 `.trash/`),再开始处理。

支持的输入格式有 3 种,**先识别再继续**:

| 格式 | 识别方式 | 处理方式 |
|---|---|---|
| **A. 已写好的 SKILL.md**(Qoder 格式或自创) | 文件以 `---` 开头 + 含 `name`/`description` 字段,或无 frontmatter 但结构完整 | **原样复制**,只追加 4 个 mulberry 字段 |
| **B. 自由格式** | 任意 md / txt / 一段话 | 视为简略草稿,需向用户补字段(见 Step 2) |
| **C. 整个 skill 目录** | 用户指明 `xxx/` 目录 | 找目录里的 SKILL.md,按 A 处理;无 SKILL.md 则提示用户 |

如果用户给的是**目录**而里面没 SKILL.md,提示:skill 文件名应当是 `SKILL.md`。

### Step 2:补全缺失字段

只向用户确认**mulberry 索引必需的 4 个字段**(`cat` `slug` `color` `logo`),其余(name/description/body)从源文件读,**不追问**。

```
确认 4 个索引字段:
  cat:    dev-tools / saas / design / ...(见 data-repo/categories.json)
  slug:   小写 + 连字符,如 ai-page-polish(默认从 name 自动生成)
  color:  #FF6B9D    (品牌主色 #hex,问用户)
  logo:   "A"        (默认取 name 首字符,中英文都取第一字)
```

**分类推断**辅助(若用户不确定):
- AI / 大模型 / Agent → `ai-and-llm`
- 编程语言 / IDE / CLI / 版本 / 原型 → `dev-tools`
- 数据库 / 后端 / CI/CD → `backend`
- 团队协作 / 项目管理 / 文档 / 写作 / 研究 / SaaS → `saas`
- Figma / 设计 / 创意 / 写作润色 → `design`
- 支付 / 银行 / 金融 → `fintech`
- 电商 / 零售 → `ecommerce`
- 音乐 / 视频 / 媒体 → `media`
- 汽车 → `auto`

若用户给的 skill 不属于任何现有分类,**停下来**,提示:需要先在 `data-repo/categories.json` 加新分类(本 skill 不自动改 categories.json)。

**自动补全规则**:
- `slug`: 取 `name` 转小写 + 空格转连字符 + 去特殊字符(如 `AI Page Polish` → `ai-page-polish`)
- `logo`: name 第一个字符(中英文都取首字)
- `date`: 今天(本地日期)
- `color`: **必须**问用户,不要瞎猜

### Step 3:复制并注入 mulberry frontmatter

把源文件原样复制到 `data-repo/<cat>/<slug>/SKILL.md`,在 frontmatter 头部**追加** mulberry 字段。

**铁律(违反任何一条 = 视为生产事故)**:

- 原文件的 body **逐字复制**,不得总结、不得改写、不得补“使用方式”段落、不得套用任何模板。
- 不管 skill 主题是什么(PRD 生成 / 竞品分析 / 财务报销 / 需求评审 / ...),**一律只保留它原本的 body**。不要因为“感觉上 PRD 类 skill 需要补充结构”就生成额外章节。
- 如果源文件 body 为空 / 只有 frontmatter / 只有一句话,**停下来问用户**:这个 skill 本身是否完整?不完整就不要上传,反例是"1 行 description + 30 行设计系统模板"的伪 skill。

**frontmatter 注入规则**:
1. 若源文件**无** frontmatter(没有 `---` 包裹),直接生成 `---\nname: <name>\nslug: <slug>\ncat: <cat>\ndesc: <desc>\nsource: <source 或留空>\ncolor: "<color>"\nlogo: "<logo>"\ndate: <YYYY-MM-DD>\n---\n\n<body>`
2. 若源文件**有** frontmatter,保留所有原字段(如 `description`、`name_zh`、`name_en`、`argument-hint`、`install_source` 等),**只在 mulberry 核心字段缺失时补全**。生成的字段顺序:`name` / `slug` / `cat` / `desc` / `source` / `color` / `logo` / `date`(参考 `scripts/batch-publish-skills.mjs` 的 `injectMulberryMeta` 实现)
3. body 部分:**原样保留**,不做任何改写

**清理遗留文件**:`data-repo/<cat>/<slug>/` 下若还有 `README.md` / `DESIGN.md`,**删除**。

### Step 3.5:空模板自检闸门(Quality Gate)

写入 `data-repo/<cat>/<slug>/SKILL.md` 后,**必须**执行以下检查。任何一项不通过都**不要 push**,先回去修。

| 检查项 | 通过条件 | 不通过的典型症状 |
|---|---|---|
| 源文件 body 长度 ≥ 100 字符 | `sourceText.split('---').slice(2).join('---').trim().length >= 100` | 源本身就是空壳,不该上传 |
| 产物 body 长度 ≥ 源 body 长度 | `outBody.length >= sourceBody.length` | 注入过程中误删了内容 |
| 产物 body 不含 7 章节设计模板特征串 | 不出现同时 ≥ 3 个:`“色板”` `“字体规则”` `“按钮”` `“卡片”` `“布局原则”` `“Do's”` `“Don't”` `“设计哲学”` | 不知从哪里又套上了设计模板 |
| frontmatter 包含所有 7 个 mulberry 字段 | `name` `slug` `cat` `desc` `color` `logo` `date` 都存在 | 字段缺失导致首页卡片渲染异常 |

> 闸门可以脚本化(`scripts/batch-publish-skills.mjs` 末尾可加 `validate(outDir)` 调用),本 skill 手动检查时至少要过表里前 3 行。

### Step 4:写入本地 data-repo

目标目录:`<mulberry-repo>/data-repo/<cat>/<slug>/`

步骤:
1. 确认 `data-repo/` 存在(若不存在,提示用户:`cd <mulberry-repo> && git clone https://github.com/nothingtosayyy/Mulberry-SKILL.git data-repo`)
2. 创建 `data-repo/<cat>/<slug>/` 目录
3. 写入 `SKILL.md`(单文件)
4. 删除该目录下任何遗留的 `README.md` / `DESIGN.md`
5. 验证:`scripts/build-index.mjs` 能识别该新 skill(本地跑 `cd <mulberry-repo> && node scripts/build-index.mjs` 不报 skip,且 `public/index.json` 包含该 skill 的 cat/slug/skillPath)

**批量场景**:如果一次要加多个 skill(比如桌面上一个文件夹里有 20 个),使用 `scripts/batch-publish-skills.mjs` — 它已经在 `skills` 数组里写好了 20 个 Qoder skill 的配置,新增 skill 时往数组里加一行即可。

### Step 5:推送数据仓库

```bash
cd <mulberry-repo>/data-repo
git add <cat>/<slug>/
git commit -m "skill: add <name> (<slug>) to <cat>"
git push origin main
```

**SSL/TLS 失败**:重试一次,沙箱机制可能导致偶发失败。

### Step 6:触发 mulberry 站点更新

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
1. 读 frontmatter → 提取 `name: claude-code`, `description: ...`
2. 向用户确认:`cat=ai-and-llm`, `color=#cc785c`(问用户)
3. **原样复制**到 `data-repo/ai-and-llm/claude-code/SKILL.md`,frontmatter 追加 `slug/cat/color/logo/date`
4. `git add/commit/push` 数据仓库
5. 跑 `npm run build:index`,`git push` 站点仓库
6. 停下,问:"是否立即 `vercel --prod` 部署到 mulberrytian.vercel.app?"

### Example 2:自由格式输入

**用户粘贴**:"Notion 是一款 all-in-one 工作区。白色 + 黑色,极简,文字密度高。"

执行:
1. 识别为"自由格式",**逐项**问用户:
   - name: Notion
   - cat: saas
   - slug: notion
   - source: https://notion.so
   - color: #000000
   - logo: N
2. 把用户粘贴的内容作为 body,生成 `data-repo/saas/notion/SKILL.md`(frontmatter 包裹 + body 原样)
3. 推数据仓库,推站点仓库,停下问部署

### Example 3:批量上传整个目录

**用户给**:`C:\Users\10214\Desktop\QoderWork-Skills\`(20 个 skill 目录,每个里面有 SKILL.md)

执行:
1. 用 `scripts/batch-publish-skills.mjs`,在 `skills` 数组里加新行
2. `node scripts/batch-publish-skills.mjs`(20 个 SKILL.md 一次复制完成,每个自动注入 mulberry frontmatter + 删掉 README.md/DESIGN.md 遗留)
3. 跑 `npm run build:index`,验证 20 个 skill 都进入 `public/index.json`
4. `git add/commit/push` 数据仓库 + 站点仓库
5. 停下,问部署

---

## Notes

- **数据仓库 vs 站点仓库**:用户可能混淆。本 skill 操作的是**数据仓库**(`Mulberry-SKILL`),只在 Step 6 才碰站点仓库(`Mulberry-web`)。Vercel 域名是 mulberrytian.vercel.app。
- **冲突处理**:若 `data-repo/<cat>/<slug>/` 已存在,**先停**,问用户是要覆盖 / 跳过 / 改 slug。
- **categories.json**:**不自动改**。若新 skill 不属于现有分类,提示用户先手动加新分类。
- **回滚**:
  - 数据仓库:`cd data-repo && git revert HEAD && git push`
  - 站点:`npx vercel rollback`(回滚到上一个 production 部署)
- **首次运行**:本 skill 第一次被调用时,可能 `data-repo/` 不存在,需要先 `git clone`。
- **本地 vs GitHub 数据源**:`scripts/build-index.mjs` 默认读 `data-repo/`(本地优先),所以必须先把数据写本地。
- **不触发本 skill 的常见误判**:
  - "把这段文字整理成 skill.md" — 整理完即可,不要触发上传
  - "看看 Mulberry 上有什么 skill" — 只读,不触发
  - "改一下这个 skill 的描述" — 应当用"修改现有 skill"流程(本 skill 是"新增"流程,改用编辑模式)

## Anti-Patterns(反面案例, 避免重蹈覆辙)

### 反例 1:给所有 skill 套“设计系统速查”模板 (2026-07-29 事故)

- **表现**: 之前用 `batch-generate-skills.mjs` 批量上传 20 个 skill(PRD 生成 / 竞品分析 / 需求分析 / 原型工厂 / ...),脚本里有一个 `TPL_DESIGN` 模板,只对模板中的 `Skill Name` / 品牌色做字面替换。
- **后果**: 详情页全部显示同一份“UI 设计 — 设计系统速查”内容(色板 / 字体 / 按钮 / 卡片 / 布局原则 / Do's / Don'ts),原有 skill 内容(PRD 模板、SWOT 分析、RICE 框架...)全部丢失。
- **根因**: 本 skill 早期版本要求生成 `README.md + DESIGN.md` 双文件,试图把所有 skill 统一接到“设计系统”这个抽象概念上,结果把与设计无关的 skill 也掉了设计外壳。
- **修复后规约(2026-07-30+)**: 废除 `DESIGN.md` 概念,全部改为单文件 `SKILL.md` 原样保留;Step 3 设了 3 条铁律,Step 3.5 加了 4 项 Quality Gate。

### 反例 2:脚本自动生成的"伪 skill"(空 frontmatter + 一句话)

- **表现**: 脚本里只填了 `name/slug/desc/color`,body 是一句“使用方式”介绍。
- **后果**: 首页能列出,详情页只显示一行字,没有实质内容。
- **避免**: Step 3 铁律第三条已明确要求 — 源文件 body 为空 / 只有 frontmatter / 只有一句话时,**停下来问用户**。

