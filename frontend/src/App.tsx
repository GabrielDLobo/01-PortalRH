import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoginForm from './components/auth/LoginForm';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import LeaveRequests from './pages/LeaveRequests';
import Evaluations from './pages/Evaluations';
import Terminations from './pages/Terminations';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import EmployeeAdmission from './pages/EmployeeAdmission';
import EmployeeDetail from './pages/EmployeeDetail';
import LoadingSpinner from './components/common/LoadingSpinner';
import FirstLoginPasswordChange from './components/auth/FirstLoginPasswordChange';

// Component to handle role-based home redirection
const RoleBasedHome: React.FC = () => {
  const { user } = useAuth();
  
  if (user?.role === 'funcionario') {
    return <Navigate to="/admission" replace />;
  }
  
  return <Dashboard />;
};

// Component to handle routing based on auth state
const AppRoutes: React.FC = () => {
  const { isAuthenticated, isLoading, requiresPasswordChange, handleFirstLoginPasswordChange } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // Show first login password change if required
  if (requiresPasswordChange) {
    return (
      <FirstLoginPasswordChange
        onSuccess={() => {
          // Password changed successfully, continue to main app
          window.location.reload(); // This will refresh and check the new status
        }}
      />
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<RoleBasedHome />} />
        
        <Route
          path="/employees"
          element={
            <ProtectedRoute requiredRoles={['admin_rh']}>
              <Employees />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/employees/:id"
          element={
            <ProtectedRoute requiredRoles={['admin_rh', 'funcionario']}>
              <EmployeeDetail />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/leaves"
          element={
            <ProtectedRoute requiredRoles={['admin_rh', 'funcionario']}>
              <LeaveRequests />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/evaluations"
          element={
            <ProtectedRoute requiredRoles={['admin_rh']}>
              <Evaluations />
            </ProtectedRoute>
          }
        />

        <Route
          path="/terminations"
          element={
            <ProtectedRoute requiredRoles={['admin_rh']}>
              <Terminations />
            </ProtectedRoute>
          }
        />

        <Route
          path="/reports"
          element={
            <ProtectedRoute requiredRoles={['admin_rh']}>
              <Reports />
            </ProtectedRoute>
          }
        />

        <Route path="/admission" element={<EmployeeAdmission />} />
        <Route path="/profile" element={<Profile />} />
        
        {/* Redirect any unknown routes based on user role */}
        <Route path="*" element={<Navigate to="/admission" replace />} />
      </Routes>
    </Layout>
  );
};

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Router>
          <div className="App">
            <AppRoutes />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#22C55E',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 5000,
                  iconTheme: {
                    primary: '#EF4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </div>
        </Router>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
