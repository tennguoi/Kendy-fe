import axiosClient from '../lib/api';

export const publicApi = {
  getServices: () => 
    axiosClient.get('/api/services'),
};
