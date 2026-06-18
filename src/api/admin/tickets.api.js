import axiosClient from '../../lib/api';
import { queryString } from '../queryString';

export const adminTicketsApi = {
  getTickets: (token) =>
    axiosClient.get('/api/admin/tickets?limit=100', { token }),

  searchTickets: (params = {}, token) =>
    axiosClient.get(`/api/admin/tickets/search${queryString({ limit: 50, page: 0, ...params })}`, { token }),

  getUnassignedTickets: (token) =>
    axiosClient.get('/api/admin/tickets/unassigned?limit=50', { token }),

  getAssignedToMeTickets: (token) =>
    axiosClient.get('/api/admin/tickets/assigned-to-me?limit=50', { token }),

  getTicket: (ticketCode, token) =>
    axiosClient.get(`/api/admin/tickets/${ticketCode}`, { token }),

  sendTicketMessage: (ticketCode, data, token) =>
    axiosClient.post(`/api/admin/tickets/${ticketCode}/messages`, data, { token }),

  updateTicket: (ticketCode, data, token) =>
    axiosClient.post(`/api/admin/tickets/${ticketCode}/update`, data, { token }),

  updateTicketPriority: (ticketCode, data, token) =>
    axiosClient.patch(`/api/admin/tickets/${ticketCode}/priority`, data, { token }),

  updateTicketCategory: (ticketCode, data, token) =>
    axiosClient.patch(`/api/admin/tickets/${ticketCode}/category`, data, { token }),

  getTicketAttachments: (ticketCode, token) =>
    axiosClient.get(`/api/admin/tickets/${ticketCode}/attachments`, { token }),

  uploadTicketAttachment: (ticketCode, file, token) => {
    const data = new FormData()
    data.append('file', file)
    return axiosClient.post(`/api/admin/tickets/${ticketCode}/attachments`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
      token,
    })
  },

  deleteTicketAttachment: (ticketCode, attachmentId, token) =>
    axiosClient.delete(`/api/admin/tickets/${ticketCode}/attachments/${attachmentId}`, { token }),

  getTicketResolutionTime: (token) =>
    axiosClient.get('/api/admin/tickets/resolution-time', { token }),
};
