import API from '../api/api';

// Map DB snake_case \u2192 camelCase
function mapCollateralFields(raw) {
  return {
    id: String(raw.id),
    loanId: String(raw.loan_id),
    clientName: raw.client_name ?? raw.loan_id,
    description: raw.description ?? '',
    estimatedValue: parseFloat(raw.estimated_value ?? 0),
    loanStatus: raw.loanStatus ?? raw.loan_status ?? 'Unknown',
    collateralStatus: raw.collateralStatus ?? raw.collateral_status ?? raw.status ?? 'Held',
  };
}

export const getCollaterals = async () => {
  const response = await API.get('/collateral');
  return response.data.data.map(mapCollateralFields);
};

export const getCollateralById = async (id) => {
  const response = await API.get(`/collateral/${id}`);
  return mapCollateralFields(response.data.data);
};

export const createCollateral = async (collateralData) => {
  const response = await API.post('/collateral', collateralData);
  return mapCollateralFields(response.data.data);
};

export const updateCollateral = async (id, collateralData) => {
  const response = await API.put(`/collateral/${id}`, collateralData);
  return mapCollateralFields(response.data.data);
};

export const deleteCollateral = async (id) => {
  const response = await API.delete(`/collateral/${id}`);
  return response.data;
};
