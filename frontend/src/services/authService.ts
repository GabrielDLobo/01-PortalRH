import { apiService } from './api';
import { User, LoginRequest, LoginResponse } from '../types/auth';

class AuthService {
  async login(email: string, password: string): Promise<LoginResponse> {
    const loginData: LoginRequest = { email, password };
    return await apiService.post<LoginResponse>('/v1/accounts/auth/login/', loginData);
  }

  async getCurrentUser(): Promise<User> {
    return await apiService.get<User>('/v1/accounts/users/profile/', {});
  }

  async logout(): Promise<void> {
    try {
      // No specific logout endpoint needed for JWT
      // Just clear local storage
      localStorage.removeItem('portalrh-token');
      localStorage.removeItem('portalrh-refresh-token');
    } catch (error) {
      console.warn('Logout cleanup failed, but clearing local storage');
    }
  }

  async refreshToken(): Promise<{ access: string }> {
    const refreshToken = localStorage.getItem('portalrh-refresh-token');
    return await apiService.post<{ access: string }>('/v1/accounts/auth/refresh/', {
      refresh: refreshToken,
    });
  }

  async forgotPassword(email: string): Promise<void> {
    await apiService.post('/v1/accounts/auth/forgot-password/', { email });
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await apiService.post('/v1/accounts/auth/reset-password/', {
      token,
      password: newPassword,
    });
  }

  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<{ message: string }> {
    return await apiService.post('/v1/accounts/users/change_password/', {
      old_password: currentPassword,
      new_password: newPassword,
      new_password_confirm: newPassword,
    });
  }

  // A ação "profile" do UserViewSet só aceita GET; a atualização de fato
  // passa pelo update/partial_update padrão em /users/{id}/.
  async updateProfile(userId: number, data: Partial<Pick<User, 'first_name' | 'last_name'>>): Promise<User> {
    return await apiService.patch<User>(`/v1/accounts/users/${userId}/`, data);
  }

  async checkPasswordChangeRequired(): Promise<{ requires_password_change: boolean }> {
    return await apiService.get<{ requires_password_change: boolean }>('/v1/accounts/auth/check-password-change-required/');
  }

  async firstLoginPasswordChange(newPassword: string, confirmPassword: string): Promise<{ message: string }> {
    return await apiService.post<{ message: string }>('/v1/accounts/auth/first-login-password-change/', {
      new_password: newPassword,
      new_password_confirm: confirmPassword,
    });
  }
}

export const authService = new AuthService();