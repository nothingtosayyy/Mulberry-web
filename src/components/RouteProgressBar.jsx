/**
 * 路由切换进度条 — nprogress 风格
 *
 * 行为:
 *   - 首次挂载不显示(避免冷启动闪一下)
 *   - 后续 location.pathname 变化时:
 *     · 立即把进度推到 70%(下一帧)
 *     · 200ms 后推到 90%
 *     · 450ms 后推到 100% 并淡出
 *   - 用 cleanup 取消所有 timer,避免快速连切时残留
 *
 * 为什么不直接跟数据加载挂钩:
 *   - SPA 路由切换本身是同步的(JS 切组件,无网络)
 *   - 真正"重"的是数据(WordPage 拉 markdown、DetailPage 拉 skill)
 *   - 但那两个 loading 已有 skeleton/光晕反馈,不再叠加
 *   - 此处只做"切换动作"的视觉反馈,提供连续感
 *
 * 为什么不用 react-router v6.4+ 的 useNavigation:
 *   - 项目用 v6.26,没有该 hook;另外它要跟数据获取配合才准
 *   - 简单 70→90→100 的时间轴对绝大多数切换时长都够用
 */
import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'

export default function RouteProgressBar() {
  const location = useLocation()
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)
  const firstRender = useRef(true)

  useEffect(() => {
    // 首次渲染直接跳过(冷启动本来就在 loading,再叠会抖)
    if (firstRender.current) {
      firstRender.current = false
      return
    }

    setVisible(true)
    setProgress(0)

    const raf = requestAnimationFrame(() => setProgress(0.7))
    const t1 = setTimeout(() => setProgress(0.9), 200)
    const t2 = setTimeout(() => {
      setProgress(1)
      // 淡出后卸载
      setTimeout(() => setVisible(false), 300)
    }, 450)

    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [location.pathname])

  if (!visible) return null

  return (
    <div className="route-progress" aria-hidden="true">
      <div
        className="route-progress-bar"
        style={{
          width: `${Math.round(progress * 100)}%`,
          opacity: progress >= 1 ? 0 : 1,
        }}
      />
    </div>
  )
}
