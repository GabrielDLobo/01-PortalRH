// Contrato real do app `leave_requests` (leave_requests/serializers.py).

export type LeaveStatus = 'pendente' | 'aprovada' | 'rejeitada' | 'cancelada';
export type LeavePriority = 'baixa' | 'media' | 'alta' | 'urgente';

export interface LeaveType {
  id: number;
  nome: string;
  descricao: string;
  max_dias_ano: number;
  requer_aprovacao: boolean;
  antecedencia_minima: number;
  ativo: boolean;
}

export interface LeaveRequestListItem {
  id: number;
  solicitante: number;
  solicitante_name: string;
  tipo: number;
  tipo_name: string;
  data_inicio: string;
  data_fim: string;
  dias_solicitados: number;
  status: LeaveStatus;
  status_display: string;
  prioridade: LeavePriority;
  prioridade_display: string;
  aprovador: number | null;
  aprovador_name: string | null;
  data_aprovacao: string | null;
  created_at: string;
  dias_gozo: number | null;
  tem_abono_pecuniario: boolean;
  dias_abono_pecuniario: number | null;
}

export interface LeaveRequestDetail extends Omit<LeaveRequestListItem, 'solicitante_name' | 'tipo_name' | 'aprovador_name'> {
  solicitante_info: { id: number; first_name: string; last_name: string; email: string };
  tipo_info: LeaveType;
  aprovador_info: { id: number; first_name: string; last_name: string; email: string } | null;
  motivo: string;
  observacoes: string;
  comentario_aprovacao: string;
  anexo: string | null;
  is_pending: boolean;
  is_approved: boolean;
  is_rejected: boolean;
  updated_at: string;
}

export interface CreateLeaveRequest {
  tipo: number;
  data_inicio: string;
  data_fim?: string;
  motivo: string;
  observacoes?: string;
  prioridade?: LeavePriority;
  dias_gozo?: number;
  tem_abono_pecuniario?: boolean;
  dias_abono_pecuniario?: number;
}

export interface LeaveBalance {
  id: number;
  funcionario: number;
  funcionario_name: string;
  tipo: number;
  tipo_name: string;
  ano: number;
  dias_disponiveis: number;
  dias_utilizados: number;
  dias_restantes: number;
}
