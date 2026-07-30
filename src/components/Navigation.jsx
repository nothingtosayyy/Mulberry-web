import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { GitHubIcon } from './Icon.jsx'
import ThemeToggle from './ThemeToggle.jsx'
import '../styles/navigation.css'

/**
 * 顶部固定导航
 * - 左:Logo
 * - 中:资源(下拉:Skill / 文章)/关于
 * - 右:主题切换 + GitHub 链接
 *
 * 资源下拉:hover 展开 / 离开延迟 200ms 关闭
 * - 视觉上锁深色(用 -always token),与顶栏风格一致
 */
export default function Navigation() {
  const [open, setOpen] = useState(false)
  const closeTimer = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()

  // 路由变化时强制关闭(避免点击后下拉还悬空)
  useEffect(() => setOpen(false), [location.pathname])

  function scheduleClose() {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    closeTimer.current = setTimeout(() => setOpen(false), 180)
  }
  function cancelClose() {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
  }

  return (
    <nav className="nav" data-component="navigation">
      <div className="nav-left">
        <Link to="/" className="nav-logo" aria-label="返回主页">
          <svg className="nav-logo-icon" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M777.984 669.184c20.9408-16.0256 34.56-41.1648 34.56-69.5808 0-30.3104-15.4112-56.9856-38.8096-72.7552 20.0192-16.0768 32.8704-40.6528 32.8704-68.352 0-23.8592-9.5744-45.4656-25.0368-61.2352 2.6112-8.2944 4.0448-17.152 4.0448-26.3168 0-39.3216-25.9072-72.6016-61.5936-83.6608-5.888-42.6496-42.3936-75.52-86.6816-75.52-13.6192 0-26.5216 3.2256-37.9904 8.7552-15.7696-15.3088-37.2224-24.7808-60.928-24.7808-39.0144 0-72.0896 25.5488-83.4048 60.8256a86.67136 86.67136 0 0 0-36.608-8.0896c-48.384 0-87.6032 39.2192-87.6032 87.6032 0 9.728 1.6384 19.0464 4.5568 27.7504-27.4944 14.7456-46.2336 43.776-46.2336 77.2096 0 19.7632 6.656 37.9904 17.7152 52.6336-24.9856 15.4112-41.6256 42.9568-41.6256 74.4448 0 31.8976 17.1008 59.7504 42.5984 75.0592-15.9744 15.872-25.856 37.8368-25.856 62.1568 0 25.6 11.0592 48.5888 28.5696 64.6144-5.0688 11.1104-7.9872 23.3984-7.9872 36.4032 0 48.384 39.2192 87.6032 87.6032 87.6032h0.4608c4.5056 44.1344 41.7792 78.592 87.1424 78.592 24.9344 0 47.4112-10.496 63.3856-27.2384 14.6432 11.008 32.768 17.6128 52.5312 17.6128 36.5056 0 67.7376-22.3232 80.896-54.016 46.3872-2.2016 83.3536-40.448 83.3536-87.3472 0-3.0208-0.1536-5.9904-0.4608-8.9088 29.1328-14.2336 49.2544-44.032 49.2544-78.6432-0.1024-25.8048-11.1616-48.7936-28.7232-64.8192z" fill="#B172B2"/>
            <path d="M466.3296 203.3152s90.2656 27.3408 20.7872 162.3552S419.2256 484.352 419.2256 484.352s-65.2288-37.1712-61.952-102.912C305.7152 449.024 268.5952 435.2512 246.3744 433.3568s-50.0224 19.6608-73.984 2.56c12.7488-15.4112 17.7664-65.9968 9.1136-92.2624-8.6016-26.2656-3.6864-108.3392 92.416-107.52-51.4048-31.488-62.72-62.464-63.6928-101.5808 65.3312 4.1472 95.6416 5.3248 119.9616-13.6192 24.32-18.8416 147.1488-12.6976 136.1408 82.3808z" fill="#BFE5BD"/>
            <path d="M210.2272 134.6048c65.3312 4.1472 95.6416 5.3248 119.9616-13.6192 24.32-18.8928 147.1488-12.7488 136.1408 82.3296 0 0 2.4064 0.7168 6.0928 2.5088-13.8752 7.168-30.464 11.9296-45.9264 6.656-35.8912-12.1856-79.5648 5.4784-95.744 25.5488s-50.176 90.0608-70.2976 109.056c-15.6672 14.848-21.9648 54.272-83.2512 91.648-1.6384-0.8192-3.2256-1.7408-4.864-2.9184 12.7488-15.4112 17.7664-65.9968 9.1136-92.2624-8.6016-26.2656-3.6864-108.3392 92.416-107.52-51.3536-31.3344-62.72-62.3104-63.6416-101.4272z" fill="#A2DD9E"/>
            <path d="M454.4 53.9136l52.9408-24.5248s46.7968 57.856 50.3808 194.0992c-17.0496 19.6096-28.7744 13.7216-28.7744 13.7216s-10.8032-126.4128-74.5472-183.296z" fill="#CF9782"/>
          </svg>
          桑葚集
        </Link>
      </div>

      <div className="nav-center">
        <div
          className="nav-dropdown-wrap"
          onMouseEnter={() => { cancelClose(); setOpen(true) }}
          onMouseLeave={scheduleClose}
        >
          <button
            className={`nav-link nav-link--dropdown${open ? ' nav-link--active' : ''}`}
            type="button"
            aria-haspopup="menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            资源<span className="dropdown-arrow" />
          </button>

          {open && (
            <div className="nav-dropdown" role="menu">
              <Link
                to="/"
                className="nav-dropdown-item"
                role="menuitem"
                onClick={() => setOpen(false)}
              >
                <div className="nav-dropdown-item-title">Skill</div>
                <div className="nav-dropdown-item-desc">精选网站的设计观察 · 收录于 GitHub</div>
              </Link>
              <Link
                to="/words"
                className="nav-dropdown-item"
                role="menuitem"
                onClick={() => setOpen(false)}
              >
                <div className="nav-dropdown-item-title">文章</div>
                <div className="nav-dropdown-item-desc">关于产品、设计、AI 的思考</div>
              </Link>
            </div>
          )}
        </div>

        <NavLink
          to="/about"
          className={({ isActive }) => `nav-link${isActive ? ' nav-link--active' : ''}`}
        >
          关于
        </NavLink>
      </div>

      <div className="nav-right">
        <ThemeToggle />
        <a
          className="nav-gh-btn"
          href="https://github.com/nothingtosayyy"
          target="_blank"
          rel="noopener noreferrer"
          title="GitHub"
        >
          <GitHubIcon size={16} />
          Star on GitHub
        </a>
      </div>
    </nav>
  )
}
