import { getStatusBgColor, getStatusColor, getStatusTextColor } from '../utils/loanHelper';

export default function StatusBadge({ status }) {
  const bgColor = getStatusBgColor(status);
  const textColor = getStatusTextColor(status);

  return (
    <span className={`status-badge ${bgColor} ${textColor}`}>
      <span className={`status-dot ${getStatusColor(status)}`}></span>
      {status}
    </span>
  );
}
