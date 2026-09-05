import { api } from './api';

export interface PreAdmissionData {
  id?: number;
  personal_email: string;
  full_name: string;
  position: string;
  job_description: string;
  work_schedule: string;
  weekly_workload: string;
  contract_type: string;
  salary: string;
  benefits: string;
  start_date: string;
  vacation_policy: string;
  direct_manager: string;
  created_by?: number;
  created_by_name?: string;
  employee_user_created?: boolean;
  email_sent?: boolean;
  employee?: number;
  employee_name?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateEmployeeAccountResponse {
  message: string;
  employee_id: number;
  email_sent: boolean;
  login_email: string;
  temporary_password?: string;
}

export interface PreAdmissionStats {
  total_pre_admissions: number;
  accounts_created: number;
  emails_sent: number;
  pending_accounts: number;
}

class PreAdmissionService {
  private readonly baseURL = '/api/employees/pre-admissions';

  async getAll(): Promise<PreAdmissionData[]> {
    const response = await api.get(this.baseURL);
    return response.data.results || response.data;
  }

  async getById(id: number): Promise<PreAdmissionData> {
    const response = await api.get(`${this.baseURL}/${id}/`);
    return response.data;
  }

  async create(data: Partial<PreAdmissionData>): Promise<PreAdmissionData> {
    const response = await api.post(this.baseURL, data);
    return response.data;
  }

  async update(id: number, data: Partial<PreAdmissionData>): Promise<PreAdmissionData> {
    const response = await api.patch(`${this.baseURL}/${id}/`, data);
    return response.data;
  }

  async delete(id: number): Promise<void> {
    await api.delete(`${this.baseURL}/${id}/`);
  }

  async createEmployeeAccount(id: number): Promise<CreateEmployeeAccountResponse> {
    const response = await api.post(`${this.baseURL}/${id}/create_employee_account/`);
    return response.data;
  }

  async resendEmail(id: number): Promise<{ message: string; email_sent: boolean }> {
    const response = await api.post(`${this.baseURL}/${id}/resend_email/`);
    return response.data;
  }

  async getPendingAccounts(): Promise<PreAdmissionData[]> {
    const response = await api.get(`${this.baseURL}/pending_accounts/`);
    return response.data;
  }

  async getStatistics(): Promise<PreAdmissionStats> {
    const response = await api.get(`${this.baseURL}/statistics/`);
    return response.data;
  }
}

export default new PreAdmissionService();