import { useAuth } from '../contexts/AuthContext';
import PreAdmissionManager from './admission/PreAdmissionManager';
import SelfServiceWizard from './admission/SelfServiceWizard';

const EmployeeAdmission: React.FC = () => {
  const { user } = useAuth();

  if (user?.role === 'admin_rh') {
    return <PreAdmissionManager />;
  }

  return <SelfServiceWizard />;
};

export default EmployeeAdmission;
