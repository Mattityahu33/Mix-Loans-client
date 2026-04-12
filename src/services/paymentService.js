import API from '../api/api';

// Map DB snake_case \u2192 camelCase
function mapPaymentFields(raw) {
  return {
    id: String(raw.id),
    paymentCode: raw.payment_code ?? '',
    loanId: String(raw.loan_id),
    loanCode: raw.loan_code ?? String(raw.loan_id),
    amount: parseFloat(raw.amount),
    principalAmount: parseFloat(raw.principal_applied ?? 0),
    interestAmount: parseFloat(raw.interest_applied ?? 0),
    penaltyAmount: parseFloat(raw.penalty_applied ?? 0),
    paymentDate: raw.payment_date,
    notes: raw.notes ?? '',
    clientName: raw.client_name ?? raw.loan_code ?? String(raw.loan_id),
    loanStatus: raw.loan_status ?? '',
    resultingBalance: parseFloat(raw.resulting_balance ?? 0),
  };
}

export const getPayments = async () => {
  const response = await API.get('/payments');
  return response.data.data.map(mapPaymentFields);
};

export const getPaymentsByLoan = async (loanId) => {
  const response = await API.get(`/payments/loan/${loanId}`);
  return response.data.data.map(mapPaymentFields);
};

export const getPaymentById = async (id) => {
  const response = await API.get(`/payments/${id}`);
  return mapPaymentFields(response.data.data);
};

export const createPayment = async (paymentData) => {
  const response = await API.post('/payments', paymentData);
  return {
    payment: mapPaymentFields(response.data.data.payment),
    loan: response.data.data.loan,
  };
};
