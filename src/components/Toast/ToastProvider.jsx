import React, { createContext, useCallback, useState } from 'react'
import ToastContainer from './ToastContainer'

export const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback(({ type = 'info', title = '', message = '', timeout = 5000 } = {}) => {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
    const toast = { id, type, title, message }
    setToasts((current) => [...current, toast])

    if (timeout > 0) {
      setTimeout(() => {
        setToasts((current) => current.filter((t) => t.id !== id))
      }, timeout)
    }

    return id
  }, [])

  const removeToast = useCallback((id) => {
    setToasts((current) => current.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </ToastContext.Provider>
  )
}

export default ToastProvider
