// Contrato real da API do app `staff` (staff/serializers.py, staff/views.py).
// Não usar frontend/src/types/employee.ts para telas novas: aquele arquivo
// descreve um contrato que não bate com o backend (ver Fase 3 do CLAUDE.md).

export type EmployeeStatus = 'ativo' | 'inativo' | 'ferias' | 'afastado';

export interface StaffEmployeeListItem {
  id: number;
  user: number;
  user_email: string;
  nome: string;
  cargo: string;
  setor: string;
  status: EmployeeStatus;
  status_display: string;
  data_admissao: string;
  salario_display: string;
  years_of_service: number;
}

export interface StaffEmployeeDocument {
  id: number;
  employee: number;
  tipo: string;
  tipo_display: string;
  nome: string;
  arquivo: string;
  descricao: string;
  uploaded_by: number | null;
  uploaded_by_name: string | null;
  created_at: string;
}

export interface StaffEmployeeDetail {
  id: number;
  user: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    full_name: string;
    role: 'admin_rh' | 'funcionario';
    role_display: string;
    is_active: boolean;
  };
  user_id: number;
  nome: string;
  cargo: string;
  setor: string;
  data_admissao: string;
  data_demissao: string | null;
  salario: string;
  salario_display: string;
  cpf: string;
  rg: string;
  telefone: string;
  endereco: string;
  data_nascimento: string;
  status: EmployeeStatus;
  status_display: string;
  observacoes: string;
  foto: string | null;
  years_of_service: number;
  documents: StaffEmployeeDocument[];
  created_at: string;
  updated_at: string;
}

export interface StaffEmployeeWriteRequest {
  nome: string;
  cargo: string;
  setor: string;
  data_admissao: string;
  data_demissao?: string | null;
  salario: number | string;
  cpf: string;
  rg: string;
  telefone: string;
  endereco: string;
  data_nascimento: string;
  status?: EmployeeStatus;
  observacoes?: string;
}

export interface StaffEmployeeStats {
  total_employees: number;
  active_employees: number;
  inactive_employees: number;
  employees_on_leave: number;
  departments_count: number;
  average_salary: string;
  average_years_service: string;
}

export interface Department {
  id: number;
  nome: string;
  descricao: string;
  employee_count: number;
  created_at: string;
  updated_at: string;
}
