import API from '../api/api';

export const login = async (credentials) => {
  const response = await API.post('/auth/login', credentials);
  return response.data.data;
};
