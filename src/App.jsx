import { Routes, Route } from 'react-router-dom'
import Navigation from './components/Navigation.jsx'
import RouteProgressBar from './components/RouteProgressBar.jsx'
import HomePage from './pages/HomePage.jsx'
import DetailPage from './pages/DetailPage.jsx'
import AboutPage from './pages/AboutPage.jsx'
import WordListPage from './pages/WordListPage.jsx'
import WordPage from './pages/WordPage.jsx'
import NotFound from './pages/NotFound.jsx'
import Toast from './components/Toast.jsx'

/**
 * 应用根组件
 * - 固定顶部导航在所有路由中共享
 * - 通过 react-router 渲染主页、详情页、关于页、文章列表、文章详情
 * - 兜底路由 * → NotFound(包含最新推荐)
 * - 路由切换进度条 RouteProgressBar 放在最顶层,覆盖所有内容
 */
export default function App() {
  return (
    <>
      <Navigation />
      <RouteProgressBar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/skill/:cat/:slug" element={<DetailPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/words" element={<WordListPage />} />
        <Route path="/word/:slug" element={<WordPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toast />
    </>
  )
}
