import axiosClient from '../../lib/api';

export const adminSystemApi = {
  getJobs: (token) =>
    axiosClient.get('/api/admin/jobs?limit=50', { token }),

  retryJob: (jobId, token) =>
    axiosClient.post(`/api/admin/jobs/${jobId}/retry`, {}, { token }),

  cancelJob: (jobId, token) =>
    axiosClient.post(`/api/admin/jobs/${jobId}/cancel`, {}, { token }),

  getHealth: (token) =>
    axiosClient.get('/api/admin/health', { token }),

  getJobStatus: (jobId, token) =>
    axiosClient.get(`/api/admin/jobs/${jobId}/status`, { token }),

  getJobLogs: (token) =>
    axiosClient.get('/api/admin/jobs/logs?limit=100', { token }),
};
