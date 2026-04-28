import API from '../api/api';

const mapClient = (raw) => ({
  id: String(raw.id),
  code: raw.client_code ?? '',
  name: raw.name ?? '',
  phone: raw.phone ?? '',
  nrc: raw.NRC ?? '',
  address: raw.address ?? '',
  riskLevel: raw.risk_level ?? 'Medium',
  notes: raw.notes ?? '',
  loanCount: Number(raw.loan_count ?? 0),
  totalOutstanding: Number(raw.total_outstanding ?? 0),
});

export const getClients = async () => {
  const response = await API.get('/clients');
  return response.data.data.map(mapClient);
};

export const getClientById = async (id) => {
  const response = await API.get(`/clients/${id}`);
  return mapClient(response.data.data);
};

export const getClientLoans = async (id) => {
  const response = await API.get(`/clients/${id}/loans`);
  return response.data.data;
};

export const createClient = async (clientData) => {
  const { id, client_id, clientId, ...payload } = clientData || {};
  const response = await API.post('/clients', payload);
  return mapClient(response.data.data);
};

export const updateClient = async (id, clientData) => {
  const response = await API.put(`/clients/${id}`, clientData);
  return mapClient(response.data.data);
};

export const deleteClient = async (id) => {
  const response = await API.delete(`/clients/${id}`);
  return response.data;
};
