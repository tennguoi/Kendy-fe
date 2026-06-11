import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export function toApiUrl(path) {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }
  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

export function toWebSocketUrl(path) {
  const baseUrl = new URL(API_BASE_URL);
  baseUrl.protocol = baseUrl.protocol === 'https:' ? 'wss:' : 'ws:';
  baseUrl.pathname = path.startsWith('/') ? path : `/${path}`;
  baseUrl.search = '';
  return baseUrl.toString();
}

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

function htmlErrorMessage(payload) {
  if (typeof payload !== 'string') {
    return '';
  }

  if (payload.includes('ERR_NGROK_8012') || payload.includes('upstream web service at localhost:8080')) {
    return 'Ngrok không kết nối được tới backend localhost:8080. Hãy chạy lại backend hoặc chỉnh lại tunnel ngrok.';
  }

  if (payload.trim().startsWith('<!DOCTYPE html') || payload.trim().startsWith('<html')) {
    return 'API trả về trang HTML lỗi thay vì JSON. Kiểm tra backend hoặc cấu hình API/ngrok.';
  }

  return '';
}

// Interceptor cho request (gắn token)
axiosClient.interceptors.request.use(
  (config) => {
    // Nếu các API service truyền token vào config.token hoặc có token lưu ở localStorage
    // Tạm thời mình sẽ để các service tự gắn token qua hàm nếu cần thiết, hoặc lấy từ localStorage sau.
    if (config.token) {
      config.headers.Authorization = `Bearer ${config.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor cho response (chuẩn hóa lỗi)
axiosClient.interceptors.response.use(
  (response) => {
    // Axios tự parse JSON nên ta chỉ trả về data
    return response.status === 204 ? null : response.data;
  },
  (error) => {
    // Chuẩn hóa lỗi cho giống response cũ
    let message;
    if (error.response) {
      const payload = error.response.data;
      message = htmlErrorMessage(payload)
        || payload?.message
        || payload?.error
        || payload?.detail
        || `API ${error.config?.method?.toUpperCase() || 'REQUEST'} ${error.config?.url || ''} failed with ${error.response.status}`;
    } else if (error.request) {
      message = 'Không thể kết nối đến máy chủ.';
    } else {
      message = error.message;
    }
    return Promise.reject(new Error(message || 'Lỗi không xác định'));
  }
);

// Tạm thời giữ lại apiRequest để các file chưa migrate kịp không bị lỗi ngay lập tức
// Nhưng sẽ chuyển về dùng axios.
export async function apiRequest(path, { method = 'GET', token, body } = {}) {
  const config = {
    method,
    url: path,
    token, // Được request interceptor xử lý
  };
  if (body) {
    config.data = body;
  }
  return axiosClient(config);
}

export default axiosClient;
