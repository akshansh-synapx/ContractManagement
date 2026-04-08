import type { RequestStatus } from '../types';
import { getStatusLabel } from '../utils/helpers';

interface StatusBadgeProps {
  status: RequestStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`status-badge ${status}`}>
      {getStatusLabel(status)}
    </span>
  );
}
