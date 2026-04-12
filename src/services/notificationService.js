import API from '../api/api';

export const getNotifications = async (filters = {}) => {
  const response = await API.get('/notifications', { params: filters });
  return response.data.data;
};
