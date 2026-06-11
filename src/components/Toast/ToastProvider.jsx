import { useCallback, useState, useRef, useEffect } from 'react';
import { ToastContext } from './ToastContext';
import ToastContainer from './ToastContainer';

const EXIT_ANIMATION_MS = 300;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const removalTimeouts = useRef({});

  // Dọn dẹp timeout khi unmount
  useEffect(() => {
    return () => {
      Object.values(removalTimeouts.current).forEach((timeout) => {
        clearTimeout(timeout);
      });
    };
  }, []);

  const removeToast = useCallback((id) => {
    // Đánh dấu toast đang thoát (thêm class exit)
    setToasts((current) => {
      const target = current.find((t) => t.id === id);
      if (!target || target.exiting) return current;
      return current.map((t) => (t.id === id ? { ...t, exiting: true } : t));
    });

    // Xóa bỏ timeout cũ nếu có
    if (removalTimeouts.current[id]) {
      clearTimeout(removalTimeouts.current[id]);
    }

    // Sau thời gian animation, xóa hẳn khỏi state
    removalTimeouts.current[id] = setTimeout(() => {
      setToasts((current) => current.filter((t) => t.id !== id));
      delete removalTimeouts.current[id];
    }, EXIT_ANIMATION_MS);
  }, []);

  const addToast = useCallback(
    ({ type = 'info', title = '', message = '', timeout = 5000 } = {}) => {
      const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
      const toast = { id, type, title, message, exiting: false };
      setToasts((current) => [...current, toast]);

      if (timeout > 0) {
        setTimeout(() => {
          removeToast(id);
        }, timeout);
      }

      return id;
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </ToastContext.Provider>
  );
}

export default ToastProvider;