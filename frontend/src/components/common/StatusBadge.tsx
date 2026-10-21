import React from 'react';

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  let colorStyles = 'bg-surface-elevated text-text-muted border-border';

  switch (status) {
    case 'CONFIRMED':
    case 'APPROVED':
    case 'PAID':
    case 'ACCEPTED':
    case 'RESOLVED':
      colorStyles = 'bg-success-subtle text-success border-success/30 font-semibold';
      break;
    case 'PENDING':
    case 'PENDING_REVIEW':
    case 'IN_PROGRESS':
    case 'PARTIAL':
      colorStyles = 'bg-warning-subtle text-warning border-warning/30 font-semibold';
      break;
    case 'CANCELLED':
    case 'REJECTED':
    case 'DECLINED':
    case 'REFUNDED':
      colorStyles = 'bg-danger-subtle text-danger border-danger/30 font-semibold';
      break;
    default:
      colorStyles = 'bg-surface-elevated text-text-secondary border-border';
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border tracking-wide uppercase ${colorStyles}`}
    >
      {status.replace(/_/g, ' ')}
    </span>
  );
};
