import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/auth';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  requiresPasswordChange: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
  checkPasswordChangeRequired: () => Promise<boolean>;
  handleFirstLoginPasswordChange: (newPassword: string, confirmPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [requiresPasswordChange, setRequiresPasswordChange] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('portalrh-token');
      if (token) {
        try {
          const userData = await authService.getCurrentUser();
          setUser(userData);
        } catch (error) {
          localStorage.removeItem('portalrh-token');
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const loginResponse = await authService.login(email, password);
    localStorage.setItem('portalrh-token', loginResponse.access);
    localStorage.setItem('portalrh-refresh-token', loginResponse.refresh);
    setUser(loginResponse.user);
    
    // Check if password change is required
    if (loginResponse.requires_password_change) {
      setRequiresPasswordChange(true);
    }
  };

  const logout = () => {
    localStorage.removeItem('portalrh-token');
    localStorage.removeItem('portalrh-refresh-token');
    setUser(null);
    authService.logout();
  };

  const updateUser = (userData: User) => {
    setUser(userData);
  };

  const checkPasswordChangeRequired = async (): Promise<boolean> => {
    try {
      const response = await authService.checkPasswordChangeRequired();
      setRequiresPasswordChange(response.requires_password_change);
      return response.requires_password_change;
    } catch (error) {
      console.error('Error checking password change requirement:', error);
      return false;
    }
  };

  const handleFirstLoginPasswordChange = async (newPassword: string, confirmPassword: string): Promise<void> => {
    await authService.firstLoginPasswordChange(newPassword, confirmPassword);
    setRequiresPasswordChange(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        requiresPasswordChange,
        login,
        logout,
        updateUser,
        checkPasswordChangeRequired,
        handleFirstLoginPasswordChange,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};