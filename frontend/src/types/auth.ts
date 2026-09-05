export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  role: 'admin_rh' | 'funcionario';
  role_display: string;
  is_active: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
  avatar?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  access: string;
  refresh: string;
  requires_password_change?: boolean;
}

export interface AuthError {
  message: string;
  field?: string;
}