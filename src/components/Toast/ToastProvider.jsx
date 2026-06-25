import { useCallback, useState, useRef, useEffect } from 'react';
import { ToastContext } from './ToastContext';
import ToastContainer from './ToastContainer';

const EXIT_ANIMATION_MS = 320;
const TICK_MS = 100;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const removalTimeouts = useRef({});
  const tickIntervals = useRef({});

  // Dọn dẹp timeout/interval khi unmount
  useEffect(() => {
    return () => {
      Object.values(removalTimeouts.current).forEach(clearTimeout);
      Object.values(tickIntervals.current).forEach(clearInterval);
    };
  }, []);

  const clearTickInterval = useCallback((id) => {
    if (tickIntervals.current[id]) {
      clearInterval(tickIntervals.current[id]);
      delete tickIntervals.current[id];
    }
  }, []);

  const removeToast = useCallback((id) => {
    // Đánh dấu toast đang thoát (thêm class exit)
    setToasts((current) => {
      const target = current.find((t) => t.id === id);
      if (!target || target.exiting) return current;
      return current.map((t) => (t.id === id ? { ...t, exiting: true } : t));
    });

    clearTickInterval(id);

    // Xóa bỏ timeout cũ nếu có
    if (removalTimeouts.current[id]) {
      clearTimeout(removalTimeouts.current[id]);
    }

    // Sau thời gian animation, xóa hẳn khỏi state
    removalTimeouts.current[id] = setTimeout(() => {
      setToasts((current) => current.filter((t) => t.id !== id));
      delete removalTimeouts.current[id];
    }, EXIT_ANIMATION_MS);
  }, [clearTickInterval]);

  // Chạy tick đếm ngược progress bar cho 1 toast, tự gọi removeToast khi hết giờ
  const startTicking = useCallback((id, timeout) => {
    clearTickInterval(id);

    tickIntervals.current[id] = setInterval(() => {
      setToasts((current) =>
        current.map((t) => {
          if (t.id !== id || t.paused || t.exiting) return t;

          const elapsed = Date.now() - t.resumedAt + t.elapsedBeforePause;
          const remaining = Math.max(timeout - elapsed, 0);
          const progress = (remaining / timeout) * 100;

          if (remaining <= 0) {
            clearTickInterval(id);
            removeToast(id);
            return { ...t, progress: 0 };
          }

          return { ...t, progress };
        })
      );
    }, TICK_MS);
  }, [clearTickInterval, removeToast]);

  const addToast = useCallback(
    ({ type = 'info', title = '', message = '', code = '', details = null, timeout = 5000, onClick = null, to = null, action = null } = {}) => {
      const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
      const hasTimer = timeout > 0;

      const toast = {
        id,
        type,
        title,
        message,
        code,
        details,
        onClick,
        to,
        action,
        exiting: false,
        hasTimer,
        timeout,
        progress: 100,
        paused: false,
        resumedAt: Date.now(),
        elapsedBeforePause: 0,
      };

      setToasts((current) => [...current, toast]);

      if (hasTimer) {
        startTicking(id, timeout);
      }

      return id;
    },
    [startTicking]
  );

  // Tạm dừng đếm giờ khi hover vào toast
  const pauseToast = useCallback((id) => {
    setToasts((current) =>
      current.map((t) => {
        if (t.id !== id || !t.hasTimer || t.paused || t.exiting) return t;
        const elapsedBeforePause = t.elapsedBeforePause + (Date.now() - t.resumedAt);
        return { ...t, paused: true, elapsedBeforePause };
      })
    );
  }, []);

  // Tiếp tục đếm giờ khi rời chuột khỏi toast
  const resumeToast = useCallback((id) => {
    setToasts((current) =>
      current.map((t) => {
        if (t.id !== id || !t.hasTimer || !t.paused || t.exiting) return t;
        return { ...t, paused: false, resumedAt: Date.now() };
      })
    );
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <ToastContainer
        toasts={toasts}
        onClose={removeToast}
        onMouseEnter={pauseToast}
        onMouseLeave={resumeToast}
      />
    </ToastContext.Provider>
  );
}

export default ToastProvider;