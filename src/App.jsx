import { Routes, Route } from 'react-router-dom'
import Navigation from './components/Navigation.jsx'
import HomePage from './pages/HomePage.jsx'
import DetailPage from './pages/DetailPage.jsx'
import AboutPage from './pages/AboutPage.jsx'
import Toast from './components/Toast.jsx'

/**
 * 应用根组件
 * - 固定顶部导航在所有路由中共享
 * - 通过 react-router 渲染主页、详情页、关于页
 */
export default function App() {
  return (
    <>
      <Navigation />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/skill/:cat/:slug" element={<DetailPage />} />
        <Route path="/about" element={<AboutPage />} />
      </Routes>
      <Toast />
    </>
  )
}
