import React, { useEffect, useState, useRef } from 'react'
import './loading.css'

const SUB_LINES = [
  'Vui lòng chờ trong giây lát',
  'Máy chủ đang thức dậy...',
  'Gần xong rồi, promise',
  'Đừng tắt tab nha bạn ơi',
  'Đang pha cà phê cho server',
]

function useTypewriter(lines) {
  const [displayed, setDisplayed] = useState('')
  const stateRef = useRef({ li: 0, ci: 0, deleting: false })

  useEffect(() => {
    let timer
    function tick() {
      const { li, ci, deleting } = stateRef.current
      const txt = lines[li]
      if (!deleting) {
        const next = ci + 1
        stateRef.current.ci = next
        setDisplayed(txt.slice(0, next))
        if (next === txt.length) {
          timer = setTimeout(() => { stateRef.current.deleting = true; tick() }, 1800)
          return
        }
        timer = setTimeout(tick, 52)
      } else {
        const next = ci - 1
        stateRef.current.ci = next
        setDisplayed(txt.slice(0, next))
        if (next === 0) {
          stateRef.current.deleting = false
          stateRef.current.li = (li + 1) % lines.length
          timer = setTimeout(tick, 300)
          return
        }
        timer = setTimeout(tick, 28)
      }
    }
    timer = setTimeout(tick, 52)
    return () => clearTimeout(timer)
  }, [lines])

  return displayed
}

function Loading({
  fullScreen = true,
  message = 'Đang tải',
  showProgress = false,
}) {
  const [progress, setProgress] = useState(0)
  const [dots, setDots] = useState('')
  const subText = useTypewriter(SUB_LINES)

  useEffect(() => {
    if (!showProgress) return
    const id = setInterval(() => {
      setProgress(p => p >= 90 ? p : p + Math.random() * 8)
    }, 400)
    return () => clearInterval(id)
  }, [showProgress])

  useEffect(() => {
    const id = setInterval(() => {
      setDots(d => d.length >= 3 ? '' : d + '.')
    }, 500)
    return () => clearInterval(id)
  }, [])

  return (
    <div className={`kd-loading-container ${fullScreen ? 'fullscreen' : 'inline'}`}>
      <div className="kd-loading-content">
        <div className="kd-spinner" aria-hidden="true">
          <div className="spinner-track" />
          <div className="spinner-arc" />
        </div>

        {showProgress && (
          <div className="kd-progress-wrap">
            <div className="kd-progress-bar" style={{ width: `${progress}%` }} />
          </div>
        )}

        <div className="kd-loading-text">
          <p className="loading-message">
            {message}<span className="loading-dots">{dots}</span>
          </p>
          <p className="loading-submessage">
            {subText}<span className="loading-cursor" aria-hidden="true" />
          </p>
        </div>
      </div>
    </div>
  )
}

export default Loading