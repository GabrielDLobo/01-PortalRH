export const LEAVE_TYPES = {
  annual: 'Annual Leave',
  sick: 'Sick Leave',
  personal: 'Personal Leave',
  maternity: 'Maternity Leave',
  paternity: 'Paternity Leave',
} as const;

export const LEAVE_TYPES_PT = {
  annual: 'Férias',
  sick: 'Licença Médica',
  personal: 'Licença Pessoal',
  maternity: 'Licença Maternidade',
  paternity: 'Licença Paternidade',
} as const;

export const LEAVE_STATUS = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
} as const;

export const LEAVE_STATUS_PT = {
  pending: 'Pendente',
  approved: 'Aprovado',
  rejected: 'Rejeitado',
} as const;

export const EVALUATION_RATINGS = {
  1: 'Unsatisfactory',
  2: 'Needs Improvement',
  3: 'Satisfactory',
  4: 'Good',
  5: 'Excellent',
} as const;

export const EVALUATION_RATINGS_PT = {
  1: 'Insatisfatório',
  2: 'Precisa Melhorar',
  3: 'Satisfatório',
  4: 'Bom',
  5: 'Excelente',
} as const;

export const USER_ROLES = {
  admin: 'Administrator',
  manager: 'Manager',
  employee: 'Employee',
} as const;

export const USER_ROLES_PT = {
  admin: 'Administrador',
  manager: 'Gerente',
  employee: 'Funcionário',
} as const;

export const EMPLOYEE_STATUS = {
  active: 'Active',
  inactive: 'Inactive',
  terminated: 'Terminated',
} as const;

export const EMPLOYEE_STATUS_PT = {
  active: 'Ativo',
  inactive: 'Inativo',
  terminated: 'Desligado',
} as const;

export const DEPARTMENTS = [
  'Human Resources',
  'Information Technology',
  'Finance',
  'Marketing',
  'Sales',
  'Operations',
  'Legal',
  'Customer Service',
  'Research & Development',
  'Quality Assurance',
] as const;

export const DEPARTMENTS_PT = [
  'Recursos Humanos',
  'Tecnologia da Informação',
  'Financeiro',
  'Marketing',
  'Vendas',
  'Operações',
  'Jurídico',
  'Atendimento ao Cliente',
  'Pesquisa & Desenvolvimento',
  'Controle de Qualidade',
] as const;

export const DATE_FORMAT = 'dd/MM/yyyy';
export const DATETIME_FORMAT = 'dd/MM/yyyy HH:mm';
export const TIME_FORMAT = 'HH:mm';

export const PAGINATION_SIZES = [10, 25, 50, 100] as const;
export const DEFAULT_PAGE_SIZE = 25;

export const FILE_UPLOAD_MAX_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];
export const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
];

export const TOAST_DURATION = 4000; // 4 seconds

export const COLORS = {
  primary: '#2563eb',
  secondary: '#16a34a',
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  neutral: '#64748b',
} as const;