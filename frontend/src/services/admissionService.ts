import { apiService as api } from './api';

export interface EmployeeAdmissionData {
  // Personal Information
  full_name: string;
  cpf: string;
  rg: string;
  birth_date: string;
  marital_status: string;
  
  // Contact Information
  phone: string;
  email: string;
  
  // Address Information
  street_address: string;
  address_number: string;
  address_complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zip_code: string;
  
  // Work Documents
  pis_pasep?: string;
  work_card_number?: string;
  work_card_series?: string;
  
  // Education
  education_level: string;
  
  // Banking Information
  bank_name: string;
  bank_code: string;
  agency_number: string;
  account_number: string;
  account_type: string;
}

export interface DocumentUpload {
  document_type: string;
  document_name: string;
  file: File;
  is_required?: boolean;
}

export interface EmployeeDocument {
  id: number;
  document_type: string;
  document_type_display: string;
  document_name: string;
  file: string;
  file_size: number;
  file_size_mb: number;
  file_extension: string;
  is_pdf: boolean;
  is_excel: boolean;
  uploaded_at: string;
  is_required: boolean;
  is_verified: boolean;
}

export interface AdmissionProcess {
  id: number;
  status: string;
  status_display: string;
  started_at: string;
  completed_at?: string;
  notes: string;
  personal_info_completed: boolean;
  documents_uploaded: boolean;
  hr_review_completed: boolean;
  completion_percentage: number;
}

export interface Employee {
  id: number;
  employee_id: string;
  status: string;
  status_display: string;
  admission_completed: boolean;
  created_at: string;
  updated_at: string;
  
  // Personal Information
  full_name: string;
  cpf: string;
  rg: string;
  birth_date: string;
  marital_status: string;
  marital_status_display: string;
  
  // Contact Information
  phone: string;
  email: string;
  
  // Address Information
  street_address: string;
  address_number: string;
  address_complement: string;
  neighborhood: string;
  city: string;
  state: string;
  zip_code: string;
  
  // Work Documents
  pis_pasep: string;
  work_card_number: string;
  work_card_series: string;
  
  // Education
  education_level: string;
  education_level_display: string;
  
  // Banking Information
  bank_name: string;
  bank_code: string;
  agency_number: string;
  account_number: string;
  account_type: string;
  account_type_display: string;
  
  // Work Information
  department: string;
  position: string;
  hire_date?: string;
  salary?: number;
  
  // Relations
  documents: EmployeeDocument[];
  admission_process?: AdmissionProcess;
}

export interface RequiredDocument {
  type: string;
  name: string;
  required: boolean;
}

class AdmissionService {
  private baseURL = '/v1/employees';

  // Employee Profile Management
  async getMyProfile(): Promise<Employee> {
    return await api.get<Employee>(`${this.baseURL}/my_profile/`);
  }

  async createProfile(data: EmployeeAdmissionData): Promise<Employee> {
    return await api.post<Employee>(`${this.baseURL}/create_profile/`, data);
  }

  async updatePersonalInfo(employeeId: number, data: Partial<EmployeeAdmissionData>): Promise<Employee> {
    return await api.patch<Employee>(`${this.baseURL}/${employeeId}/update_personal_info/`, data);
  }

  async getAdmissionStatus(employeeId: number): Promise<AdmissionProcess> {
    return await api.get<AdmissionProcess>(`${this.baseURL}/${employeeId}/admission_status/`);
  }

  // Document Management
  async getRequiredDocuments(): Promise<RequiredDocument[]> {
    return await api.get<RequiredDocument[]>('/v1/documents/required_documents/');
  }

  async getMyDocuments(): Promise<EmployeeDocument[]> {
    return await api.get<EmployeeDocument[]>('/v1/documents/');
  }

  async uploadDocument(data: DocumentUpload): Promise<EmployeeDocument> {
    const formData = new FormData();
    formData.append('document_type', data.document_type);
    formData.append('document_name', data.document_name);
    formData.append('file', data.file);
    if (data.is_required !== undefined) {
      formData.append('is_required', data.is_required.toString());
    }

    return await api.upload<EmployeeDocument>('/v1/documents/', formData);
  }

  async deleteDocument(documentId: number): Promise<void> {
    await api.delete(`/v1/documents/${documentId}/`);
  }

  // Admission Process Management
  async getAdmissionProcesses() {
    return await api.get<AdmissionProcess[]>('/v1/admission-processes/');
  }

  async getAdmissionProcess(processId: number): Promise<AdmissionProcess> {
    return await api.get<AdmissionProcess>(`/v1/admission-processes/${processId}/`);
  }

  async updateAdmissionStatus(processId: number, status: string, notes?: string): Promise<AdmissionProcess> {
    const data: any = { status };
    if (notes) data.notes = notes;
    
    return await api.patch<AdmissionProcess>(`/v1/admission-processes/${processId}/update_status/`, data);
  }

  async getAdmissionStatistics() {
    return await api.get<any>('/v1/admission-processes/statistics/');
  }

  // CEP Lookup
  async lookupCep(cep: string): Promise<{
    zip_code: string;
    street_address: string;
    neighborhood: string;
    city: string;
    state: string;
    complement: string;
  }> {
    return await api.post(`${this.baseURL}/lookup_cep/`, { cep });
  }

  // Utility Functions
  validateCPF(cpf: string): boolean {
    // Remove formatting
    cpf = cpf.replace(/[^\d]/g, '');
    
    if (cpf.length !== 11) return false;
    
    // Check for repeated digits
    if (/^(\d)\1{10}$/.test(cpf)) return false;
    
    // Calculate first verification digit
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf[i]) * (10 - i);
    }
    let remainder = sum % 11;
    const digit1 = remainder < 2 ? 0 : 11 - remainder;
    
    if (parseInt(cpf[9]) !== digit1) return false;
    
    // Calculate second verification digit
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf[i]) * (11 - i);
    }
    remainder = sum % 11;
    const digit2 = remainder < 2 ? 0 : 11 - remainder;
    
    return parseInt(cpf[10]) === digit2;
  }

  formatCPF(cpf: string): string {
    cpf = cpf.replace(/[^\d]/g, '');
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  formatPhone(phone: string): string {
    phone = phone.replace(/[^\d]/g, '');
    if (phone.length === 11) {
      return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (phone.length === 10) {
      return phone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return phone;
  }

  formatCEP(cep: string): string {
    cep = cep.replace(/[^\d]/g, '');
    return cep.replace(/(\d{5})(\d{3})/, '$1-$2');
  }

  // File validation
  validateFile(file: File): { valid: boolean; error?: string } {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'application/pdf',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/jpeg',
      'image/jpg',
      'image/png'
    ];

    if (file.size > maxSize) {
      return { valid: false, error: 'Arquivo muito grande. Tamanho máximo: 10MB' };
    }

    if (!allowedTypes.includes(file.type)) {
      return { 
        valid: false, 
        error: 'Tipo de arquivo não permitido. Formatos aceitos: PDF, Excel, JPG, PNG' 
      };
    }

    return { valid: true };
  }

  // Get human-readable file size
  getFileSize(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  // Form validation helpers
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  validateRequired(value: string): boolean {
    return value.trim().length > 0;
  }

  // Get completion percentage for admission process
  getCompletionPercentage(employee: Employee): number {
    let completed = 0;
    const total = 3;

    // Check personal info completion
    const requiredFields = [
      'full_name', 'cpf', 'rg', 'birth_date', 'phone', 'email',
      'street_address', 'neighborhood', 'city', 'state', 'zip_code',
      'bank_name', 'bank_code', 'agency_number', 'account_number'
    ];
    
    const isPersonalInfoComplete = requiredFields.every(field => {
      const value = (employee as any)[field];
      return value && value.trim().length > 0;
    });

    if (isPersonalInfoComplete) completed++;

    // Check document uploads
    const requiredDocs = employee.documents?.filter(d => d.is_required) || [];
    if (requiredDocs.length >= 6) completed++; // Minimum required documents

    // Check HR review (from admission process)
    if (employee.admission_process?.hr_review_completed) completed++;

    return (completed / total) * 100;
  }
}

export const admissionService = new AdmissionService();