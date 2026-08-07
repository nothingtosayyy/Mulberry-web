import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { ToastProvider } from './context/ToastContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { LanguageProvider } from './i18n/index.jsx'

// 样式加载顺序:
//   1. index.css    — 全局 reset + 颜色/字号 tokens
//   2. 各组件 .css  — 组件内部自行 import(自包含)
//   3. responsive.css — 在这里集中加载,保证媒体查询覆盖所有组件
import './styles/index.css'
import './styles/responsive.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <LanguageProvider>
        <BrowserRouter>
          <ToastProvider>
            <App />
          </ToastProvider>
        </BrowserRouter>
      </LanguageProvider>
    </ThemeProvider>
  </React.StrictMode>
)
