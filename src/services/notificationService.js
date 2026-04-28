import API from '../api/api';

export const getNotifications = async (filters = {}) => {
  const response = await API.get('/notifications', { params: filters });
  return response.data.data;
};

export const markNotificationAsRead = async (id) => {
  const response = await API.patch(`/notifications/${id}/read`);
  return response.data.data;
};

export const markAllNotificationsAsRead = async () => {
  const response = await API.patch('/notifications/read-all');
  return response.data.data;
};

export const getUnreadNotificationCount = async () => {
  const notifications = await getNotifications({ status: 'unread' });
  return notifications.length;
};
