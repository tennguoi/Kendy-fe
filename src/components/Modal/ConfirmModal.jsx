import Modal from './Modal'
import './confirmModal.css'

function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Có',
  cancelText = 'Không',
  variant = 'danger',
  loading = false,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="420px"
      className="confirm-modal-dialog"
      variant="confirm"
    >
      <p className="confirm-modal-message">{message}</p>
      <div className="confirm-modal-actions">
        <button
          type="button"
          className="confirm-modal-btn confirm-modal-btn-cancel"
          onClick={onClose}
          disabled={loading}
        >
          {cancelText}
        </button>
        <button
          type="button"
          className={`confirm-modal-btn confirm-modal-btn-confirm ${variant}`}
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? '...' : confirmText}
        </button>
      </div>
    </Modal>
  )
}

export default ConfirmModal
