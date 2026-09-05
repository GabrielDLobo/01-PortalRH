import React from 'react';
import Badge from '../common/Badge';
import { useLanguage } from '../../contexts/LanguageContext';

export type EmployeeStatus = 'active' | 'inactive' | 'on_leave' | 'pending' | 'terminated';

interface EmployeeStatusBadgeProps {
  status: EmployeeStatus;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
  showIcon?: boolean;
  showDot?: boolean;
}

const statusConfig = {
  active: {
    variant: 'active' as const,
    translationKey: 'employees.active'
  },
  inactive: {
    variant: 'inactive' as const,
    translationKey: 'employees.inactive'
  },
  on_leave: {
    variant: 'leave' as const,
    translationKey: 'leaves.onLeave'
  },
  pending: {
    variant: 'pending' as const,
    translationKey: 'employees.pending'
  },
  terminated: {
    variant: 'danger' as const,
    translationKey: 'employees.terminated'
  }
};

const EmployeeStatusBadge: React.FC<EmployeeStatusBadgeProps> = ({
  status,
  size = 'sm',
  className,
  showIcon = false,
  showDot = true,
}) => {
  const { t } = useLanguage();
  const config = statusConfig[status];

  return (
    <Badge
      variant={config.variant}
      size={size}
      className={className}
      icon={showIcon}
      dot={showDot}
      pulse={status === 'pending'}
    >
      {t(config.translationKey)}
    </Badge>
  );
};

export default EmployeeStatusBadge;