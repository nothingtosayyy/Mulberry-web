import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSkillIndex } from '../hooks/useSkillData.js'
import { SearchIcon } from './Icon.jsx'
import { useI18n } from '../i18n/index.jsx'
import '../styles/find-skills.css'

/**
 * 查找 Skills 区域
 * - 左侧:分类侧边栏(从 GitHub 拉)
 * - 右侧:搜索框 + 列表表格
 * - 表格行点击跳转到 /skill/:cat/:slug
 *   路径包含分类,确保跨分类 slug 唯一
 */
export default function FindSkills() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const { loading, error, data } = useSkillIndex()
  const [activeCat, setActiveCat] = useState('all')
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    if (!data) return []
    let list = data.skills
    if (activeCat !== 'all') {
      list = list.filter((s) => s.cat === activeCat)
    }
    const q = query.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (s) =>
          (s.title || s.name).toLowerCase().includes(q) ||
          (s.desc || '').toLowerCase().includes(q)
      )
    }
    return list
  }, [data, activeCat, query])

  return (
    <section className="find-section" data-component="find-designs">
      {/* 标题 + 搜索框 */}
      <div className="find-header">
        <h2 className="find-title">{t('home.findTitle')}</h2>
        <div className="find-search">
          <SearchIcon size={14} />
          <input
            type="text"
            placeholder={t('home.searchPlaceholder')}
            aria-label={t('home.searchPlaceholder')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="find-body">
        {/* 侧边栏 */}
        <div className="find-sidebar" role="listbox" aria-label="分类筛选">
          {loading && (
            <div className="sidebar-loading">{t('common.loading')}</div>
          )}
          {error && (
            <div className="sidebar-error">{t('common.loadFailed', String(error.message || error))}</div>
          )}
          {data?.categories.map((cat) => {
            const isActive = cat.key === activeCat
            return (
              <button
                key={cat.key}
                type="button"
                role="option"
                aria-selected={isActive}
                className={`sidebar-item${isActive ? ' sidebar-item--active' : ''}`}
                onClick={() => setActiveCat(cat.key)}
              >
                <span>{cat.key === 'all' ? t('home.allCategory') : cat.label}</span>
                <span className="sidebar-count">{cat.count}</span>
              </button>
            )
          })}
        </div>

        {/* 列表表格 */}
        <div className="find-table-wrap">
          <table className="find-table">
            <thead>
              <tr>
                <th>{t('home.colName')}</th>
                <th>{t('home.colDate')}</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={2} className="find-empty">
                    {t('common.loading')}
                  </td>
                </tr>
              )}
              {error && !loading && (
                <tr>
                  <td colSpan={2} className="find-empty">
                    {t('common.loadFailed', String(error.message || error))}
                  </td>
                </tr>
              )}
              {!loading && !error && filtered.length === 0 && (
                <tr>
                  <td colSpan={2} className="find-empty">
                    {t('home.empty')}
                  </td>
                </tr>
              )}
              {filtered.map((skill) => (
                <tr
                  key={`${skill.cat}/${skill.slug}`}
                  onClick={() => navigate(`/skill/${skill.cat}/${skill.slug}`)}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      navigate(`/skill/${skill.cat}/${skill.slug}`)
                    }
                  }}
                >
                  <td>
                    <div className="td-brand">
                      <div className="brand-info">
                        <span className="brand-name">
                          {skill.title || skill.name}
                          {skill.isNew && <span className="badge-new">New</span>}
                        </span>
                        <span className="brand-desc">{skill.desc}</span>
                      </div>
                    </div>
                  </td>
                  <td>{skill.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
