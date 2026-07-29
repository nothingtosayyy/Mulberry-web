import { Link } from 'react-router-dom'
import { GitHubIcon } from './Icon.jsx'
import '../styles/navigation.css'

/**
 * 顶部固定导航
 * - 左侧: Logo
 * - 中间: 资源(下拉箭头)/关于
 * - 右侧: GitHub 链接
 *
 * 资源/关于目前为静态展示;如果后续要加下拉菜单,
 * 可把 button 替换为 Dropdown 组件。
 */
export default function Navigation() {
  return (
    <nav className="nav" data-component="navigation">
      <div className="nav-left">
        <Link to="/" className="nav-logo" aria-label="返回主页">
          桑葚集
        </Link>
      </div>

      <div className="nav-center">
        <button className="nav-link" type="button">
          资源<span className="dropdown-arrow" />
        </button>
        <button className="nav-link" type="button">
          关于
        </button>
      </div>

      <div className="nav-right">
        <a
          className="nav-gh-btn"
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          title="GitHub"
        >
          <GitHubIcon size={16} />
          GitHub
        </a>
      </div>
    </nav>
  )
}
