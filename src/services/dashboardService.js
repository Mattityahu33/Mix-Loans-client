import API from '../api/api';

export const getDashboardStats = async () => {
  const response = await API.get('/dashboard/stats');
  return response.data.data;
};

export const getDashboardAlerts = async () => {
  const response = await API.get('/dashboard/alerts');
  return response.data.data;
};

export const getReportSummary = async () => {
  const response = await API.get('/dashboard/reports');
  return response.data.data;
};
