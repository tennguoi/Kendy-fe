import axiosClient from '../../lib/api';

export const adminFilesApi = {
  uploadAdminFile: (file, token) => {
    const data = new FormData()
    data.append('file', file)
    return axiosClient.post('/api/admin/files/upload', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
      token,
    })
  },

  previewAdminFile: (fileId, token) =>
    axiosClient.get(`/api/admin/files/${fileId}/preview`, { token, responseType: 'blob' }),

  downloadAdminFile: (fileId, token) =>
    axiosClient.get(`/api/admin/files/${fileId}/download`, { token, responseType: 'blob' }),

  deleteAdminFile: (fileId, token) =>
    axiosClient.delete(`/api/admin/files/${fileId}/delete`, { token }),
};
