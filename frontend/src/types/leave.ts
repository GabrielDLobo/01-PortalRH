export interface LeaveRequest {
  id: number;
  employee: {
    id: number;
    user: {
      first_name: string;
      last_name: string;
      email: string;
    };
    employee_id: string;
    department: string;
    position: string;
  };
  leave_type: 'annual' | 'sick' | 'personal' | 'maternity' | 'paternity';
  start_date: string;
  end_date: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approved_by?: {
    id: number;
    first_name: string;
    last_name: string;
  };
  created_at: string;
  updated_at: string;
  days_requested: number;
  // Vacation-specific fields
  dias_gozo?: number;
  tem_abono_pecuniario?: boolean;
  dias_abono_pecuniario?: number;
}

export interface CreateLeaveRequest {
  leave_type: string;
  start_date: string;
  end_date?: string;  // Made optional since it can be auto-calculated
  reason: string;
  // Vacation-specific fields
  dias_gozo?: number;
  tem_abono_pecuniario?: boolean;
  dias_abono_pecuniario?: number;
}

export interface UpdateLeaveRequest {
  id: number;
  status: 'approved' | 'rejected';
  admin_notes?: string;
}