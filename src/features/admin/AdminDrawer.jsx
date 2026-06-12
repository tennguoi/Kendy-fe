import { X } from 'lucide-react'
import { useEffect } from 'react'

function AdminDrawer({
  children,
  isOpen,
  onClose,
  title,
  width = '520px',
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('admin-drawer-open')
    } else {
      document.body.classList.remove('admin-drawer-open')
    }

    return () => {
      document.body.classList.remove('admin-drawer-open')
    }
  }, [isOpen])

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isOpen) {
        onClose?.()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) {
    return null
  }

  return (
    <div className="admin-drawer-layer" role="presentation" onClick={onClose}>
      <aside
        className="admin-drawer"
        style={{ '--admin-drawer-width': width }}
        role="dialog"
        aria-modal="true"
        aria-label={title || 'Chi tiết'}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="admin-drawer-head">
          <h3>{title || 'Chi tiết'}</h3>
          <button type="button" onClick={onClose} aria-label="Đóng">
            <X size={20} strokeWidth={2.4} aria-hidden="true" />
          </button>
        </div>
        <div className="admin-drawer-body">
          {children}
        </div>
      </aside>
    </div>
  )
}

export default AdminDrawer
