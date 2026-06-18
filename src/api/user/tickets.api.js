import axiosClient from '../../lib/api';
import { queryString } from '../queryString';

export const userTicketsApi = {
  getTickets: (params, token) =>
    axiosClient.get(`/api/tickets${queryString({ size: 20, ...params })}`, { token }),

  searchTickets: (params = {}, token) =>
    axiosClient.get(`/api/tickets/search${queryString({ size: 50, page: 0, ...params })}`, { token }),

  getTicket: (ticketCode, token) =>
    axiosClient.get(`/api/tickets/${ticketCode}`, { token }),

  createTicket: (data, token) =>
    axiosClient.post('/api/tickets', data, { token }),

  sendTicketMessage: (ticketCode, data, token) =>
    axiosClient.post(`/api/tickets/${ticketCode}/messages`, data, { token }),

  closeTicket: (ticketCode, token) =>
    axiosClient.post(`/api/tickets/${ticketCode}/close`, {}, { token }),

  reopenTicket: (ticketCode, token) =>
    axiosClient.post(`/api/tickets/${ticketCode}/reopen`, {}, { token }),

  getTicketAttachments: (ticketCode, token) =>
    axiosClient.get(`/api/tickets/${ticketCode}/attachments`, { token }),

  uploadTicketAttachment: (ticketCode, file, token) => {
    const data = new FormData()
    data.append('file', file)
    return axiosClient.post(`/api/tickets/${ticketCode}/attachments`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
      token,
    })
  },

  deleteTicketAttachment: (ticketCode, attachmentId, token) =>
    axiosClient.delete(`/api/tickets/${ticketCode}/attachments/${attachmentId}`, { token }),
};
