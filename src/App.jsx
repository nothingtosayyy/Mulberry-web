import { Routes, Route } from 'react-router-dom'
import Navigation from './components/Navigation.jsx'
import HomePage from './pages/HomePage.jsx'
import DetailPage from './pages/DetailPage.jsx'
import Toast from './components/Toast.jsx'

/**
 * 应用根组件
 * - 固定顶部导航在所有路由中共享
 * - 通过 react-router 渲染主页和详情页
 */
export default function App() {
  return (
    <>
      <Navigation />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/skill/:cat/:slug" element={<DetailPage />} />
      </Routes>
      <Toast />
    </>
  )
}
