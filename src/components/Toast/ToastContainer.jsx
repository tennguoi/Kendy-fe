import React from 'react'
import { createPortal } from 'react-dom'
import './Toast.css'

export default function ToastContainer({ toasts = [], onClose = () => {} }) {
  return createPortal(
    <div className="kd-toast-wrap" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`kd-toast kd-toast-${t.type}`} role="status">
          <div className="kd-toast-body">
            {t.title && <div className="kd-toast-title">{t.title}</div>}
            <div className="kd-toast-message">{t.message}</div>
          </div>
          <button className="kd-toast-close" onClick={() => onClose(t.id)} aria-label="Đóng">×</button>
        </div>
      ))}
    </div>,
    document.body,
  )
}
