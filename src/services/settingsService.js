import API from '../api/api';

export const getSettings = async () => {
  const response = await API.get('/settings');
  return response.data.data;
};

export const updateSettings = async (settingsData) => {
  const response = await API.put('/settings', settingsData);
  return response.data.data;
};
