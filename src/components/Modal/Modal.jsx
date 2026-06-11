import React, { useEffect } from 'react'
import { X } from 'lucide-react'
import './modal.css'

function Modal({ isOpen, onClose, title, children, headerActions = null, maxWidth = '1000px', showHeader = true }) {
  // Lock body scroll when modal is active
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('kd-modal-open')
    } else {
      document.body.classList.remove('kd-modal-open')
    }
    return () => {
      document.body.classList.remove('kd-modal-open')
    }
  }, [isOpen])

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isOpen) {
        onClose?.()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="kd-modal-overlay" onClick={onClose}>
      <div 
        className="kd-modal-dialog" 
        style={{ maxWidth }} 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title || 'Hộp thoại'}
      >
        {showHeader && (
          <div className="kd-modal-header">
            <h3>{title}</h3>
            <div className="kd-modal-header-actions">
              {headerActions}
              <button type="button" className="kd-modal-close-btn" onClick={onClose} aria-label="Đóng">
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        )}
        <div className="kd-modal-body">
          {children}
        </div>
      </div>
    </div>
  )
}

export default Modal
