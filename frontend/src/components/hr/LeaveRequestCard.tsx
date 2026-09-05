import React from 'react';
import clsx from 'clsx';
import { 
  CalendarIcon, 
  UserIcon, 
  ClockIcon,
  CheckIcon,
  XMarkIcon,
  EllipsisHorizontalIcon
} from '@heroicons/react/24/outline';
import { format, differenceInDays } from 'date-fns';
import { enUS, ptBR } from 'date-fns/locale';
import Badge from '../common/Badge';
import Button from '../common/Button';
import { useLanguage } from '../../contexts/LanguageContext';

export type LeaveStatus = 'pending' | 'approved' | 'rejected';
export type LeaveType = 'annual' | 'sick' | 'personal' | 'maternity' | 'paternity';

export interface LeaveRequest {
  id: string;
  employeeName: string;
  employeeAvatar?: string;
  leaveType: LeaveType;
  startDate: Date;
  endDate: Date;
  status: LeaveStatus;
  reason?: string;
  appliedDate: Date;
  approvedBy?: string;
  rejectedReason?: string;
  daysRequested: number;
}

interface LeaveRequestCardProps {
  request: LeaveRequest;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onViewDetails?: (id: string) => void;
  showActions?: boolean;
  compact?: boolean;
  className?: string;
}

const leaveTypeConfig = {
  annual: { color: 'bg-primary-500', icon: '🏖️' },
  sick: { color: 'bg-danger-500', icon: '🏥' },
  personal: { color: 'bg-secondary-500', icon: '👤' },
  maternity: { color: 'bg-accent-pink', icon: '🤱' },
  paternity: { color: 'bg-accent-cyan', icon: '👨‍👧' },
};

const LeaveRequestCard: React.FC<LeaveRequestCardProps> = ({
  request,
  onApprove,
  onReject,
  onViewDetails,
  showActions = true,
  compact = false,
  className,
}) => {
  const { language, t } = useLanguage();
  const locale = language === 'pt' ? ptBR : enUS;
  
  const formatDate = (date: Date) => {
    return format(date, 'MMM dd, yyyy');
  };

  const getStatusVariant = (status: LeaveStatus) => {
    switch (status) {
      case 'approved': return 'approved';
      case 'rejected': return 'rejected';
      case 'pending': return 'pending';
      default: return 'default';
    }
  };

  const leaveConfig = leaveTypeConfig[request.leaveType];

  return (
    <div
      className={clsx(
        'bg-white rounded-xl border border-neutral-200 shadow-soft hover:shadow-soft-lg transition-all duration-200',
        'animate-fade-in',
        compact ? 'p-4' : 'p-6',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          {/* Employee Avatar */}
          <div className="flex-shrink-0">
            {request.employeeAvatar ? (
              <img
                src={request.employeeAvatar}
                alt={request.employeeName}
                className={clsx(
                  'rounded-full object-cover',
                  compact ? 'h-8 w-8' : 'h-10 w-10'
                )}
              />
            ) : (
              <div className={clsx(
                'rounded-full bg-neutral-100 flex items-center justify-center',
                compact ? 'h-8 w-8' : 'h-10 w-10'
              )}>
                <UserIcon className={clsx(
                  'text-neutral-600',
                  compact ? 'h-4 w-4' : 'h-5 w-5'
                )} />
              </div>
            )}
          </div>
          
          {/* Employee Info */}
          <div>
            <h3 className={clsx(
              'font-semibold text-neutral-900',
              compact ? 'text-sm' : 'text-base'
            )}>
              {request.employeeName}
            </h3>
            <p className="text-xs text-neutral-500">
              {t('common.applied')} {format(request.appliedDate, 'MMM dd')}
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <Badge
          variant={getStatusVariant(request.status)}
          size={compact ? 'xs' : 'sm'}
          icon={true}
          className="flex-shrink-0"
        >
          {t(`leaves.${request.status}`)}
        </Badge>
      </div>

      {/* Leave Details */}
      <div className="space-y-3">
        {/* Leave Type */}
        <div className="flex items-center space-x-2">
          <div 
            className={clsx(
              'w-3 h-3 rounded-full',
              leaveConfig.color
            )}
          />
          <span className="text-sm font-medium text-neutral-700">
            {leaveConfig.icon} {t(`leaves.${request.leaveType}`)}
          </span>
          <span className="text-xs text-neutral-500">
            • {request.daysRequested} {t('common.days')}
          </span>
        </div>

        {/* Date Range */}
        <div className="flex items-center space-x-2 text-sm text-neutral-600">
          <CalendarIcon className="h-4 w-4" />
          <span>
            {formatDate(request.startDate)} - {formatDate(request.endDate)}
          </span>
        </div>

        {/* Reason (if provided) */}
        {request.reason && !compact && (
          <div className="bg-neutral-50 rounded-lg p-3">
            <p className="text-sm text-neutral-700 italic">
              "{request.reason}"
            </p>
          </div>
        )}

        {/* Approval/Rejection Info */}
        {request.status === 'approved' && request.approvedBy && (
          <div className="flex items-center space-x-2 text-xs text-success-600">
            <CheckIcon className="h-3 w-3" />
            <span>
              {t('common.approvedBy')} {request.approvedBy}
            </span>
          </div>
        )}

        {request.status === 'rejected' && request.rejectedReason && (
          <div className="bg-danger-50 rounded-lg p-2">
            <p className="text-xs text-danger-700">
              <strong>{t('common.reason')}:</strong> {request.rejectedReason}
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      {showActions && request.status === 'pending' && (onApprove || onReject) && (
        <div className={clsx(
          'flex items-center justify-end space-x-2 pt-4 border-t border-neutral-100',
          compact ? 'mt-3' : 'mt-4'
        )}>
          {onReject && (
            <Button
              variant="secondary"
              size={compact ? 'sm' : 'md'}
              onClick={() => onReject(request.id)}
              icon={<XMarkIcon className="h-4 w-4" />}
              className="hover:bg-danger-50 hover:text-danger-700 hover:border-danger-200"
            >
              {t('leaves.rejectLeave')}
            </Button>
          )}
          
          {onApprove && (
            <Button
              variant="success"
              size={compact ? 'sm' : 'md'}
              onClick={() => onApprove(request.id)}
              icon={<CheckIcon className="h-4 w-4" />}
            >
              {t('leaves.approveLeave')}
            </Button>
          )}
        </div>
      )}

      {/* View Details Button */}
      {onViewDetails && (
        <div className="flex justify-center pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewDetails(request.id)}
            icon={<EllipsisHorizontalIcon className="h-4 w-4" />}
          >
            {t('common.viewDetails')}
          </Button>
        </div>
      )}
    </div>
  );
};

export default LeaveRequestCard;