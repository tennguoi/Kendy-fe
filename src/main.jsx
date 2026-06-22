import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import './i18n'
import App from './App.jsx'
import { ToastProvider } from './components/Toast'
import { ThemeProvider } from './contexts/ThemeContext'
import axiosClient from './lib/api'
import { initializeServerTime } from './utils/serverTime'

initializeServerTime(axiosClient).catch(() => {
  // Backend remains authoritative; the next API response will retry synchronization.
})

const savedTheme = localStorage.getItem('kd_theme')
const initialTheme = savedTheme === 'dark' || savedTheme === 'light'
  ? savedTheme
  : window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
document.documentElement.classList.toggle('dark', initialTheme === 'dark')

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
