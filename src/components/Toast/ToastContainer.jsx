import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Info, CheckCircle2, AlertTriangle, AlertCircle, X } from 'lucide-react';
import './Toast.css';

const getIcon = (type) => {
  switch (type) {
    case 'success':
      return <CheckCircle2 className="kd-toast-lucide-icon" size={20} />;
    case 'error':
      return <AlertCircle className="kd-toast-lucide-icon" size={20} />;
    case 'warning':
      return <AlertTriangle className="kd-toast-lucide-icon" size={20} />;
    case 'info':
    default:
      return <Info className="kd-toast-lucide-icon" size={20} />;
  }
};

function ToastItem({ toast, onClose, onMouseEnter, onMouseLeave }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isClickable = !!(toast.onClick || toast.to);

  const handleToastClick = (e) => {
    // If user clicks the close button or action button, do not trigger general toast click
    if (e.target.closest('.kd-toast-close') || e.target.closest('.kd-toast-action-btn')) {
      return;
    }
    
    if (toast.onClick) {
      toast.onClick(e);
      onClose(toast.id);
    } else if (toast.to) {
      navigate(toast.to);
      onClose(toast.id);
    }
  };

  return (
    <div className={`kd-toast-slot ${toast.exiting ? 'kd-toast-slot-exit' : ''}`}>
      <div
        className={`kd-toast kd-toast-${toast.type} ${toast.exiting ? 'kd-toast-exit' : ''} ${isClickable ? 'kd-toast-clickable' : ''}`}
        role="status"
        onMouseEnter={() => onMouseEnter(toast.id)}
        onMouseLeave={() => onMouseLeave(toast.id)}
        onClick={handleToastClick}
      >
        <div className="kd-toast-row">
          <div className="kd-toast-icon">
            {getIcon(toast.type)}
          </div>
          <div className="kd-toast-body">
            {toast.title && <div className="kd-toast-title">{toast.title}</div>}
            <div className="kd-toast-message">{toast.message}</div>
            
            {toast.action && (
              <button
                className="kd-toast-action-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  if (toast.action.onClick) toast.action.onClick(e);
                  if (toast.action.to) navigate(toast.action.to);
                  onClose(toast.id);
                }}
              >
                {toast.action.label}
              </button>
            )}
          </div>
          <button
            className="kd-toast-close"
            onClick={() => onClose(toast.id)}
            aria-label={t('common.close', { defaultValue: 'Đóng' })}
          >
            <X size={16} />
          </button>
        </div>

        {toast.hasTimer && (
          <div className="kd-toast-track">
            <div
              className={`kd-toast-bar ${toast.paused ? 'kd-toast-bar-paused' : ''}`}
              style={{ transform: `scaleX(${toast.progress / 100})` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default function ToastContainer({ toasts = [], onClose = () => {}, onMouseEnter = () => {}, onMouseLeave = () => {} }) {
  return createPortal(
    <div className="kd-toast-wrap" aria-live="polite">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onClose={onClose}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        />
      ))}
    </div>,
    document.body
  );
}