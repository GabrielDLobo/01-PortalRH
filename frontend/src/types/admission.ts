// Contrato real do app `employees` (employees/serializers.py, employees/views.py).
// employees.Employee é o perfil de ONBOARDING que o próprio funcionário preenche
// (dados pessoais, endereço, dados bancários, documentos). Não confundir com
// staff.Employee (types/staff.ts), o registro operacional mantido pelo RH.

export interface EmployeeAdmissionDocument {
  id: number;
  document_type: string;
  document_type_display: string;
  document_name: string;
  file: string;
  file_size: number;
  file_size_mb: number;
  is_required: boolean;
  is_verified: boolean;
  uploaded_at: string;
}

export interface AdmissionProcess {
  id: number;
  status: string;
  status_display: string;
  started_at: string;
  completed_at: string | null;
  notes: string;
  personal_info_completed: boolean;
  documents_uploaded: boolean;
  hr_review_completed: boolean;
  completion_percentage: number;
}

export interface EmployeeAdmissionProfile {
  id: number;
  user: { id: number; username: string; email: string; first_name: string; last_name: string };
  employee_id: string;
  status: string;
  status_display: string;
  admission_completed: boolean;
  full_name: string | null;
  cpf: string | null;
  rg: string | null;
  birth_date: string | null;
  marital_status: string | null;
  marital_status_display: string | null;
  phone: string | null;
  email: string | null;
  street_address: string | null;
  address_number: string | null;
  address_complement: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  pis_pasep: string | null;
  work_card_number: string | null;
  work_card_series: string | null;
  education_level: string | null;
  education_level_display: string | null;
  bank_name: string | null;
  bank_code: string | null;
  agency_number: string | null;
  account_number: string | null;
  account_type: string;
  account_type_display: string;
  department: string;
  position: string;
  hire_date: string | null;
  salary: string | null;
  documents: EmployeeAdmissionDocument[];
  admission_process: AdmissionProcess | null;
}

export interface EmployeeAdmissionWriteRequest {
  full_name?: string;
  cpf?: string;
  rg?: string;
  birth_date?: string;
  marital_status?: string;
  phone?: string;
  email?: string;
  street_address?: string;
  address_number?: string;
  address_complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  pis_pasep?: string;
  work_card_number?: string;
  work_card_series?: string;
  education_level?: string;
  bank_name?: string;
  bank_code?: string;
  agency_number?: string;
  account_number?: string;
  account_type?: string;
}

export interface CepAddress {
  zip_code: string;
  street_address: string;
  neighborhood: string;
  city: string;
  state: string;
  complement: string;
}

export interface PreAdmission {
  id: number;
  personal_email: string;
  full_name: string;
  position: string;
  department: string;
  job_description: string;
  work_schedule: string;
  weekly_workload: string;
  weekly_workload_display: string;
  contract_type: string;
  contract_type_display: string;
  salary: string;
  benefits: string;
  start_date: string;
  vacation_policy: string;
  direct_manager: string;
  created_by: number;
  created_by_name: string;
  employee_user_created: boolean;
  email_sent: boolean;
  employee: number | null;
  employee_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface PreAdmissionWriteRequest {
  personal_email: string;
  full_name: string;
  position: string;
  department?: string;
  job_description: string;
  work_schedule: string;
  weekly_workload: string;
  contract_type: string;
  salary: string;
  benefits?: string;
  start_date: string;
  vacation_policy?: string;
  direct_manager: string;
}

export interface CreateEmployeeAccountResponse {
  message: string;
  employee_id: number;
  email_sent: boolean;
  login_email: string;
  temporary_password?: string;
}

export const CONTRACT_TYPES = [
  { value: 'clt', label: 'CLT' },
  { value: 'temporary', label: 'Temporário' },
  { value: 'internship', label: 'Estágio' },
  { value: 'freelancer', label: 'Freelancer' },
  { value: 'pj', label: 'Pessoa Jurídica' },
];

export const WORKLOAD_OPTIONS = [
  { value: '20h', label: '20 horas semanais' },
  { value: '30h', label: '30 horas semanais' },
  { value: '40h', label: '40 horas semanais' },
  { value: '44h', label: '44 horas semanais' },
];

export const MARITAL_STATUS_OPTIONS = [
  { value: 'single', label: 'Solteiro(a)' },
  { value: 'married', label: 'Casado(a)' },
  { value: 'divorced', label: 'Divorciado(a)' },
  { value: 'widowed', label: 'Viúvo(a)' },
  { value: 'stable_union', label: 'União Estável' },
];

export const EDUCATION_LEVEL_OPTIONS = [
  { value: 'elementary', label: 'Ensino Fundamental' },
  { value: 'high_school', label: 'Ensino Médio' },
  { value: 'technical', label: 'Técnico' },
  { value: 'undergraduate', label: 'Superior' },
  { value: 'postgraduate', label: 'Pós-graduação' },
  { value: 'masters', label: 'Mestrado' },
  { value: 'doctorate', label: 'Doutorado' },
];

export const ACCOUNT_TYPE_OPTIONS = [
  { value: 'checking', label: 'Corrente' },
  { value: 'savings', label: 'Poupança' },
];

export const REQUIRED_DOCUMENT_TYPES: { value: string; label: string; required: boolean }[] = [
  { value: 'rg', label: 'RG', required: true },
  { value: 'birth_certificate', label: 'Certidão de Nascimento', required: true },
  { value: 'education_certificate', label: 'Comprovante de Escolaridade', required: true },
  { value: 'work_card', label: 'Carteira de Trabalho', required: true },
  { value: 'medical_exam', label: 'Exame Admissional', required: true },
  { value: 'bank_document', label: 'Comprovante Bancário', required: false },
  { value: 'address_proof', label: 'Comprovante de Endereço', required: false },
  { value: 'marriage_certificate', label: 'Certidão de Casamento', required: false },
  { value: 'other', label: 'Outros', required: false },
];
