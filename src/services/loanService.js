import API from '../api/api';

// Map DB snake_case \u2192 camelCase for frontend components.
export function mapLoanFields(raw) {
  return {
    id:                   raw.id,
    clientId:             raw.client_id,
    clientName:           raw.client_name ?? raw.client_id,
    amount:               parseFloat(raw.amount),
    interestRate:         parseFloat(raw.interest_rate),
    interestType:         raw.interest_type,
    totalRepayment:       parseFloat(raw.total_repayment),
    totalInterest:        parseFloat(raw.total_interest),
    remainingBalance:     parseFloat(raw.remaining_balance),
    startDate:            raw.start_date,
    dueDate:              raw.due_date,
    gracePeriodEndDate:   raw.grace_period_end_date,
    duration:             raw.duration,
    gracePeriod:          raw.grace_period,
    status:               raw.status,
    repaymentStructure:   raw.repayment_structure,
    collateralDescription: raw.collateral_description ?? '\u2014',
    collateralValue:      raw.collateral_value ? parseFloat(raw.collateral_value) : 0,
    notes:                raw.notes ?? '',
    progress:             parseFloat(raw.progress ?? 0),
    installmentAmount:    parseFloat(raw.installment_amount ?? 0),
    penaltyBalance:       parseFloat(raw.penalty_balance ?? 0),
    totalOutstanding:     parseFloat(raw.total_outstanding ?? raw.remaining_balance ?? 0),
    daysOverdue:          parseInt(raw.days_overdue ?? 0, 10),
    daysUntilDue:         parseInt(raw.days_until_due ?? 0, 10),
  };
}

const hasOwn = (obj, key) => Object.prototype.hasOwnProperty.call(obj || {}, key);

const readField = (obj, snakeCaseKey, camelCaseKey) => {
  if (hasOwn(obj, snakeCaseKey)) return obj[snakeCaseKey];
  if (camelCaseKey && hasOwn(obj, camelCaseKey)) return obj[camelCaseKey];
  return undefined;
};

const normalizeLoanUpdatePayload = (loanData = {}) => {
  const normalized = {};
  const mappings = [
    ['amount', 'amount'],
    ['interest_rate', 'interestRate'],
    ['interest_type', 'interestType'],
    ['repayment_structure', 'repaymentStructure'],
    ['duration', 'duration'],
    ['grace_period', 'gracePeriod'],
    ['notes', 'notes'],
    ['status', 'status'],
    ['collateral_description', 'collateralDescription'],
    ['collateral_value', 'collateralValue'],
  ];

  mappings.forEach(([snake, camel]) => {
    const value = readField(loanData, snake, camel);
    if (value !== undefined) normalized[snake] = value;
  });

  return normalized;
};

export const getLoans = async () => {
  const response = await API.get('/loans');
  return response.data.data.map(mapLoanFields);
};

export const getOverdueLoans = async () => {
  const response = await API.get('/loans/overdue');
  return response.data.data.map(mapLoanFields);
};

export const getLoanById = async (id) => {
  const response = await API.get(`/loans/${id}`);
  return mapLoanFields(response.data.data);
};

export const quoteLoan = async (payload) => {
  const response = await API.post('/loans/quote', payload);
  return response.data.data;
};

export const createLoan = async (loanData) => {
  const response = await API.post('/loans', loanData);
  return response.data.data;
};

export const updateLoan = async (id, loanData) => {
  const payload = normalizeLoanUpdatePayload(loanData);
  try {
    console.debug(`[loanService] Updating loan ${id}`, payload);
    const response = await API.put(`/loans/${id}`, payload);
    return response.data.data;
  } catch (error) {
    console.error(`[loanService] Failed to update loan ${id}`, {
      payload,
      status: error.response?.status,
      response: error.response?.data,
      message: error.message,
    });
    throw error;
  }
};

export const deleteLoan = async (id) => {
  const response = await API.delete(`/loans/${id}`);
  return response.data;
};
