// Utility functions for loan status and formatting

export function getStatusColor(status) {
  switch (status) {
    case 'Active':
      return 'status-color-active';
    case 'Due Soon':
      return 'status-color-due';
    case 'Overdue':
      return 'status-color-overdue';
    case 'Completed':
      return 'status-color-completed';
    case 'Defaulted':
      return 'status-color-defaulted';
    default:
      return 'status-color-completed';
  }
}

export function getStatusTextColor(status) {
  switch (status) {
    case 'Active':
      return 'status-text-active';
    case 'Due Soon':
      return 'status-text-due';
    case 'Overdue':
      return 'status-text-overdue';
    case 'Completed':
      return 'status-text-completed';
    case 'Defaulted':
      return 'status-text-defaulted';
    default:
      return 'status-text-completed';
  }
}

export function getStatusBgColor(status) {
  switch (status) {
    case 'Active':
      return 'status-bg-active';
    case 'Due Soon':
      return 'status-bg-due';
    case 'Overdue':
      return 'status-bg-overdue';
    case 'Completed':
      return 'status-bg-completed';
    case 'Defaulted':
      return 'status-bg-defaulted';
    default:
      return 'status-bg-completed';
  }
}

export function calculateLoanProgress(loan) {
  const paid = loan.totalRepayment - loan.remainingBalance;
  return (paid / loan.totalRepayment) * 100;
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-ZM', {
    style: 'currency',
    currency: 'ZMW',
    minimumFractionDigits: 2
  }).format(amount);
}

export function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export function getDaysUntilDue(dueDate) {
  const due = new Date(dueDate);
  const today = new Date();
  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

export function getDaysOverdue(dueDate) {
  const days = getDaysUntilDue(dueDate);
  return days < 0 ? Math.abs(days) : 0;
}
