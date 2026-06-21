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
