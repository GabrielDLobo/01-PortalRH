import { apiService } from './api';
import {
  CepAddress,
  CreateEmployeeAccountResponse,
  EmployeeAdmissionDocument,
  EmployeeAdmissionProfile,
  EmployeeAdmissionWriteRequest,
  PreAdmission,
  PreAdmissionWriteRequest,
} from '../types/admission';

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

const BASE = '/v1/employees/employees';

class AdmissionService {
  async getMyProfile(): Promise<EmployeeAdmissionProfile> {
    return apiService.get<EmployeeAdmissionProfile>(`${BASE}/my_profile/`);
  }

  async createProfile(data: EmployeeAdmissionWriteRequest): Promise<EmployeeAdmissionProfile> {
    return apiService.post<EmployeeAdmissionProfile>(`${BASE}/create_profile/`, data);
  }

  async updateProfile(id: number, data: EmployeeAdmissionWriteRequest): Promise<EmployeeAdmissionProfile> {
    return apiService.patch<EmployeeAdmissionProfile>(`${BASE}/${id}/update_personal_info/`, data);
  }

  async lookupCep(cep: string): Promise<CepAddress> {
    return apiService.post<CepAddress>(`${BASE}/lookup_cep/`, { cep });
  }

  async uploadDocument(employeeId: number, data: {
    document_type: string;
    document_name: string;
    file: File;
    is_required?: boolean;
  }): Promise<EmployeeAdmissionDocument> {
    const formData = new FormData();
    formData.append('document_type', data.document_type);
    formData.append('document_name', data.document_name);
    formData.append('file', data.file);
    formData.append('is_required', String(data.is_required ?? true));
    return apiService.upload<EmployeeAdmissionDocument>(`${BASE}/${employeeId}/documents/`, formData);
  }

  async getDocuments(employeeId: number): Promise<PaginatedResponse<EmployeeAdmissionDocument>> {
    return apiService.get<PaginatedResponse<EmployeeAdmissionDocument>>(`${BASE}/${employeeId}/documents/`);
  }

  // Pré-admissão (RH cria o cargo/contrato; backend gera usuário + senha temporária)
  async getPreAdmissions(): Promise<PaginatedResponse<PreAdmission>> {
    return apiService.get<PaginatedResponse<PreAdmission>>('/v1/employees/pre-admissions/');
  }

  async createPreAdmission(data: PreAdmissionWriteRequest): Promise<PreAdmission> {
    return apiService.post<PreAdmission>('/v1/employees/pre-admissions/', data);
  }

  async createEmployeeAccount(preAdmissionId: number): Promise<CreateEmployeeAccountResponse> {
    return apiService.post<CreateEmployeeAccountResponse>(
      `/v1/employees/pre-admissions/${preAdmissionId}/create_employee_account/`
    );
  }

  async resendAdmissionEmail(preAdmissionId: number): Promise<{ message: string; email_sent: boolean }> {
    return apiService.post(`/v1/employees/pre-admissions/${preAdmissionId}/resend_email/`);
  }
}

export const admissionService = new AdmissionService();
