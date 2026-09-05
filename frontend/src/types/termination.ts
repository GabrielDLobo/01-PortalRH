export interface TerminationReason {
  id: number;
  nome: string;
  codigo: string;
  descricao: string;
  requer_aviso_previo: boolean;
  permite_saque_fgts: boolean;
  gera_multa_fgts: boolean;
  direito_seguro_desemprego: boolean;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface TerminationRequest {
  id: number;
  funcionario: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
  funcionario_name?: string;
  funcionario_email?: string;
  solicitante: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
  solicitante_name?: string;
  motivo: TerminationReason;
  motivo_nome?: string;
  motivo_codigo?: string;
  data_ultimo_dia: string;
  data_desligamento: string;
  justificativa: string;
  observacoes_rh: string;
  tem_aviso_previo: boolean;
  dias_aviso_previo: number | null;
  aviso_previo_indenizado: boolean;
  tem_ferias_vencidas: boolean;
  dias_ferias_vencidas: number | null;
  tem_ferias_proporcionais: boolean;
  dias_ferias_proporcionais: number | null;
  tem_decimo_proporcional: boolean;
  possui_equipamentos: boolean;
  lista_equipamentos: string;
  possui_acessos_sistemas: boolean;
  lista_acessos: string;
  urgencia: 'normal' | 'urgente' | 'critica';
  urgencia_display?: string;
  status: 'rascunho' | 'pendente_rh' | 'aprovada_rh' | 'rejeitada_rh' | 'processando' | 'concluida' | 'cancelada';
  status_display?: string;
  aprovador_rh: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  } | null;
  aprovador_rh_name?: string;
  data_aprovacao_rh: string | null;
  comentario_aprovacao_rh: string;
  valor_rescisao: number | null;
  anexo_documentos: string | null;
  total_dias_ferias?: number;
  is_draft?: boolean;
  is_pending_hr?: boolean;
  is_approved?: boolean;
  is_completed?: boolean;
  can_be_edited?: boolean;
  checklist_items?: TerminationChecklist[];
  documents?: TerminationDocument[];
  created_at: string;
  updated_at: string;
}

export interface TerminationChecklist {
  id: number;
  termination_request: number;
  categoria: 'documentacao' | 'equipamentos' | 'acessos' | 'financeiro' | 'legal' | 'outros';
  categoria_display?: string;
  descricao: string;
  obrigatorio: boolean;
  concluido: boolean;
  responsavel: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  } | null;
  responsavel_name?: string;
  data_conclusao: string | null;
  observacoes: string;
  created_at: string;
  updated_at: string;
}

export interface TerminationDocument {
  id: number;
  termination_request: number;
  tipo_documento: 'trct' | 'aviso_previo' | 'carta_desligamento' | 'termo_devolucao' | 'quitacao' | 'outros';
  tipo_documento_display?: string;
  nome_arquivo: string;
  arquivo: string;
  gerado_automaticamente: boolean;
  gerado_por: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  } | null;
  gerado_por_name?: string;
  observacoes: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTerminationRequest {
  funcionario: number;
  motivo: number;
  data_ultimo_dia: string;
  data_desligamento: string;
  justificativa: string;
  tem_aviso_previo: boolean;
  dias_aviso_previo?: number | null;
  aviso_previo_indenizado: boolean;
  tem_ferias_vencidas: boolean;
  dias_ferias_vencidas?: number | null;
  tem_ferias_proporcionais: boolean;
  dias_ferias_proporcionais?: number | null;
  tem_decimo_proporcional: boolean;
  possui_equipamentos: boolean;
  lista_equipamentos?: string;
  possui_acessos_sistemas: boolean;
  lista_acessos?: string;
  urgencia: 'normal' | 'urgente' | 'critica';
  anexo_documentos?: File | null;
}

export interface UpdateTerminationRequest extends Partial<CreateTerminationRequest> {
  id: number;
}

export interface TerminationApproval {
  action: 'approve' | 'reject';
  comentario?: string;
}

export interface TerminationStats {
  total: number;
  rascunho: number;
  pendente_rh: number;
  aprovada_rh: number;
  rejeitada_rh: number;
  processando: number;
  concluida: number;
  cancelada: number;
  normal: number;
  urgente: number;
  critica: number;
  por_mes: Array<{
    mes: string;
    count: number;
  }>;
}