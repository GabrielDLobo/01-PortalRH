export interface Employee {
  id: number;
  user: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    is_active: boolean;
  };
  employee_id: string;
  status: 'active' | 'inactive' | 'terminated' | 'pending' | 'under_review' | 'approved' | 'cancelled';
  admission_completed?: boolean;
  created_at: string;
  updated_at: string;
  
  // Personal Information
  full_name?: string;
  cpf?: string;
  rg?: string;
  birth_date?: string;
  marital_status?: string;
  
  // Contact Information  
  phone?: string;
  email?: string;
  
  // Address Information
  street_address?: string;
  address_number?: string;
  address_complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  
  // Work Documents
  pis_pasep?: string;
  work_card_number?: string;
  work_card_series?: string;
  
  // Education
  education_level?: string;
  
  // Banking Information
  bank_name?: string;
  bank_code?: string;
  agency_number?: string;
  account_number?: string;
  account_type?: string;
  
  // Work Information
  department: string;
  position: string;
  hire_date: string;
  salary?: number;
  
  // Legacy fields for compatibility
  date_of_birth?: string;
  address?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
}

export interface CreateEmployeeRequest {
  email: string;
  first_name: string;
  last_name: string;
  employee_id: string;
  phone?: string;
  date_of_birth?: string;
  hire_date: string;
  department: string;
  position: string;
  salary?: number;
  address?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
}

export interface UpdateEmployeeRequest extends Partial<CreateEmployeeRequest> {
  id: number;
  status?: 'active' | 'inactive' | 'terminated' | 'pending' | 'under_review' | 'approved' | 'cancelled';
  admission_completed?: boolean;
}