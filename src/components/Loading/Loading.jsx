import React, { useEffect, useState } from 'react'
import './loading.css'

const TIPS = [
  'Hệ thống đang xử lý yêu cầu của bạn...',
  'Đang kết nối máy chủ an toàn...',
  'Đang tải dữ liệu mới nhất...',
  'Sắp xong rồi, vui lòng chờ...',
]

function Loading({
  fullScreen = true,
  message = 'Đang tải dữ liệu...',
  subMessage = 'Vui lòng chờ trong giây lát',
  showTips = false,
  showProgress = false,
}) {
  const [tipIndex, setTipIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [dots, setDots] = useState('')

  // Rotating tips
  useEffect(() => {
    if (!showTips) return
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % TIPS.length)
    }, 2500)
    return () => clearInterval(interval)
  }, [showTips])

  // Fake progress bar
  useEffect(() => {
    if (!showProgress) return
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev
        return prev + Math.random() * 8
      })
    }, 400)
    return () => clearInterval(interval)
  }, [showProgress])

  // Animated dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'))
    }, 500)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className={`kd-loading-container ${fullScreen ? 'fullscreen' : 'inline'}`}>
      {/* Particles background (fullscreen only) */}
      {fullScreen && (
        <div className="kd-particles" aria-hidden="true">
          {Array.from({ length: 12 }).map((_, i) => (
            <span key={i} className={`particle p-${i + 1}`} />
          ))}
        </div>
      )}

      <div className="kd-loading-content">
        {/* Logo / Brand mark */}
        <div className="kd-brand-mark" aria-hidden="true">
          <span className="brand-letter">K</span>
        </div>

        {/* Spinner */}
        <div className="kd-loader-spinner" aria-hidden="true">
          <div className="inner-ring ring-1" />
          <div className="inner-ring ring-2" />
          <div className="inner-ring ring-3" />
          <div className="inner-ring ring-4" />
          <div className="loader-dot" />
        </div>

        {/* Progress bar */}
        {showProgress && (
          <div className="kd-progress-wrap">
            <div className="kd-progress-bar" style={{ width: `${progress}%` }} />
          </div>
        )}

        {/* Text */}
        <div className="kd-loading-text">
          <h3 className="loading-message">
            {message}
            <span className="loading-dots">{dots}</span>
          </h3>
          {subMessage && !showTips && (
            <p className="loading-submessage">{subMessage}</p>
          )}
          {showTips && (
            <p className="loading-submessage loading-tip" key={tipIndex}>
              {TIPS[tipIndex]}
            </p>
          )}
        </div>

        {/* Status badges */}
        <div className="kd-status-badges">
          <span className="badge badge-secure">🔒 Bảo mật</span>
          <span className="badge badge-live">● Trực tuyến</span>
        </div>
      </div>
    </div>
  )
}

export default Loading