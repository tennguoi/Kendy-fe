import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import './Toast.css';

export default function ToastContainer({ toasts = [], onClose = () => {} }) {
  const { t } = useTranslation();

  return createPortal(
    <div className="kd-toast-wrap" aria-live="polite">
      {toasts.map((tItem) => (
        <div
          key={tItem.id}
          className={`kd-toast kd-toast-${tItem.type} ${tItem.exiting ? 'kd-toast-exit' : ''}`}
          role="status"
        >
          <div className="kd-toast-body">
            {tItem.title && <div className="kd-toast-title">{tItem.title}</div>}
            <div className="kd-toast-message">{tItem.message}</div>
          </div>
          <button
            className="kd-toast-close"
            onClick={() => onClose(tItem.id)}
            aria-label={t('common.close', { defaultValue: 'Đóng' })}
          >
            ×
          </button>
        </div>
      ))}
    </div>,
    document.body
  );
}