import { apiService } from './api';
import { Employee, CreateEmployeeRequest, UpdateEmployeeRequest } from '../types/employee';

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

interface EmployeeFilters {
  search?: string;
  department?: string;
  position?: string;
  status?: string;
  page?: number;
  page_size?: number;
  ordering?: string;
}

class EmployeeService {
  private readonly baseURL = '/v1/employees';

  async getEmployees(filters?: EmployeeFilters): Promise<PaginatedResponse<Employee>> {
    return await apiService.get<PaginatedResponse<Employee>>(`${this.baseURL}/`, filters);
  }

  async getEmployee(id: number): Promise<Employee> {
    return await apiService.get<Employee>(`${this.baseURL}/${id}/`);
  }

  async createEmployee(data: CreateEmployeeRequest): Promise<Employee> {
    return await apiService.post<Employee>(`${this.baseURL}/`, data);
  }

  // New method for creating employee profile with admission data
  async createEmployeeProfile(admissionData: any): Promise<any> {
    return await apiService.post<any>(`${this.baseURL}/create_profile/`, admissionData);
  }

  async updateEmployee(data: UpdateEmployeeRequest): Promise<Employee> {
    const { id, ...updateData } = data;
    
    console.log('=== EMPLOYEE SERVICE: UPDATING EMPLOYEE ===');
    console.log('Employee ID:', id);
    console.log('Update data:', updateData);
    
    try {
      const result = await apiService.patch<Employee>(`${this.baseURL}/${id}/`, updateData);
      console.log('=== EMPLOYEE SERVICE: UPDATE SUCCESSFUL ===');
      console.log('Updated employee response:', result);
      return result;
    } catch (error) {
      console.error('=== EMPLOYEE SERVICE: UPDATE FAILED ===');
      console.error('Error:', error);
      throw error;
    }
  }

  async deleteEmployee(id: number): Promise<void> {
    await apiService.delete(`${this.baseURL}/${id}/`);
  }

  async getDepartments(): Promise<string[]> {
    return await apiService.get<string[]>(`${this.baseURL}/departments/`);
  }

  async getPositions(): Promise<string[]> {
    return await apiService.get<string[]>(`${this.baseURL}/positions/`);
  }

  async getEmployeeStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    by_department: Record<string, number>;
  }> {
    return await apiService.get(`${this.baseURL}/stats/`);
  }

  // Document upload methods
  async uploadDocument(employeeId: number, file: File, documentType: string): Promise<any> {
    console.log('=== EMPLOYEE SERVICE: UPLOADING DOCUMENT ===');
    console.log('Upload details:', {
      employeeId,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      documentType,
      endpoint: `${this.baseURL}/${employeeId}/documents/`
    });

    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_type', documentType);
    formData.append('document_name', file.name);

    console.log('FormData created, sending to API...');
    console.log('API endpoint:', `${this.baseURL}/${employeeId}/documents/`);
    
    try {
      const result = await apiService.upload<any>(`${this.baseURL}/${employeeId}/documents/`, formData);
      console.log('=== EMPLOYEE SERVICE: DOCUMENT UPLOAD SUCCESSFUL ===');
      console.log('Upload response:', result);
      console.log('Document ID:', result.id);
      console.log('Document URL:', result.file);
      return result;
    } catch (error: any) {
      console.error('=== EMPLOYEE SERVICE: DOCUMENT UPLOAD FAILED ===');
      console.error('Error details:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      throw error;
    }
  }

  async getEmployeeDocuments(employeeId: number): Promise<any[]> {
    console.log('=== EMPLOYEE SERVICE: FETCHING DOCUMENTS ===');
    console.log('Employee ID:', employeeId);
    console.log('Endpoint:', `${this.baseURL}/${employeeId}/documents/`);
    
    try {
      const documents = await apiService.get<any[]>(`${this.baseURL}/${employeeId}/documents/`);
      console.log('=== EMPLOYEE SERVICE: DOCUMENTS FETCHED ===');
      console.log('Documents count:', documents.length);
      console.log('Documents:', documents);
      return documents;
    } catch (error) {
      console.error('=== EMPLOYEE SERVICE: FETCH DOCUMENTS FAILED ===');
      console.error('Error:', error);
      throw error;
    }
  }

  async deleteDocument(employeeId: number, documentId: number): Promise<void> {
    await apiService.delete(`${this.baseURL}/${employeeId}/documents/${documentId}/`);
  }

  async getRequiredDocumentTypes(): Promise<any[]> {
    console.log('=== EMPLOYEE SERVICE: FETCHING REQUIRED DOCUMENT TYPES ===');
    
    try {
      // Use a temporary employee ID (1) to get required documents endpoint
      const documents = await apiService.get<any[]>(`${this.baseURL}/1/documents/required_documents/`);
      console.log('=== EMPLOYEE SERVICE: REQUIRED DOCUMENTS FETCHED ===');
      console.log('Required document types:', documents);
      return documents;
    } catch (error) {
      console.error('=== EMPLOYEE SERVICE: FETCH REQUIRED DOCUMENTS FAILED ===');
      console.error('Error:', error);
      throw error;
    }
  }
}

export const employeeService = new EmployeeService();