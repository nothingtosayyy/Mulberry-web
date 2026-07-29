import { useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useSkillIndex, useSkillDetail } from '../hooks/useSkillData.js'
import DetailInfo from '../components/DetailInfo.jsx'
import MarkdownPreview from '../components/MarkdownPreview.jsx'

/**
 * 详情页
 * - 路由:/skill/:cat/:slug(包含分类以保证 slug 唯一)
 * - 通过 useSkillIndex 找到 Skill 骨架
 * - 再通过 useSkillDetail 拉 README + DESIGN 内容
 */
export default function DetailPage() {
  const { cat, slug } = useParams()
  const navigate = useNavigate()
  const { data: index } = useSkillIndex()

  // 找到对应 Skill
  const skill = useMemo(
    () => index?.skills.find((s) => s.cat === cat && s.slug === slug),
    [index, cat, slug]
  )

  if (index && !skill) {
    return (
      <main className="page">
        <section className="module module--info">
          <p className="info-desc">
            未找到该 Skill,<Link to="/" className="link-back">返回首页</Link>。
          </p>
        </section>
      </main>
    )
  }

  return (
    <main className="page">
      {skill ? (
        <DetailContent skill={skill} onBack={() => navigate('/')} />
      ) : (
        <LoadingPlaceholder />
      )}
    </main>
  )
}

/** 详情页内容:用 hook 拉 README + DESIGN 原始内容 */
function DetailContent({ skill, onBack }) {
  const { loading, error, data } = useSkillDetail({
    cat: skill.cat,
    slug: skill.slug,
    readmePath: skill.readmePath,
    designPath: skill.designPath,
  })

  return (
    <>
      <DetailInfo
        loading={loading}
        error={error}
        skill={skill}
        meta={data?.meta || {}}
        body={data?.body || ''}
        designRaw={data?.designRaw || ''}
        onBack={onBack}
      />
      <div className="section-divider" />
      <MarkdownPreview
        loading={loading}
        error={error}
        filename="DESIGN.md"
        designRaw={data?.designRaw || ''}
      />
    </>
  )
}

function LoadingPlaceholder() {
  return (
    <section className="module module--info">
      <p className="info-desc" style={{ color: 'var(--fg-dim)' }}>
        正在加载…
      </p>
    </section>
  )
}
