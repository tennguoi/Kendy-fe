import { toWebSocketUrl } from './api'

/**
 * Tạo một kết nối WebSocket tự động kết nối lại khi bị ngắt.
 * 
 * @param {Object} options
 * @param {string} options.path Đường dẫn WebSocket (vd: '/ws/notifications')
 * @param {string} options.token Token xác thực người dùng
 * @param {function} options.onMessage Callback được gọi khi nhận được tin nhắn hợp lệ
 * @returns {function} Hàm để đóng kết nối
 */
export function createWebSocket({ path, token, onMessage }) {
  let socket = null
  let reconnectTimer = 0
  let closedByClient = false

  const connect = () => {
    if (closedByClient) return

    const wsUrl = `${toWebSocketUrl(path)}?token=${encodeURIComponent(token)}`
    socket = new WebSocket(wsUrl)

    socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data)
        if (onMessage) onMessage(payload)
      } catch {
        // Bỏ qua nếu data không phải định dạng JSON hợp lệ
      }
    }

    socket.onclose = () => {
      if (!closedByClient) {
        // Tự động kết nối lại sau 3 giây
        reconnectTimer = window.setTimeout(connect, 3000)
      }
    }

    socket.onerror = () => {
      socket?.close()
    }
  }

  connect()

  // Trả về hàm cleanup để huỷ kết nối khi unmount
  return () => {
    closedByClient = true
    window.clearTimeout(reconnectTimer)
    socket?.close()
  }
}
