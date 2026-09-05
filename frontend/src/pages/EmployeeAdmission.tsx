import React, { useState, useEffect } from 'react';
import {
  DocumentTextIcon,
  CloudArrowUpIcon,
  CheckCircleIcon,
  UserIcon,
  IdentificationIcon,
  MapPinIcon,
  AcademicCapIcon,
  BanknotesIcon,
  PaperClipIcon,
  BriefcaseIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import CEPInput from '../components/common/CEPInput';
import TextArea from '../components/common/TextArea';
import toast from 'react-hot-toast';
import { employeeService } from '../services/employeeService';

interface PreAdmissionData {
  personal_email: string;
  full_name: string;
  cpf: string;
  position: string;
  department: string;
  work_schedule: string;
  weekly_workload: string;
  contract_type: string;
  salary: string;
  benefits: string;
  start_date: string;
  vacation_policy: string;
  direct_manager: string;
}

interface EmployeeData {
  // Personal Information
  rg_cpf: string;
  birth_date: string;
  marital_status: string;
  
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
  
  // Banking Information
  bank_name: string;
  bank_code: string;
  agency_number: string;
  account_number: string;
  account_type: string;
}

interface DocumentType {
  type: string;
  name: string;
  required: boolean;
}

interface UploadedDocument {
  id: number;
  document_type: string;
  document_name: string;
  file: string;
  is_verified: boolean;
  uploaded_at: string;
}

interface AdmissionProcess {
  id: number;
  status: string;
  personal_info_completed: boolean;
  documents_uploaded: boolean;
  hr_review_completed: boolean;
  completion_percentage: number;
}

const EmployeeAdmission: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  
  // State management
  const [currentStep, setCurrentStep] = useState(0); // Start with step 0 for pre-admission
  const [isLoading, setIsLoading] = useState(false);
  const [isHROrAdmin, setIsHROrAdmin] = useState(false);
  const [hasPreAdmissionData, setHasPreAdmissionData] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [savedSteps, setSavedSteps] = useState<Set<number>>(new Set());
  
  // Pre-admission data state
  const [preAdmissionData, setPreAdmissionData] = useState<PreAdmissionData>({
    personal_email: '',
    full_name: '',
    cpf: '',
    position: '',
    department: '',
    work_schedule: '',
    weekly_workload: '40h',
    contract_type: 'clt',
    salary: '',
    benefits: '',
    start_date: '',
    vacation_policy: '',
    direct_manager: ''
  });
  const [employeeData, setEmployeeData] = useState<EmployeeData>({
    rg_cpf: '',
    birth_date: '',
    marital_status: 'single',
    phone: '',
    email: user?.email || '',
    street_address: '',
    address_number: '',
    address_complement: '',
    neighborhood: '',
    city: '',
    state: '',
    zip_code: '',
    pis_pasep: '',
    work_card_number: '',
    work_card_series: '',
    education_level: 'high_school',
    bank_name: '',
    bank_code: '',
    agency_number: '',
    account_number: '',
    account_type: 'checking'
  });
  
  const [requiredDocuments, setRequiredDocuments] = useState<DocumentType[]>([]);
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([]);

  // Form options - using React useMemo to avoid hook issues
  const maritalStatusOptions = React.useMemo(() => [
    { value: 'single', label: t('admission.maritalStatusOptions.single') },
    { value: 'married', label: t('admission.maritalStatusOptions.married') },
    { value: 'divorced', label: t('admission.maritalStatusOptions.divorced') },
    { value: 'widowed', label: t('admission.maritalStatusOptions.widowed') },
    { value: 'stable_union', label: t('admission.maritalStatusOptions.stableUnion') }
  ], [t]);

  const educationLevelOptions = React.useMemo(() => [
    { value: 'elementary', label: t('admission.educationLevelOptions.elementary') },
    { value: 'high_school', label: t('admission.educationLevelOptions.highSchool') },
    { value: 'technical', label: t('admission.educationLevelOptions.technical') },
    { value: 'undergraduate', label: t('admission.educationLevelOptions.undergraduate') },
    { value: 'postgraduate', label: t('admission.educationLevelOptions.postgraduate') },
    { value: 'masters', label: t('admission.educationLevelOptions.masters') },
    { value: 'doctorate', label: t('admission.educationLevelOptions.doctorate') }
  ], [t]);

  const accountTypeOptions = React.useMemo(() => [
    { value: 'checking', label: t('admission.accountTypeOptions.checking') },
    { value: 'savings', label: t('admission.accountTypeOptions.savings') }
  ], [t]);

  // Pre-admission form options
  const contractTypeOptions = React.useMemo(() => [
    { value: 'clt', label: t('admission.contractTypeOptions.clt') },
    { value: 'temporary', label: t('admission.contractTypeOptions.temporary') },
    { value: 'internship', label: t('admission.contractTypeOptions.internship') },
    { value: 'freelancer', label: t('admission.contractTypeOptions.freelancer') },
    { value: 'pj', label: t('admission.contractTypeOptions.pj') }
  ], [t]);

  const workloadOptions = React.useMemo(() => [
    { value: '20h', label: t('admission.workloadOptions.20h') || '20 horas semanais' },
    { value: '30h', label: t('admission.workloadOptions.30h') || '30 horas semanais' },
    { value: '40h', label: t('admission.workloadOptions.40h') || '40 horas semanais' },
    { value: '44h', label: t('admission.workloadOptions.44h') || '44 horas semanais' }
  ], [t]);

  const brazilianStates = React.useMemo(() => [
    { value: 'AC', label: t('admission.brazilianStates.AC') },
    { value: 'AL', label: t('admission.brazilianStates.AL') },
    { value: 'AP', label: t('admission.brazilianStates.AP') },
    { value: 'AM', label: t('admission.brazilianStates.AM') },
    { value: 'BA', label: t('admission.brazilianStates.BA') },
    { value: 'CE', label: t('admission.brazilianStates.CE') },
    { value: 'DF', label: t('admission.brazilianStates.DF') },
    { value: 'ES', label: t('admission.brazilianStates.ES') },
    { value: 'GO', label: t('admission.brazilianStates.GO') },
    { value: 'MA', label: t('admission.brazilianStates.MA') },
    { value: 'MT', label: t('admission.brazilianStates.MT') },
    { value: 'MS', label: t('admission.brazilianStates.MS') },
    { value: 'MG', label: t('admission.brazilianStates.MG') },
    { value: 'PA', label: t('admission.brazilianStates.PA') },
    { value: 'PB', label: t('admission.brazilianStates.PB') },
    { value: 'PR', label: t('admission.brazilianStates.PR') },
    { value: 'PE', label: t('admission.brazilianStates.PE') },
    { value: 'PI', label: t('admission.brazilianStates.PI') },
    { value: 'RJ', label: t('admission.brazilianStates.RJ') },
    { value: 'RN', label: t('admission.brazilianStates.RN') },
    { value: 'RS', label: t('admission.brazilianStates.RS') },
    { value: 'RO', label: t('admission.brazilianStates.RO') },
    { value: 'RR', label: t('admission.brazilianStates.RR') },
    { value: 'SC', label: t('admission.brazilianStates.SC') },
    { value: 'SP', label: t('admission.brazilianStates.SP') },
    { value: 'SE', label: t('admission.brazilianStates.SE') },
    { value: 'TO', label: t('admission.brazilianStates.TO') }
  ], [t]);

  useEffect(() => {
    loadRequiredDocuments();
    checkExistingProfile();
    checkUserRole();
    loadSavedData();
  }, [user]);

  // Load saved data from localStorage
  const loadSavedData = () => {
    try {
      const savedPreAdmission = localStorage.getItem('portalrh-pre-admission');
      const savedEmployee = localStorage.getItem('portalrh-employee-data');
      const savedCompletedSteps = localStorage.getItem('portalrh-completed-steps');
      const savedSavedSteps = localStorage.getItem('portalrh-saved-steps');

      if (savedPreAdmission) {
        setPreAdmissionData(JSON.parse(savedPreAdmission));
        setHasPreAdmissionData(true);
      }

      if (savedEmployee) {
        setEmployeeData(JSON.parse(savedEmployee));
      }

      if (savedCompletedSteps) {
        setCompletedSteps(new Set(JSON.parse(savedCompletedSteps)));
      }

      if (savedSavedSteps) {
        setSavedSteps(new Set(JSON.parse(savedSavedSteps)));
      }
    } catch (error) {
      console.error('Error loading saved data:', error);
    }
  };

  // Save data to localStorage
  const saveDataToStorage = () => {
    try {
      localStorage.setItem('portalrh-pre-admission', JSON.stringify(preAdmissionData));
      localStorage.setItem('portalrh-employee-data', JSON.stringify(employeeData));
      localStorage.setItem('portalrh-completed-steps', JSON.stringify(Array.from(completedSteps)));
      localStorage.setItem('portalrh-saved-steps', JSON.stringify(Array.from(savedSteps)));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  // Clear saved data
  const clearSavedData = () => {
    localStorage.removeItem('portalrh-pre-admission');
    localStorage.removeItem('portalrh-employee-data');
    localStorage.removeItem('portalrh-completed-steps');
    localStorage.removeItem('portalrh-saved-steps');
  };

  const checkUserRole = () => {
    if (user) {
      const isAdminOrHR = user.role === 'admin_rh';
      setIsHROrAdmin(isAdminOrHR);
      
      // If not HR/Admin, skip pre-admission step
      if (!isAdminOrHR) {
        setCurrentStep(1);
      }
    }
  };

  const loadRequiredDocuments = async () => {
    try {
      console.log('=== CARREGANDO TIPOS DE DOCUMENTOS REQUERIDOS ===');
      
      // Try to get from API first
      try {
        const docs = await employeeService.getRequiredDocumentTypes();
        console.log('Document types from API:', docs);

        // Create translation map for document types
        const documentTypeTranslations: { [key: string]: string } = {
          'rg': t('admission.documentTypes.rg'),
          'birth_certificate': t('admission.documentTypes.birthCertificate'),
          'education_certificate': t('admission.documentTypes.educationCertificate'),
          'work_card': t('admission.documentTypes.workCard'),
          'medical_exam': t('admission.documentTypes.medicalExam'),
          'bank_document': t('admission.documentTypes.bankDocument'),
          'address_proof': t('admission.documentTypes.addressProof'),
          'marriage_certificate': t('admission.documentTypes.marriageCertificate'),
          'other': t('admission.documentTypes.other')
        };

        setRequiredDocuments(docs.map((doc: any) => ({
          type: doc.type,
          name: documentTypeTranslations[doc.type] || doc.name,
          required: doc.required
        })));
        return;
      } catch (apiError) {
        console.warn('Failed to load from API, using fallback:', apiError);
      }
      
      // Fallback to hardcoded data if API fails
      const docs: DocumentType[] = [
        { type: 'rg', name: t('admission.documentTypes.rg'), required: true },
        { type: 'birth_certificate', name: t('admission.documentTypes.birthCertificate'), required: true },
        { type: 'education_certificate', name: t('admission.documentTypes.educationCertificate'), required: true },
        { type: 'work_card', name: t('admission.documentTypes.workCard'), required: true },
        { type: 'medical_exam', name: t('admission.documentTypes.medicalExam'), required: true },
        { type: 'bank_document', name: t('admission.documentTypes.bankDocument'), required: false },
        { type: 'address_proof', name: t('admission.documentTypes.addressProof'), required: false },
        { type: 'marriage_certificate', name: t('admission.documentTypes.marriageCertificate'), required: false },
        { type: 'other', name: t('admission.documentTypes.other'), required: false }
      ];
      
      console.log('Using fallback document types:', docs);
      setRequiredDocuments(docs);
    } catch (error) {
      console.error('Error loading required documents:', error);
      toast.error(t('common.error'));
    }
  };

  const checkExistingProfile = async () => {
    try {
      // Mock check - replace with actual API call
      // If employee profile exists, load data and set step accordingly
    } catch (error) {
      console.error('Error checking existing profile:', error);
    }
  };

  const handleInputChange = (field: keyof EmployeeData, value: string) => {
    setEmployeeData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePreAdmissionChange = (field: keyof PreAdmissionData, value: string) => {
    setPreAdmissionData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const savePreAdmissionData = async () => {
    try {
      setIsLoading(true);
      saveDataToStorage();
      
      const newSavedSteps = new Set(savedSteps);
      newSavedSteps.add(0);
      setSavedSteps(newSavedSteps);
      
      toast.success(t('common.success'));
      
    } catch (error) {
      console.error('Error saving pre-admission:', error);
      toast.error(t('common.error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitPreAdmission = async () => {
    try {
      setIsLoading(true);
      
      // Validate required fields
      const requiredFields: (keyof PreAdmissionData)[] = [
        'personal_email', 'full_name', 'cpf', 'position', 'department',
        'work_schedule', 'salary', 'start_date', 'direct_manager'
      ];
      
      for (const field of requiredFields) {
        if (!preAdmissionData[field]) {
          toast.error(`${t('validation.required')}: ${field}`);
          return;
        }
      }

      // Mock API call - replace with actual implementation
      console.log('Submitting pre-admission:', preAdmissionData);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success(t('common.success'));
      
      // Auto-fill employee data from pre-admission
      setEmployeeData(prev => ({
        ...prev,
        email: preAdmissionData.personal_email
      }));
      
      setHasPreAdmissionData(true);
      
      // Mark as completed
      const newCompletedSteps = new Set(completedSteps);
      newCompletedSteps.add(0);
      setCompletedSteps(newCompletedSteps);
      
      const newSavedSteps = new Set(savedSteps);
      newSavedSteps.add(0);
      setSavedSteps(newSavedSteps);
      
      saveDataToStorage();
      
    } catch (error) {
      console.error('Error submitting pre-admission:', error);
      toast.error(t('common.error'));
    } finally {
      setIsLoading(false);
    }
  };

  const savePersonalInfoData = async () => {
    try {
      setIsLoading(true);
      saveDataToStorage();
      
      const newSavedSteps = new Set(savedSteps);
      newSavedSteps.add(1);
      setSavedSteps(newSavedSteps);
      
      toast.success(t('common.success'));
      
    } catch (error) {
      console.error('Error saving personal info:', error);
      toast.error(t('common.error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinishAdmissionProcess = async () => {
    try {
      setIsLoading(true);
      
      // Validate that we have both pre-admission and employee data
      if (!preAdmissionData.full_name || !employeeData.rg_cpf) {
        toast.error(t('validation.required'));
        return;
      }

      // Validate required fields for employee creation
      if (!preAdmissionData.personal_email || !preAdmissionData.position || !preAdmissionData.start_date) {
        toast.error(t('validation.required'));
        return;
      }

      if (!employeeData.phone || !employeeData.birth_date) {
        toast.error(t('validation.required'));
        return;
      }

      let employeeId: string | null = localStorage.getItem('portalrh-employee-id');
      let createdEmployee;
      
      if (employeeId) {
        // Try to update existing employee
        try {
          console.log('Updating existing employee:', employeeId);
          
          const updateEmployeeData: any = {
            id: parseInt(employeeId),
            // Personal Information
            full_name: preAdmissionData.full_name?.trim() || '',
            rg_cpf: employeeData.rg_cpf?.trim() || '',
            birth_date: employeeData.birth_date || null,
            marital_status: employeeData.marital_status || '',
            
            // Contact Information
            phone: employeeData.phone?.trim() || '',
            email: preAdmissionData.personal_email?.trim() || employeeData.email?.trim() || '',
            
            // Address Information
            street_address: employeeData.street_address?.trim() || '',
            address_number: employeeData.address_number?.trim() || '',
            address_complement: employeeData.address_complement?.trim() || '',
            neighborhood: employeeData.neighborhood?.trim() || '',
            city: employeeData.city?.trim() || '',
            state: employeeData.state?.trim() || '',
            zip_code: employeeData.zip_code?.trim() || '',
            
            // Work Documents
            pis_pasep: employeeData.pis_pasep?.trim() || '',
            work_card_number: employeeData.work_card_number?.trim() || '',
            work_card_series: employeeData.work_card_series?.trim() || '',
            
            // Education
            education_level: employeeData.education_level || '',
            
            // Banking Information
            bank_name: employeeData.bank_name?.trim() || '',
            bank_code: employeeData.bank_code?.trim() || '',
            agency_number: employeeData.agency_number?.trim() || '',
            account_number: employeeData.account_number?.trim() || '',
            account_type: employeeData.account_type || 'checking',
            
            // Work Information from pre-admission
            position: preAdmissionData.position?.trim() || '',
            department: preAdmissionData.department?.trim() || '',
            hire_date: preAdmissionData.start_date || null,
            salary: preAdmissionData.salary ? parseFloat(preAdmissionData.salary) : null,
            
            status: 'approved' // Mark as approved since all data is complete
          };

          // Remove empty or null values
          Object.keys(updateEmployeeData).forEach(key => {
            if (updateEmployeeData[key] === '' || updateEmployeeData[key] === null) {
              delete updateEmployeeData[key];
            }
          });

          console.log('Updating employee with data:', updateEmployeeData);
          createdEmployee = await employeeService.updateEmployee(updateEmployeeData);
        } catch (updateError: any) {
          console.log('Employee not found, creating new one:', updateError);
          // Clear invalid employee ID and create new employee
          localStorage.removeItem('portalrh-employee-id');
          employeeId = null;
        }
      }
      
      if (!employeeId) {
        // Create new employee profile
        const createEmployeeData: any = {
          // Personal Information
          full_name: preAdmissionData.full_name?.trim() || '',
          rg_cpf: employeeData.rg_cpf?.trim() || '',
          birth_date: employeeData.birth_date || null,
          marital_status: employeeData.marital_status || '',
          
          // Contact Information
          phone: employeeData.phone?.trim() || '',
          email: preAdmissionData.personal_email?.trim() || employeeData.email?.trim() || '',
          
          // Address Information
          street_address: employeeData.street_address?.trim() || '',
          address_number: employeeData.address_number?.trim() || '',
          address_complement: employeeData.address_complement?.trim() || '',
          neighborhood: employeeData.neighborhood?.trim() || '',
          city: employeeData.city?.trim() || '',
          state: employeeData.state?.trim() || '',
          zip_code: employeeData.zip_code?.trim() || '',
          
          // Work Documents
          pis_pasep: employeeData.pis_pasep?.trim() || '',
          work_card_number: employeeData.work_card_number?.trim() || '',
          work_card_series: employeeData.work_card_series?.trim() || '',
          
          // Education
          education_level: employeeData.education_level || '',
          
          // Banking Information
          bank_name: employeeData.bank_name?.trim() || '',
          bank_code: employeeData.bank_code?.trim() || '',
          agency_number: employeeData.agency_number?.trim() || '',
          account_number: employeeData.account_number?.trim() || '',
          account_type: employeeData.account_type || 'checking',
          
          // Work Information from pre-admission
          position: preAdmissionData.position?.trim() || '',
          department: preAdmissionData.department?.trim() || '',
          hire_date: preAdmissionData.start_date || null,
          salary: preAdmissionData.salary ? parseFloat(preAdmissionData.salary) : null,
        };

        // Remove empty or null values
        Object.keys(createEmployeeData).forEach(key => {
          if (createEmployeeData[key] === '' || createEmployeeData[key] === null) {
            delete createEmployeeData[key];
          }
        });

        // Debug: log the data being sent
        console.log('Creating employee with data:', createEmployeeData);
        
        // Create employee profile using the correct endpoint
        createdEmployee = await employeeService.createEmployeeProfile(createEmployeeData);
        localStorage.setItem('portalrh-employee-id', createdEmployee.id.toString());
      }
      
      console.log('Employee operation successful:', createdEmployee);
      
      // Upload any documents saved in localStorage
      try {
        const savedDocs = localStorage.getItem('portalrh-uploaded-documents');
        if (savedDocs) {
          const documentsToUpload = JSON.parse(savedDocs);
          console.log('Found saved documents to upload:', documentsToUpload.length);
          
          for (const doc of documentsToUpload) {
            try {
              // Convert base64 back to file
              const response = await fetch(doc.fileData);
              const blob = await response.blob();
              const file = new File([blob], doc.document_name, { type: blob.type });
              
              console.log('Uploading saved document:', doc.document_name);
              
              await employeeService.uploadDocument(
                createdEmployee.id,
                file,
                doc.document_type
              );
              
              console.log('Successfully uploaded document:', doc.document_name);
            } catch (uploadError) {
              console.error('Error uploading saved document:', doc.document_name, uploadError);
            }
          }
          
          // Clear saved documents
          localStorage.removeItem('portalrh-uploaded-documents');
        }
      } catch (docError) {
        console.error('Error processing saved documents:', docError);
      }
      
      toast.success(t('employees.admissionFinalized'));
      
      // Mark as completed
      const newCompletedSteps = new Set(completedSteps);
      newCompletedSteps.add(3);
      setCompletedSteps(newCompletedSteps);
      
      // Clear data after completion (only for non-admin users)
      if (!isHROrAdmin) {
        setTimeout(() => {
          clearSavedData();
          localStorage.removeItem('portalrh-employee-id');
          localStorage.removeItem('portalrh-uploaded-documents');
          setCompletedSteps(new Set());
          setSavedSteps(new Set());
        }, 3000);
      }
      
    } catch (error: any) {
      console.error('=== ERROR CREATING EMPLOYEE ===');
      console.error('Full error:', error);
      console.error('Error response:', error?.response);
      console.error('Error response data:', error?.response?.data);
      console.error('Error response status:', error?.response?.status);
      console.error('Error message:', error?.message);
      
      // Show detailed error information
      let errorMessage = t('admission.errorCreatingEmployee');
      
      if (error?.response?.data) {
        const errorData = error.response.data;
        console.error('Detailed error data:', JSON.stringify(errorData, null, 2));
        
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        } else {
          // Show field validation errors
          const fieldErrors = [];
          for (const [field, errors] of Object.entries(errorData)) {
            if (Array.isArray(errors)) {
              fieldErrors.push(`${field}: ${errors.join(', ')}`);
            } else if (typeof errors === 'string') {
              fieldErrors.push(`${field}: ${errors}`);
            }
          }
          if (fieldErrors.length > 0) {
            errorMessage = `${t('admission.validationErrors')}: ${fieldErrors.join('; ')}`;
          }
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitPersonalInfo = async () => {
    try {
      setIsLoading(true);
      
      // Validate required fields
      const requiredFields = [
        'rg_cpf', 'birth_date', 'phone', 'email',
        'street_address', 'address_number', 'neighborhood', 'city', 'state', 'zip_code',
        'bank_name', 'bank_code', 'agency_number', 'account_number'
      ];
      
      for (const field of requiredFields) {
        if (!employeeData[field as keyof EmployeeData]) {
          toast.error(`${t('validation.required')}: ${field}`);
          return;
        }
      }

      // Mock API call - replace with actual implementation
      console.log('Submitting personal info:', employeeData);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success(t('common.success'));
      
      // Mark as completed
      const newCompletedSteps = new Set(completedSteps);
      newCompletedSteps.add(1);
      setCompletedSteps(newCompletedSteps);
      
      const newSavedSteps = new Set(savedSteps);
      newSavedSteps.add(1);
      setSavedSteps(newSavedSteps);
      
      saveDataToStorage();
      
    } catch (error) {
      console.error('Error submitting personal info:', error);
      toast.error(t('common.error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (file: File, documentType: string) => {
    try {
      setIsLoading(true);
      
      // Validate file
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error(t('validation.fileTooLarge'));
        return;
      }

      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        toast.error(t('validation.invalidFileType'));
        return;
      }

      console.log('Uploading file:', file.name, 'Type:', documentType);
      
      try {
        // First check if we have a created employee profile
        let currentEmployeeId: string | null = localStorage.getItem('portalrh-employee-id');
        
        if (!currentEmployeeId) {
          // If no employee created yet, create a minimal one for document storage
          const tempEmployeeData = {
            email: preAdmissionData.personal_email || employeeData.email || user?.email,
            full_name: preAdmissionData.full_name || '',
            position: preAdmissionData.position || '',
            hire_date: preAdmissionData.start_date || null,
            salary: preAdmissionData.salary ? parseFloat(preAdmissionData.salary) : null,
            status: 'pending'
          };
          
          // Remove empty values
          Object.keys(tempEmployeeData).forEach(key => {
            if (!tempEmployeeData[key as keyof typeof tempEmployeeData]) {
              delete tempEmployeeData[key as keyof typeof tempEmployeeData];
            }
          });
          
          console.log('Creating temporary employee profile for document storage:', tempEmployeeData);
          
          const createdEmployee = await employeeService.createEmployeeProfile(tempEmployeeData);
          console.log('Temporary employee created:', createdEmployee);
          
          currentEmployeeId = createdEmployee.id.toString();
          localStorage.setItem('portalrh-employee-id', currentEmployeeId as string);
        }
        
        console.log('Uploading document to employee ID:', currentEmployeeId);
        
        // Ensure we have a valid employee ID before proceeding
        if (!currentEmployeeId) {
          throw new Error('Employee ID is required for document upload');
        }
        
        // Upload document to employee
        const uploadedDoc = await employeeService.uploadDocument(
          parseInt(currentEmployeeId),
          file,
          documentType
        );
        
        console.log('Document uploaded successfully:', uploadedDoc);
        
        // Add to uploaded documents list
        const newDocument: UploadedDocument = {
          id: uploadedDoc.id,
          document_type: documentType,
          document_name: file.name,
          file: uploadedDoc.file,
          is_verified: uploadedDoc.is_verified || false,
          uploaded_at: uploadedDoc.uploaded_at || new Date().toISOString()
        };
        
        setUploadedDocuments(prev => [...prev, newDocument]);
        toast.success(t('employees.documentAttachedSuccess'));
        
      } catch (apiError: any) {
        console.error('API Error uploading document:', apiError);
        
        // Fallback to localStorage for now
        const newDocument: UploadedDocument = {
          id: Date.now(),
          document_type: documentType,
          document_name: file.name,
          file: URL.createObjectURL(file),
          is_verified: false,
          uploaded_at: new Date().toISOString()
        };
        
        setUploadedDocuments(prev => [...prev, newDocument]);
        
        // Save to localStorage for transfer later
        const savedDocs = localStorage.getItem('portalrh-uploaded-documents');
        const existingDocs = savedDocs ? JSON.parse(savedDocs) : [];
        existingDocs.push({
          ...newDocument,
          fileData: await fileToBase64(file)
        });
        localStorage.setItem('portalrh-uploaded-documents', JSON.stringify(existingDocs));
        
        toast.success(t('common.success'));
      }
      
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error(t('common.error'));
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const steps = React.useMemo(() => isHROrAdmin ? [
    { number: 0, title: t('admission.preAdmissionTitle'), icon: BuildingOfficeIcon },
    { number: 1, title: t('admission.personalInfo'), icon: UserIcon },
    { number: 2, title: t('admission.documentation'), icon: DocumentTextIcon },
    { number: 3, title: t('admission.reviewConfirmationTitle'), icon: CheckCircleIcon }
  ] : [
    { number: 1, title: t('admission.personalInfo'), icon: UserIcon },
    { number: 2, title: t('admission.documentation'), icon: DocumentTextIcon },
    { number: 3, title: t('admission.reviewConfirmationTitle'), icon: CheckCircleIcon }
  ], [isHROrAdmin, t]);

  const getStepStatus = (stepNumber: number) => {
    if (completedSteps.has(stepNumber)) return 'completed';
    if (savedSteps.has(stepNumber)) return 'saved';
    if (stepNumber === currentStep) return 'current';
    return 'available'; // Changed from 'upcoming' to 'available'
  };

  const renderProgressBar = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step) => {
          const status = getStepStatus(step.number);
          const Icon = step.icon;
          
          return (
            <div 
              key={step.number} 
              className="flex flex-col items-center cursor-pointer group"
              onClick={() => setCurrentStep(step.number)}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-200 group-hover:scale-105 ${
                status === 'completed' 
                  ? 'bg-success-500 border-success-500 text-white' 
                  : status === 'saved'
                  ? 'bg-info-500 border-info-500 text-white'
                  : status === 'current'
                  ? 'bg-primary-500 border-primary-500 text-white'
                  : 'bg-white border-neutral-300 text-neutral-400 group-hover:border-primary-300'
              }`}>
                {status === 'completed' ? (
                  <CheckCircleIcon className="w-6 h-6" />
                ) : (
                  <Icon className="w-6 h-6" />
                )}
              </div>
              <span className={`text-sm mt-2 font-medium text-center ${
                status === 'current' ? 'text-primary-600' : 'text-neutral-500 group-hover:text-primary-600'
              }`}>
                {step.title}
              </span>
              {status === 'saved' && (
                <span className="text-xs text-info-600 font-medium">{t('admission.saved')}</span>
              )}
              {status === 'completed' && (
                <span className="text-xs text-success-600 font-medium">{t('admission.completed')}</span>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Progress indicator */}
      <div className="flex mt-4">
        {steps.map((step, index) => {
          const status = getStepStatus(step.number);
          return (
            <div key={index} className={`flex-1 h-2 ${index > 0 ? 'ml-2' : ''} rounded-full transition-colors ${
              status === 'completed' ? 'bg-success-500' 
              : status === 'saved' ? 'bg-info-500'
              : status === 'current' ? 'bg-primary-500'
              : 'bg-neutral-200'
            }`} />
          );
        })}
      </div>
      
      {/* Legend */}
      <div className="flex justify-center mt-4 space-x-6 text-xs">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-success-500 rounded-full mr-1"></div>
          <span>{t('admission.completed')}</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-info-500 rounded-full mr-1"></div>
          <span>{t('admission.saved')}</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-primary-500 rounded-full mr-1"></div>
          <span>{t('admission.current')}</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-neutral-300 rounded-full mr-1"></div>
          <span>{t('admission.available')}</span>
        </div>
      </div>
    </div>
  );

  const renderPreAdmissionForm = () => (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl shadow-soft p-6 text-white">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center mr-4">
            <BuildingOfficeIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-bold">{t('admission.preAdmissionTitle')}</h3>
            <p className="text-primary-100 mt-1">
              {t('admission.preAdmissionSubtitle')}
            </p>
          </div>
        </div>
      </div>

      {/* Employee Basic Info */}
      <div className="bg-white rounded-xl shadow-soft p-6">
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 bg-info-100 rounded-xl flex items-center justify-center mr-4">
            <UserIcon className="w-5 h-5 text-info-600" />
          </div>
          <h3 className="text-xl font-semibold text-neutral-900">{t('admission.basicEmployeeInfo')}</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Input
            label={`${t('admission.fullEmployeeName')} *`}
            value={preAdmissionData.full_name}
            onChange={(e) => handlePreAdmissionChange('full_name', e.target.value)}
            placeholder={t('admission.fullEmployeeNamePlaceholder')}
          />
          
          <Input
            label={`${t('admission.employeeCpf')} *`}
            value={preAdmissionData.cpf}
            onChange={(e) => handlePreAdmissionChange('cpf', e.target.value)}
            placeholder={t('admission.cpfPlaceholder')}
          />
          
          <Input
            label={`${t('admission.personalEmployeeEmail')} *`}
            type="email"
            value={preAdmissionData.personal_email}
            onChange={(e) => handlePreAdmissionChange('personal_email', e.target.value)}
            placeholder={t('admission.personalEmailPlaceholder')}
            help={t('admission.personalEmailHelp')}
          />
        </div>
      </div>

      {/* Job Information */}
      <div className="bg-white rounded-xl shadow-soft p-6">
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center mr-4">
            <BriefcaseIcon className="w-5 h-5 text-primary-600" />
          </div>
          <h3 className="text-xl font-semibold text-neutral-900">{t('admission.positionContractInfo')}</h3>
        </div>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Input
              label={`${t('admission.position')} *`}
              value={preAdmissionData.position}
              onChange={(e) => handlePreAdmissionChange('position', e.target.value)}
              placeholder={t('admission.positionPlaceholder')}
            />
            
            <Input
              label={`${t('admission.department')} *`}
              value={preAdmissionData.department}
              onChange={(e) => handlePreAdmissionChange('department', e.target.value)}
              placeholder={t('admission.departmentPlaceholder')}
            />
            
            <Input
              label={`${t('admission.directManager')} *`}
              value={preAdmissionData.direct_manager}
              onChange={(e) => handlePreAdmissionChange('direct_manager', e.target.value)}
              placeholder={t('admission.directManagerPlaceholder')}
            />
          </div>


          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Select
              label={`${t('admission.workSchedule')} *`}
              value={preAdmissionData.work_schedule}
              onChange={(value) => handlePreAdmissionChange('work_schedule', value)}
              options={[
                { value: 'segunda_sexta', label: t('admission.workScheduleOptions.mondayToFriday') },
                { value: 'segunda_sabado', label: t('admission.workScheduleOptions.mondayToSaturday') },
                { value: '6x1', label: '6x1' },
                { value: '12x36', label: '12x36' }
              ]}
            />
            
            <Select
              label={`${t('admission.weeklyWorkload')} *`}
              value={preAdmissionData.weekly_workload}
              onChange={(value) => handlePreAdmissionChange('weekly_workload', value)}
              options={workloadOptions}
            />
            
            <Select
              label={`${t('admission.contractType')} *`}
              value={preAdmissionData.contract_type}
              onChange={(value) => handlePreAdmissionChange('contract_type', value)}
              options={contractTypeOptions}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label={`${t('admission.salary')} (R$) *`}
              type="number"
              step="0.01"
              value={preAdmissionData.salary}
              onChange={(e) => handlePreAdmissionChange('salary', e.target.value)}
              placeholder={t('admission.salaryPlaceholder')}
            />
            
            <Input
              label={`${t('admission.startDate')} *`}
              type="date"
              value={preAdmissionData.start_date}
              onChange={(e) => handlePreAdmissionChange('start_date', e.target.value)}
            />
          </div>

          <TextArea
            label={t('admission.benefits')}
            value={preAdmissionData.benefits}
            onChange={(e) => handlePreAdmissionChange('benefits', e.target.value)}
            placeholder={t('admission.benefitsPlaceholder')}
            rows={3}
          />

          <TextArea
            label={t('admission.vacationPolicy')}
            value={preAdmissionData.vacation_policy}
            onChange={(e) => handlePreAdmissionChange('vacation_policy', e.target.value)}
            placeholder={t('admission.vacationPolicyPlaceholder')}
            rows={3}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button
          variant="secondary"
          onClick={() => {
            // Clear form
            setPreAdmissionData({
              personal_email: '',
              full_name: '',
              cpf: '',
              position: '',
              department: '',
              work_schedule: '',
              weekly_workload: '40h',
              contract_type: 'clt',
              salary: '',
              benefits: '',
              start_date: '',
              vacation_policy: '',
              direct_manager: ''
            });
            
            // Remove from saved steps
            const newSavedSteps = new Set(savedSteps);
            newSavedSteps.delete(0);
            setSavedSteps(newSavedSteps);
            
            // Clear from localStorage
            localStorage.removeItem('portalrh-pre-admission');
            
            toast.success(t('common.success'));
          }}
        >
          {t('admission.clearForm')}
        </Button>
        
        <div className="space-x-4">
          <Button
            variant="secondary"
            onClick={savePreAdmissionData}
            isLoading={isLoading}
          >
            {t('admission.save')}
          </Button>
          
          <Button
            onClick={handleSubmitPreAdmission}
            isLoading={isLoading}
            className="px-8 py-3"
          >
            {t('admission.createPreAdmission')}
          </Button>
        </div>
      </div>
    </div>
  );

  const renderPersonalInfoForm = () => (
    <div className="space-y-8">
      {/* Personal Information */}
      <div className="bg-white rounded-xl shadow-soft p-6">
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center mr-4">
            <UserIcon className="w-5 h-5 text-primary-600" />
          </div>
          <h3 className="text-xl font-semibold text-neutral-900">{t('admission.personalInformation')}</h3>
        </div>

        {/* Pre-admission info display for employees */}
        {hasPreAdmissionData && !isHROrAdmin && (
          <div className="bg-info-50 border border-info-200 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-info-900 mb-2">📋 {t('admission.positionInfo')}:</h4>
            <div className="text-sm text-info-800 space-y-1">
              <p><strong>{t('admission.position')}:</strong> {preAdmissionData.position}</p>
              <p><strong>{t('admission.startDate')}:</strong> {new Date(preAdmissionData.start_date).toLocaleDateString('pt-BR')}</p>
              <p><strong>{t('admission.manager')}:</strong> {preAdmissionData.direct_manager}</p>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="RG *"
            value={employeeData.rg_cpf}
            onChange={(e) => handleInputChange('rg_cpf', e.target.value)}
            placeholder={t('admission.rgPlaceholder')}
          />
          
          <Input
            label={`${t('admission.birthDate')} *`}
            type="date"
            value={employeeData.birth_date}
            onChange={(e) => handleInputChange('birth_date', e.target.value)}
          />
          
          <Select
            label={`${t('admission.maritalStatus')} *`}
            value={employeeData.marital_status}
            onChange={(value) => handleInputChange('marital_status', value)}
            options={maritalStatusOptions}
          />
          
          <Input
            label={`${t('admission.phone')} *`}
            value={employeeData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            placeholder={t('admission.phonePlaceholder')}
          />
          
          <Input
            label="E-mail *"
            type="email"
            value={employeeData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder={t('admission.emailPlaceholder')}
            disabled={hasPreAdmissionData && !isHROrAdmin}
            help={hasPreAdmissionData && !isHROrAdmin ? t('admission.emailDefinedByHr') : undefined}
          />
        </div>
      </div>

      {/* Address Information */}
      <div className="bg-white rounded-xl shadow-soft p-6">
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 bg-info-100 rounded-xl flex items-center justify-center mr-4">
            <MapPinIcon className="w-5 h-5 text-info-600" />
          </div>
          <h3 className="text-xl font-semibold text-neutral-900">{t('admission.residentialAddress')}</h3>
        </div>
        
        {/* CEP Field - First for automatic address lookup */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CEPInput
            label="CEP *"
            value={employeeData.zip_code}
            onChange={(value) => handleInputChange('zip_code', value)}
            onAddressChange={(address) => {
              setEmployeeData(prev => ({
                ...prev,
                zip_code: address.zip_code,
                street_address: address.street_address,
                neighborhood: address.neighborhood,
                city: address.city,
                state: address.state,
                address_complement: address.complement || prev.address_complement,
              }));
              toast.success(t('common.success'));
            }}
            placeholder={t('admission.cepPlaceholder')}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Input
              label={`${t('common.address')} *`}
              value={employeeData.street_address}
              onChange={(e) => handleInputChange('street_address', e.target.value)}
              placeholder={t('admission.streetAddressPlaceholder')}
            />
          </div>
          
          <Input
            label={`${t('admission.addressNumber')} *`}
            value={employeeData.address_number}
            onChange={(e) => handleInputChange('address_number', e.target.value)}
            placeholder={t('admission.addressNumberPlaceholder')}
          />
          
          <Input
            label={t('admission.addressComplement')}
            value={employeeData.address_complement}
            onChange={(e) => handleInputChange('address_complement', e.target.value)}
            placeholder={t('admission.addressComplementPlaceholder')}
          />
          
          <Input
            label={`${t('admission.neighborhood')} *`}
            value={employeeData.neighborhood}
            onChange={(e) => handleInputChange('neighborhood', e.target.value)}
            placeholder={t('admission.neighborhoodPlaceholder')}
          />
          
          <Input
            label={`${t('admission.city')} *`}
            value={employeeData.city}
            onChange={(e) => handleInputChange('city', e.target.value)}
            placeholder={t('admission.cityPlaceholder')}
          />
          
          <Select
            label={`${t('admission.state')} *`}
            value={employeeData.state}
            onChange={(value) => handleInputChange('state', value)}
            options={brazilianStates}
          />
        </div>
      </div>

      {/* Work Documents */}
      <div className="bg-white rounded-xl shadow-soft p-6">
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 bg-warning-100 rounded-xl flex items-center justify-center mr-4">
            <IdentificationIcon className="w-5 h-5 text-warning-600" />
          </div>
          <h3 className="text-xl font-semibold text-neutral-900">{t('admission.workDocuments')}</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Input
            label={t('admission.pisPasep')}
            value={employeeData.pis_pasep}
            onChange={(e) => handleInputChange('pis_pasep', e.target.value)}
            placeholder={t('admission.pisPasepPlaceholder')}
          />
          
          <Input
            label={t('admission.workCardNumber')}
            value={employeeData.work_card_number}
            onChange={(e) => handleInputChange('work_card_number', e.target.value)}
            placeholder={t('admission.workCardNumberPlaceholder')}
          />
          
          <Input
            label={t('admission.workCardSeries')}
            value={employeeData.work_card_series}
            onChange={(e) => handleInputChange('work_card_series', e.target.value)}
            placeholder={t('admission.workCardSeriesPlaceholder')}
          />
        </div>
      </div>

      {/* Education */}
      <div className="bg-white rounded-xl shadow-soft p-6">
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 bg-success-100 rounded-xl flex items-center justify-center mr-4">
            <AcademicCapIcon className="w-5 h-5 text-success-600" />
          </div>
          <h3 className="text-xl font-semibold text-neutral-900">{t('admission.education')}</h3>
        </div>
        
        <Select
          label={`${t('admission.educationLevel')} *`}
          value={employeeData.education_level}
          onChange={(value) => handleInputChange('education_level', value)}
          options={educationLevelOptions}
        />
      </div>

      {/* Banking Information */}
      <div className="bg-white rounded-xl shadow-soft p-6">
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 bg-accent-indigo bg-opacity-20 rounded-xl flex items-center justify-center mr-4">
            <BanknotesIcon className="w-5 h-5 text-accent-indigo" />
          </div>
          <h3 className="text-xl font-semibold text-neutral-900">{t('admission.bankingData')}</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label={`${t('admission.bankName')} *`}
            value={employeeData.bank_name}
            onChange={(e) => handleInputChange('bank_name', e.target.value)}
            placeholder={t('admission.bankNamePlaceholder')}
          />
          
          <Input
            label={`${t('admission.bankCode')} *`}
            value={employeeData.bank_code}
            onChange={(e) => handleInputChange('bank_code', e.target.value)}
            placeholder={t('admission.bankCodePlaceholder')}
            maxLength={6}
          />
          
          <Input
            label={`${t('admission.agencyNumber')} *`}
            value={employeeData.agency_number}
            onChange={(e) => handleInputChange('agency_number', e.target.value)}
            placeholder={t('admission.agencyNumberPlaceholder')}
          />
          
          <Input
            label={`${t('admission.accountNumber')} *`}
            value={employeeData.account_number}
            onChange={(e) => handleInputChange('account_number', e.target.value)}
            placeholder={t('admission.accountNumberPlaceholder')}
          />
          
          <Select
            label={`${t('admission.accountType')} *`}
            value={employeeData.account_type}
            onChange={(value) => handleInputChange('account_type', value)}
            options={accountTypeOptions}
          />
        </div>
      </div>

      <div className="flex justify-between">
        <Button
          variant="secondary"
          onClick={() => {
            // Clear personal info form
            setEmployeeData({
              rg_cpf: '',
              birth_date: '',
              marital_status: 'single',
              phone: '',
              email: preAdmissionData.personal_email || user?.email || '',
              street_address: '',
              address_number: '',
              address_complement: '',
              neighborhood: '',
              city: '',
              state: '',
              zip_code: '',
              pis_pasep: '',
              work_card_number: '',
              work_card_series: '',
              education_level: 'high_school',
              bank_name: '',
              bank_code: '',
              agency_number: '',
              account_number: '',
              account_type: 'checking'
            });
            
            // Remove from saved steps
            const newSavedSteps = new Set(savedSteps);
            newSavedSteps.delete(1);
            setSavedSteps(newSavedSteps);
            
            // Clear from localStorage
            localStorage.removeItem('portalrh-employee-data');
            
            toast.success(t('common.success'));
          }}
        >
          {t('admission.clearForm')}
        </Button>
        
        <div className="space-x-4">
          <Button
            variant="secondary"
            onClick={savePersonalInfoData}
            isLoading={isLoading}
          >
            {t('admission.save')}
          </Button>
          
          <Button
            onClick={handleSubmitPersonalInfo}
            isLoading={isLoading}
            className="px-8 py-3"
          >
            {t('admission.finalizePersonalInfo')}
          </Button>
        </div>
      </div>
    </div>
  );

  const renderDocumentUpload = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-soft p-6">
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center mr-4">
            <DocumentTextIcon className="w-5 h-5 text-primary-600" />
          </div>
          <h3 className="text-xl font-semibold text-neutral-900">{t('admission.requiredDocumentation')}</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {requiredDocuments.map((doc) => {
            const uploaded = uploadedDocuments.find(u => u.document_type === doc.type);
            
            return (
              <div key={doc.type} className="relative">
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleFileUpload(file, doc.type);
                    }
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  id={`file-${doc.type}`}
                />
                <div
                  className={`relative p-6 rounded-xl border-2 border-dashed transition-all duration-200 hover:scale-105 cursor-pointer ${
                    uploaded 
                      ? 'border-success-300 bg-success-50 hover:bg-success-100' 
                      : doc.required 
                      ? 'border-warning-300 bg-warning-50 hover:bg-warning-100' 
                      : 'border-neutral-300 bg-neutral-50 hover:bg-neutral-100'
                  }`}
                >
                  <div className="text-center">
                    <div className="mb-3">
                      {uploaded ? (
                        <CheckCircleIcon className="w-8 h-8 text-success-500 mx-auto" />
                      ) : (
                        <CloudArrowUpIcon className="w-8 h-8 text-neutral-400 mx-auto" />
                      )}
                    </div>
                    
                    <h4 className="font-medium text-neutral-900 mb-1">{doc.name}</h4>
                    
                    <p className={`text-xs mb-2 ${
                      doc.required ? 'text-warning-600' : 'text-neutral-500'
                    }`}>
                      {doc.required ? t('admission.required') : t('admission.optional')}
                    </p>
                    
                    {uploaded ? (
                      <div className="space-y-1">
                        <div className="flex items-center justify-center text-xs text-success-600">
                          <PaperClipIcon className="w-3 h-3 mr-1" />
                          {uploaded.document_name}
                        </div>
                        <p className="text-xs text-success-600 font-medium">✓ {t('admission.uploaded')}</p>
                        <p className="text-xs text-neutral-500">{t('admission.clickToReplace')}</p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <p className="text-xs text-neutral-600 font-medium">{t('admission.clickToUpload')}</p>
                        <p className="text-xs text-neutral-500">{t('admission.fileTypes')}</p>
                        <p className="text-xs text-neutral-500">{t('admission.maxFileSize')}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {uploadedDocuments.length > 0 && (
          <div className="mt-6">
            <h4 className="font-medium text-neutral-900 mb-4">{t('admission.documentsUploaded')}</h4>
            <div className="space-y-3">
              {uploadedDocuments.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                  <div className="flex items-center">
                    <PaperClipIcon className="w-5 h-5 text-neutral-400 mr-3" />
                    <div>
                      <p className="font-medium text-neutral-900">{doc.document_name}</p>
                      <p className="text-sm text-neutral-500">
                        {requiredDocuments.find(r => r.type === doc.document_type)?.name}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    {doc.is_verified ? (
                      <span className="px-2 py-1 text-xs font-medium bg-success-100 text-success-800 rounded-full">
                        {t('admission.verified')}
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-medium bg-warning-100 text-warning-800 rounded-full">
                        {t('admission.awaitingVerification')}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-between mt-8">
          <Button
            variant="secondary"
            onClick={() => {
              // Clear uploaded documents
              setUploadedDocuments([]);
              
              // Remove from saved steps
              const newSavedSteps = new Set(savedSteps);
              newSavedSteps.delete(2);
              setSavedSteps(newSavedSteps);
              
              toast.success(t('common.success'));
            }}
          >
            {t('admission.clearDocuments')}
          </Button>
          
          <div className="space-x-4">
            <Button
              variant="secondary"
              onClick={() => {
                // Save documents step
                const newSavedSteps = new Set(savedSteps);
                newSavedSteps.add(2);
                setSavedSteps(newSavedSteps);
                saveDataToStorage();
                toast.success(t('common.success'));
              }}
            >
              {t('admission.save')}
            </Button>
            
            <Button
              onClick={() => {
                // Mark as completed if has required documents
                const requiredDocsUploaded = uploadedDocuments.filter(d => 
                  requiredDocuments.find(r => r.type === d.document_type && r.required)
                ).length;
                const totalRequiredDocs = requiredDocuments.filter(r => r.required).length;
                
                if (requiredDocsUploaded >= totalRequiredDocs) {
                  const newCompletedSteps = new Set(completedSteps);
                  newCompletedSteps.add(2);
                  setCompletedSteps(newCompletedSteps);
                  toast.success(t('common.success'));
                } else {
                  const newSavedSteps = new Set(savedSteps);
                  newSavedSteps.add(2);
                  setSavedSteps(newSavedSteps);
                  toast.success(t('common.success'));
                }
                saveDataToStorage();
              }}
            >
              {t('admission.finishDocumentation')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderReviewStep = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-soft p-6">
        <h3 className="text-xl font-semibold text-neutral-900 mb-6">{t('admission.reviewConfirmationTitle')}</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-neutral-900 mb-4">{t('admission.personalInformation')}</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-600">{t('common.name')}:</span>
                <span className="font-medium">{preAdmissionData.full_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">{t('common.cpf')}:</span>
                <span className="font-medium">{preAdmissionData.cpf}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">{t('common.email')}:</span>
                <span className="font-medium">{employeeData.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">{t('common.phone')}:</span>
                <span className="font-medium">{employeeData.phone}</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-neutral-900 mb-4">{t('admission.documentation')}</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-600">{t('admission.documentsRequired')}:</span>
                <span className="font-medium">
                  {uploadedDocuments.filter(d => requiredDocuments.find(r => r.type === d.document_type && r.required)).length} / {requiredDocuments.filter(r => r.required).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">{t('admission.totalDocuments')}:</span>
                <span className="font-medium">{uploadedDocuments.length}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between mt-8">
          <Button
            variant="secondary"
            onClick={() => {
              // Clear all saved data
              clearSavedData();
              setCompletedSteps(new Set());
              setSavedSteps(new Set());
              
              // Reset forms
              setPreAdmissionData({
                personal_email: '',
                full_name: '',
                cpf: '',
                position: '',
                department: '',
                work_schedule: '',
                weekly_workload: '40h',
                contract_type: 'clt',
                salary: '',
                benefits: '',
                start_date: '',
                vacation_policy: '',
                direct_manager: ''
              });
              
              setEmployeeData({
                rg_cpf: '',
                birth_date: '',
                marital_status: 'single',
                phone: '',
                email: user?.email || '',
                street_address: '',
                address_number: '',
                address_complement: '',
                neighborhood: '',
                city: '',
                state: '',
                zip_code: '',
                pis_pasep: '',
                work_card_number: '',
                work_card_series: '',
                education_level: 'high_school',
                bank_name: '',
                bank_code: '',
                agency_number: '',
                account_number: '',
                account_type: 'checking'
              });
              
              setUploadedDocuments([]);
              setHasPreAdmissionData(false);
              setCurrentStep(0);
              
              toast.success(t('common.success'));
            }}
          >
            {t('admission.clearAll')}
          </Button>
          
          <div className="space-x-4">
            <Button
              variant="secondary"
              onClick={() => {
                // Save final review
                const newSavedSteps = new Set(savedSteps);
                newSavedSteps.add(3);
                setSavedSteps(newSavedSteps);
                saveDataToStorage();
                toast.success(t('common.success'));
              }}
            >
              {t('admission.save')}
            </Button>
            
            <Button
              onClick={handleFinishAdmissionProcess}
              isLoading={isLoading}
              className="bg-success-500 hover:bg-success-600"
            >
              {t('admission.finalizeProcess')}
            </Button>

            {/* New Admission Button for HR Admins after completion */}
            {isHROrAdmin && completedSteps.has(3) && (
              <Button
                variant="secondary"
                onClick={() => {
                  // Clear all data and start fresh
                  clearSavedData();
                  localStorage.removeItem('portalrh-employee-id');
                  localStorage.removeItem('portalrh-uploaded-documents');
                  setCompletedSteps(new Set());
                  setSavedSteps(new Set());
                  setHasPreAdmissionData(false);
                  setCurrentStep(0);

                  // Reset all forms
                  setPreAdmissionData({
                    personal_email: '',
                    full_name: '',
                    cpf: '',
                    position: '',
                    department: '',
                    work_schedule: '',
                    weekly_workload: '40h',
                    contract_type: 'clt',
                    salary: '',
                    benefits: '',
                    start_date: '',
                    vacation_policy: '',
                    direct_manager: ''
                  });

                  setEmployeeData({
                    rg_cpf: '',
                    birth_date: '',
                    marital_status: 'single',
                    phone: '',
                    email: '',
                    street_address: '',
                    address_number: '',
                    address_complement: '',
                    neighborhood: '',
                    city: '',
                    state: '',
                    zip_code: '',
                    pis_pasep: '',
                    work_card_number: '',
                    work_card_series: '',
                    education_level: 'high_school',
                    bank_name: '',
                    bank_code: '',
                    agency_number: '',
                    account_number: '',
                    account_type: 'checking'
                  });

                  setUploadedDocuments([]);

                  toast.success('Nova admissão iniciada!');
                }}
                className="ml-4"
              >
                🆕 Nova Admissão
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-neutral-900 mb-4">
          🎯 {t('admission.title')}
        </h1>
        <p className="text-lg text-neutral-600">
          {t('admission.subtitle')}
        </p>
      </div>

      {/* Progress Bar */}
      {renderProgressBar()}

      {/* Content */}
      {currentStep === 0 && isHROrAdmin && renderPreAdmissionForm()}
      {currentStep === 1 && renderPersonalInfoForm()}
      {currentStep === 2 && renderDocumentUpload()}
      {currentStep === 3 && renderReviewStep()}

    </div>
  );
};

export default EmployeeAdmission;