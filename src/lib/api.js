import axios from 'axios';
import { getMonotonicTimestamp, syncServerTime } from '../utils/serverTime';

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

export class ApiError extends Error {
  constructor({ code, message, details, status }) {
    super(message || code || 'Lỗi không xác định');
    this.name = 'ApiError';
    this.code = code || 'UNEXPECTED';
    this.details = details || null;
    this.status = status || 0;
  }
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

axiosClient.interceptors.request.use(
  (config) => {
    config.meta = {
      ...config.meta,
      requestStartedAt: config.meta?.requestStartedAt ?? getMonotonicTimestamp(),
    };
    if (config.token) {
      config.headers.Authorization = `Bearer ${config.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
  (response) => {
    if (!response.config?.meta?.skipTimeSync) {
      syncServerTime(response.headers?.['x-server-time'], response.config?.meta?.requestStartedAt);
    }
    return response.status === 204 ? null : response.data;
  },
  (error) => {
    if (error.response && !error.config?.meta?.skipTimeSync) {
      syncServerTime(error.response.headers?.['x-server-time'], error.config?.meta?.requestStartedAt);
    }

    if (error.response) {
      const payload = error.response.data;
      const htmlMsg = htmlErrorMessage(payload);
      if (htmlMsg) {
        return Promise.reject(new ApiError({
          code: 'HTML_ERROR',
          message: htmlMsg,
          status: error.response.status,
        }));
      }

      if (payload && typeof payload === 'object') {
        const { code, message, details } = payload;
        return Promise.reject(new ApiError({
          code: code || 'API_ERROR',
          message: message || payload.error || `Yêu cầu thất bại (${error.response.status})`,
          details: details || null,
          status: error.response.status,
        }));
      }

      return Promise.reject(new ApiError({
        code: 'API_ERROR',
        message: `Yêu cầu thất bại (${error.response.status})`,
        status: error.response.status,
      }));
    }

    if (error.request) {
      return Promise.reject(new ApiError({
        code: 'NETWORK_ERROR',
        message: 'Không thể kết nối đến máy chủ.',
      }));
    }

    return Promise.reject(new ApiError({
      code: 'UNEXPECTED',
      message: error.message || 'Lỗi không xác định',
    }));
  }
);

export async function apiRequest(path, { method = 'GET', token, body } = {}) {
  const config = {
    method,
    url: path,
    token,
  };
  if (body) {
    config.data = body;
  }
  return axiosClient(config);
}

export default axiosClient;
