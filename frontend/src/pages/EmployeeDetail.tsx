import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  UserIcon,
  PencilIcon,
  ArrowLeftIcon,
  EyeIcon,
  IdentificationIcon,
  MapPinIcon,
  BanknotesIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CloudArrowUpIcon,
  PaperClipIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import CEPInput from '../components/common/CEPInput';
import Modal from '../components/common/Modal';
import Badge from '../components/common/Badge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatName, getInitials } from '../utils/formatters';
import toast from 'react-hot-toast';
import { employeeService } from '../services/employeeService';
import { UpdateEmployeeRequest } from '../types/employee';

interface UploadedDocument {
  id: number;
  document_type: string;
  document_name: string;
  file: string;
  is_verified: boolean;
  is_required: boolean;
  uploaded_at: string;
}

interface EmployeeData {
  id: number;
  user: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    is_active: boolean;
  };
  employee_id: string;
  status: string;
  admission_completed: boolean;
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
  department?: string;
  position?: string;
  hire_date?: string;
  salary?: number;
  
  // Documents
  documents: EmployeeDocument[];
}

interface EmployeeDocument {
  id: number;
  document_type: string;
  document_name: string;
  file: string;
  is_verified: boolean;
  is_required: boolean;
  uploaded_at: string;
}

const EmployeeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  
  const [employee, setEmployee] = useState<EmployeeData | null>(null);
  const [editedEmployee, setEditedEmployee] = useState<EmployeeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCancelAdmissionModalOpen, setIsCancelAdmissionModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'personal' | 'address' | 'work' | 'banking' | 'documents' | 'accounting_docs' | 'termination_docs'>('personal');
  const [isUploadingContract, setIsUploadingContract] = useState(false);
  const [contractDocument, setContractDocument] = useState<any>(null);
  const [uploadingDocuments, setUploadingDocuments] = useState<Set<string>>(new Set());
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([]);
  const [terminationDocuments, setTerminationDocuments] = useState<any[]>([]);
  const [isUploadingTerminationDoc, setIsUploadingTerminationDoc] = useState(false);

  // Check if user has permission to edit
  const canEdit = user?.role === 'admin_rh';
  const canCancelAdmission = user?.role === 'admin_rh';

  // Debug info
  console.log('User role:', user?.role);
  console.log('Can cancel admission:', canCancelAdmission);
  console.log('Employee status:', employee?.status);
  console.log('=== ESTADO ATUAL DOS DOCUMENTOS ===');
  console.log('uploadedDocuments count:', uploadedDocuments.length);
  console.log('uploadedDocuments:', uploadedDocuments);

  // Form options (same as EmployeeAdmission)
  const maritalStatusOptions = [
    { value: 'single', label: t('employees.maritalStatusOptions.single') },
    { value: 'married', label: t('employees.maritalStatusOptions.married') },
    { value: 'divorced', label: t('employees.maritalStatusOptions.divorced') },
    { value: 'widowed', label: t('employees.maritalStatusOptions.widowed') },
    { value: 'stable_union', label: t('employees.maritalStatusOptions.stableUnion') }
  ];

  const educationLevelOptions = [
    { value: 'elementary', label: t('employees.educationLevelOptions.elementary') },
    { value: 'high_school', label: t('employees.educationLevelOptions.highSchool') },
    { value: 'technical', label: t('employees.educationLevelOptions.technical') },
    { value: 'undergraduate', label: t('employees.educationLevelOptions.undergraduate') },
    { value: 'postgraduate', label: t('employees.educationLevelOptions.postgraduate') },
    { value: 'masters', label: t('employees.educationLevelOptions.masters') },
    { value: 'doctorate', label: t('employees.educationLevelOptions.doctorate') }
  ];

  const accountTypeOptions = [
    { value: 'checking', label: t('employees.accountTypeOptions.checking') },
    { value: 'savings', label: t('employees.accountTypeOptions.savings') }
  ];

  const brazilianStates = [
    { value: 'AC', label: 'Acre' },
    { value: 'AL', label: 'Alagoas' },
    { value: 'AP', label: 'Amapá' },
    { value: 'AM', label: 'Amazonas' },
    { value: 'BA', label: 'Bahia' },
    { value: 'CE', label: 'Ceará' },
    { value: 'DF', label: 'Distrito Federal' },
    { value: 'ES', label: 'Espírito Santo' },
    { value: 'GO', label: 'Goiás' },
    { value: 'MA', label: 'Maranhão' },
    { value: 'MT', label: 'Mato Grosso' },
    { value: 'MS', label: 'Mato Grosso do Sul' },
    { value: 'MG', label: 'Minas Gerais' },
    { value: 'PA', label: 'Pará' },
    { value: 'PB', label: 'Paraíba' },
    { value: 'PR', label: 'Paraná' },
    { value: 'PE', label: 'Pernambuco' },
    { value: 'PI', label: 'Piauí' },
    { value: 'RJ', label: 'Rio de Janeiro' },
    { value: 'RN', label: 'Rio Grande do Norte' },
    { value: 'RS', label: 'Rio Grande do Sul' },
    { value: 'RO', label: 'Rondônia' },
    { value: 'RR', label: 'Roraima' },
    { value: 'SC', label: 'Santa Catarina' },
    { value: 'SP', label: 'São Paulo' },
    { value: 'SE', label: 'Sergipe' },
    { value: 'TO', label: 'Tocantins' }
  ];

  useEffect(() => {
    console.log('=== COMPONENT MOUNTED/ID CHANGED ===');
    console.log('Employee ID:', id);
    console.log('Current uploadedDocuments state:', uploadedDocuments);

    if (id) {
      fetchEmployee();
      loadContractDocument();
    }

    return () => {
      console.log('=== COMPONENT CLEANUP ===');
      console.log('Cleaning up component for employee:', id);
    };
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load termination documents when tab is activated
  useEffect(() => {
    if (activeTab === 'termination_docs') {
      loadTerminationDocuments();
    }
  }, [activeTab, employee?.id]);

  // Check and update status when employee data changes
  useEffect(() => {
    if (employee && employee.documents && employee.documents.length > 0) {
      console.log('=== CHECKING STATUS ON EMPLOYEE DATA CHANGE ===');
      console.log('Employee status:', employee.status);
      console.log('Documents count:', employee.documents.length);

      // Wait a bit to ensure all state is updated
      setTimeout(() => {
        checkAndUpdateEmployeeStatus();
      }, 500);
    }
  }, [employee?.documents?.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadContractDocument = async () => {
    if (!id) return;
    try {
      console.log('=== CARREGANDO DOCUMENTO DE CONTRATO ===');
      console.log('Employee ID:', id);
      
      const documents = await employeeService.getEmployeeDocuments(parseInt(id));
      console.log('All documents loaded:', documents);
      
      const contract = documents.find(doc => doc.document_type === 'work_contract');
      console.log('Contract document found:', contract);
      
      setContractDocument(contract || null);
      
      if (contract) {
        console.log('✅ Contrato encontrado e carregado:', contract.document_name);
      } else {
        console.log('⚠️ Nenhum contrato encontrado');
      }
      
    } catch (error) {
      console.error('❌ Erro ao carregar documento de contrato:', error);
    }
  };

  // Check if all required documents are uploaded and update status
  const checkAndUpdateEmployeeStatus = async () => {
    if (!employee) return;

    console.log('=== VERIFICANDO STATUS DOS DOCUMENTOS ===');

    // Get current documents - combine both backend and uploaded documents
    const documents = Array.isArray(employee.documents) ? employee.documents : [];
    const allDocuments = [...documents, ...uploadedDocuments];

    console.log('Current backend documents:', documents);
    console.log('Current uploaded documents:', uploadedDocuments);
    console.log('All documents combined:', allDocuments);

    // Required document types for employee documents
    const requiredEmployeeDocuments = [
      'rg',
      'birth_certificate',
      'education_certificate',
      'work_card',
      'medical_exam'
    ];

    // Required document types for accounting documents
    const requiredAccountingDocuments = [
      'work_contract'
    ];

    // Check if all required employee documents are uploaded
    const employeeDocsUploaded = requiredEmployeeDocuments.every(docType =>
      allDocuments.some(doc => doc.document_type === docType)
    );

    // Check if all required accounting documents are uploaded
    const accountingDocsUploaded = requiredAccountingDocuments.every(docType =>
      allDocuments.some(doc => doc.document_type === docType)
    );

    console.log('Employee documents uploaded:', employeeDocsUploaded);
    console.log('Accounting documents uploaded:', accountingDocsUploaded);
    console.log('Current employee status:', employee.status);

    // If all required documents are uploaded and status is still pending, update to approved
    if (employeeDocsUploaded && accountingDocsUploaded && (employee.status === 'pending' || employee.status === 'under_review')) {
      console.log('✅ All required documents uploaded! Updating status to approved...');

      try {
        const updateData: UpdateEmployeeRequest = {
          id: employee.id,
          status: 'approved',
          admission_completed: true
        };

        const updatedEmployee = await employeeService.updateEmployee(updateData);
        console.log('✅ Status updated successfully:', updatedEmployee);

        // Update local state - ensure we preserve the documents array
        const updatedEmployeeData: EmployeeData = {
          ...updatedEmployee,
          documents: documents, // Use only backend documents for type compatibility
          admission_completed: updatedEmployee.admission_completed ?? false
        };

        setEmployee(updatedEmployeeData);
        setEditedEmployee(updatedEmployeeData);

        toast.success(t('employees.admissionFinalized'));

      } catch (error) {
        console.error('❌ Error updating employee status:', error);
        // Don't show error toast for existing employees, just log
        console.log('Note: Status update may have failed because employee is already approved');
      }
    } else if (employee.status === 'pending' || employee.status === 'under_review') {
      console.log('⏳ Verificando documentos obrigatórios...');

      // Count missing documents
      const missingEmployeeDocs = requiredEmployeeDocuments.filter(docType =>
        !allDocuments.some(doc => doc.document_type === docType)
      );
      const missingAccountingDocs = requiredAccountingDocuments.filter(docType =>
        !allDocuments.some(doc => doc.document_type === docType)
      );

      if (missingEmployeeDocs.length > 0 || missingAccountingDocs.length > 0) {
        console.log('Missing employee documents:', missingEmployeeDocs);
        console.log('Missing accounting documents:', missingAccountingDocs);
        console.log('Documents still required for completion');
      } else {
        console.log('All documents present but status not updated - may already be processed');
      }
    } else {
      console.log(`Employee status is ${employee.status} - no update needed`);
    }
  };

  const handleDocumentUpload = async (file: File, documentType: string) => {
    if (!employee || !canEdit) return;

    console.log('=== INICIANDO UPLOAD DE DOCUMENTO FUNCIONÁRIO ===');
    console.log('Upload details:', {
      name: file.name,
      size: file.size,
      type: file.type,
      documentType,
      employeeId: employee.id
    });

    // Validate file
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error(t('validation.fileTooLarge'));
      return;
    }

    const allowedTypes = [
      'application/pdf', 
      'image/jpeg', 
      'image/png', 
      'image/jpg',
      'application/x-pdf',
      'application/acrobat',
      'applications/vnd.pdf',
      'text/pdf',
      'text/x-pdf'
    ];
    
    const fileExtension = file.name.toLowerCase().split('.').pop();
    const allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png'];
    
    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension || '')) {
      console.log('Tipo de arquivo rejeitado:', file.type, 'Extensão:', fileExtension);
      toast.error(t('validation.invalidFileType'));
      return;
    }

    try {
      // Add document type to uploading set
      setUploadingDocuments(prev => new Set(Array.from(prev).concat(documentType)));
      
      // Upload document
      const uploadedDoc = await employeeService.uploadDocument(
        employee.id, 
        file, 
        documentType
      );
      
      console.log('=== DOCUMENTO ENVIADO COM SUCESSO ===');
      console.log('Uploaded document response:', uploadedDoc);

      // Add to uploaded documents list for immediate UI update
      const newDocument: UploadedDocument = {
        id: uploadedDoc.id,
        document_type: documentType,
        document_name: file.name,
        file: uploadedDoc.file,
        is_verified: uploadedDoc.is_verified || false,
        is_required: uploadedDoc.is_required !== undefined ? uploadedDoc.is_required : true,
        uploaded_at: uploadedDoc.uploaded_at || new Date().toISOString()
      };

      console.log('=== ADICIONANDO DOCUMENTO AO ESTADO LOCAL ===');
      console.log('New document:', newDocument);
      setUploadedDocuments(prev => {
        // Remove any existing document of the same type to avoid duplicates
        const filteredPrev = prev.filter(d => d.document_type !== newDocument.document_type);
        const updated = [...filteredPrev, newDocument];
        console.log('Updated local documents:', updated);
        return updated;
      });

      // Refresh employee data but preserve uploaded documents
      console.log('Atualizando dados básicos do funcionário (preservando documentos)...');
      // Don't call fetchEmployee here to avoid overwriting uploadedDocuments

      toast.success(t('employees.documentAttachedSuccess'));

      // Check and update employee status after successful upload
      setTimeout(() => {
        checkAndUpdateEmployeeStatus();
      }, 1000);

    } catch (error: any) {
      console.error('Erro detalhado no upload:', error);
      
      let errorMessage = 'Erro ao enviar documento';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      // Remove document type from uploading set
      setUploadingDocuments(prev => {
        const next = new Set(prev);
        next.delete(documentType);
        return next;
      });
    }
  };

  const handleContractUpload = async (file: File) => {
    if (!employee || !canEdit) return;

    console.log('Iniciando upload do arquivo:', {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified
    });

    // Validate file
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error(t('validation.fileTooLarge'));
      return;
    }

    const allowedTypes = [
      'application/pdf', 
      'image/jpeg', 
      'image/png', 
      'image/jpg',
      'application/x-pdf',
      'application/acrobat',
      'applications/vnd.pdf',
      'text/pdf',
      'text/x-pdf'
    ];
    
    // Also check file extension as fallback
    const fileExtension = file.name.toLowerCase().split('.').pop();
    const allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png'];
    
    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension || '')) {
      console.log("Tipo de arquivo rejeitado:", file.type, "Extensão:", fileExtension);
      return;
    }

    try {
      setIsUploadingContract(true);
      console.log('=== INICIANDO UPLOAD DO CONTRATO ===');
      console.log('Employee ID:', employee.id);
      console.log('File details:', {
        name: file.name,
        size: file.size,
        type: file.type
      });
      
      // Upload document with work_contract type
      const uploadedDoc = await employeeService.uploadDocument(
        employee.id, 
        file, 
        'work_contract'
      );
      
      console.log('=== CONTRATO ENVIADO COM SUCESSO ===');
      console.log('Uploaded document response:', uploadedDoc);

      // Add to uploaded documents list for immediate UI update
      const newDocument: UploadedDocument = {
        id: uploadedDoc.id,
        document_type: 'work_contract',
        document_name: file.name,
        file: uploadedDoc.file,
        is_verified: uploadedDoc.is_verified || false,
        is_required: true,
        uploaded_at: uploadedDoc.uploaded_at || new Date().toISOString()
      };

      console.log('=== ADICIONANDO CONTRATO AO ESTADO LOCAL ===');
      console.log('New contract document:', newDocument);
      setUploadedDocuments(prev => {
        // Remove any existing contract to avoid duplicates
        const filteredPrev = prev.filter(d => d.document_type !== 'work_contract');
        const updated = [...filteredPrev, newDocument];
        console.log('Updated local documents with contract:', updated);
        return updated;
      });

      // Update local state immediately
      setContractDocument(uploadedDoc);

      // Update employee documents array immediately for UI
      setEmployee(prev => {
        if (!prev) return prev;
        const updatedDocuments = Array.isArray(prev.documents) ? [...prev.documents] : [];

        // Remove any existing work_contract document
        const filteredDocs = updatedDocuments.filter(doc => doc.document_type !== 'work_contract');

        // Add the new contract document
        filteredDocs.push({
          id: uploadedDoc.id,
          document_type: 'work_contract',
          document_name: file.name,
          file: uploadedDoc.file,
          is_verified: uploadedDoc.is_verified || false,
          is_required: true,
          uploaded_at: uploadedDoc.uploaded_at || new Date().toISOString()
        });

        return {
          ...prev,
          documents: filteredDocs
        };
      });

      // Double-check by reloading contract document
      await loadContractDocument();
      
      // Update employee status to 'approved' if all requirements are met
      if (employee.status === 'pending' || employee.status === 'under_review') {
        try {
          const updateData = {
            id: employee.id,
            status: 'approved' as const
          };
          
          console.log('=== ATUALIZANDO STATUS DO FUNCIONÁRIO ===');
          console.log('Update data:', updateData);
          
          const updatedEmployee = await employeeService.updateEmployee(updateData);
          console.log('Status updated response:', updatedEmployee);
          
          setEmployee(prev => ({ ...prev!, status: 'approved' }));
          console.log('=== STATUS ATUALIZADO PARA APROVADO ===');
          
        } catch (statusError) {
          console.error('Erro ao atualizar status do funcionário:', statusError);
          // Don't fail the whole operation if status update fails
        }
      }
      
      toast.success(t('employees.contractSent'));

      // Additional verification after a delay
      setTimeout(async () => {
        console.log('=== VERIFICAÇÃO FINAL ===');
        await loadContractDocument();

        // Refresh employee data to get updated documents
        const refreshedEmployee = await employeeService.getEmployee(employee.id);
        console.log('Employee after upload:', refreshedEmployee);
        console.log('Documents after upload:', (refreshedEmployee as any).documents);

        // Update local employee state with fresh data
        const updatedEmployeeData: EmployeeData = {
          ...refreshedEmployee as EmployeeData,
          documents: (refreshedEmployee as any).documents || []
        };
        setEmployee(updatedEmployeeData);
        setEditedEmployee(updatedEmployeeData);

        // Check and update employee status after successful contract upload
        checkAndUpdateEmployeeStatus();
      }, 1000);
      
    } catch (error: any) {
      console.error('Erro detalhado no upload:', error);
      console.log('Response data:', error.response?.data);
      console.log('Response status:', error.response?.status);
      console.log('Response headers:', error.response?.headers);
      
      let errorMessage = 'Erro ao enviar contrato de trabalho';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data) {
        errorMessage = JSON.stringify(error.response.data);
      } else if (error.message) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
    } finally {
      setIsUploadingContract(false);
    }
  };

  const fetchEmployee = async () => {
    try {
      setIsLoading(true);
      
      console.log('=== BUSCANDO DADOS DO FUNCIONÁRIO ===');
      console.log('Employee ID:', id);
      
      // Using the employees API endpoint
      const response = await employeeService.getEmployee(parseInt(id!));
      console.log('Employee data fetched:', response);
      console.log('Employee documents:', (response as any).documents);
      
      // Use documents from main response instead of separate call
      console.log('=== USANDO DOCUMENTOS DA RESPONSE PRINCIPAL ===');
      console.log('Main response documents:', (response as any).documents);
      console.log('Main response documents type:', typeof (response as any).documents);
      console.log('Main response documents is array:', Array.isArray((response as any).documents));

      // Ensure documents is always an array
      if (!Array.isArray((response as any).documents)) {
        console.log('Main response documents is not array, setting to empty array');
        (response as any).documents = [];
      } else {
        console.log('✅ Main response documents is array with', (response as any).documents.length, 'items');
      }

      // Temporarily disable separate document fetch to avoid conflicts
      /*
      try {
        const freshDocuments = await employeeService.getEmployeeDocuments(parseInt(id!));
        console.log('Fresh documents loaded successfully:', freshDocuments);
        console.log('Fresh documents type:', typeof freshDocuments);
        console.log('Fresh documents is array:', Array.isArray(freshDocuments));
        console.log('Fresh documents length:', Array.isArray(freshDocuments) ? freshDocuments.length : 'N/A');

        // Ensure freshDocuments is an array before merging
        if (Array.isArray(freshDocuments)) {
          (response as any).documents = freshDocuments;
          console.log('✅ Fresh documents applied to response');
        } else {
          console.warn('❌ Fresh documents is not an array:', freshDocuments);
          (response as any).documents = [];
        }
      } catch (docError) {
        console.error('❌ Failed to load fresh documents:', docError);
        console.log('Using documents from main employee response');
        // Ensure documents is always an array
        if (!Array.isArray((response as any).documents)) {
          console.log('Main response documents is not array, setting to empty array');
          (response as any).documents = [];
        } else {
          console.log('Main response documents is array with', (response as any).documents.length, 'items');
        }
      }
      */
      
      // Final safety check to ensure documents is always an array
      const employeeData = response as EmployeeData;
      if (!Array.isArray((employeeData as any).documents)) {
        (employeeData as any).documents = [];
      }
      
      setEmployee(employeeData);
      setEditedEmployee(employeeData);

      // Sync documents from backend to local state
      const backendDocuments = (employeeData as any).documents || [];
      console.log('=== CARREGANDO DOCUMENTOS DO BACKEND ===');
      console.log('Backend documents raw:', backendDocuments);
      console.log('Backend documents count:', backendDocuments.length);

      if (Array.isArray(backendDocuments)) {
        const formattedDocs: UploadedDocument[] = backendDocuments
          .filter((doc: any) => doc && doc.id && doc.document_type) // Filter invalid documents
          .map((doc: any) => ({
            id: doc.id,
            document_type: doc.document_type,
            document_name: doc.document_name || doc.name || `${doc.document_type}_documento`,
            file: doc.file || doc.url || '',
            is_verified: doc.is_verified || false,
            is_required: doc.is_required !== undefined ? doc.is_required : true,
            uploaded_at: doc.uploaded_at || doc.created_at || new Date().toISOString()
          }));

        console.log('Formatted documents:', formattedDocs);
        console.log('Document types found:', formattedDocs.map(d => d.document_type));

        // Always replace the local state with backend documents
        setUploadedDocuments(formattedDocs);
        console.log('Updated uploadedDocuments with', formattedDocs.length, 'documents');
      } else {
        console.log('No documents found or invalid format');
        setUploadedDocuments([]);
      }

      // Also load contract document after loading employee
      setTimeout(loadContractDocument, 100);
      
    } catch (error: any) {
      console.error('❌ Error fetching employee:', error);
      toast.error(t('common.error'));
      navigate('/employees');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof EmployeeData, value: string | number) => {
    if (editedEmployee) {
      setEditedEmployee(prev => ({
        ...prev!,
        [field]: value
      }));
    }
  };

  const handleSave = async () => {
    if (!editedEmployee || !canEdit) return;

    try {
      setIsSaving(true);
      
      console.log('=== SALVANDO DADOS DO FUNCIONÁRIO ===');
      console.log('Employee ID:', editedEmployee.id);
      console.log('Data to save:', editedEmployee);
      
      // Update employee data
      const { id, user, employee_id, admission_completed, created_at, updated_at, documents, ...updateData } = editedEmployee;
      
      console.log('Filtered update data:', updateData);
      
      const updatedEmployee = await employeeService.updateEmployee({
        id,
        ...updateData
      } as any);
      
      console.log('=== DADOS SALVOS COM SUCESSO ===');
      console.log('Updated employee response:', updatedEmployee);
      
      // Update local state with response data
      setEmployee(updatedEmployee as EmployeeData);
      setEditedEmployee(updatedEmployee as EmployeeData);
      setIsEditing(false);
      
      // Refresh employee data to ensure consistency
      setTimeout(fetchEmployee, 500);
      
      toast.success(t('common.success'));
      
    } catch (error: any) {
      console.error('❌ Error updating employee:', error);
      let errorMessage = 'Erro ao salvar dados do funcionário no banco';
      
      if (error?.response?.data) {
        const errorData = error.response.data;
        if (typeof errorData === 'object') {
          const fieldErrors = [];
          for (const [field, errors] of Object.entries(errorData)) {
            if (Array.isArray(errors)) {
              fieldErrors.push(`${field}: ${errors.join(', ')}`);
            } else if (typeof errors === 'string') {
              fieldErrors.push(`${field}: ${errors}`);
            }
          }
          if (fieldErrors.length > 0) {
            errorMessage = `Erros de validação: ${fieldErrors.join('; ')}`;
          }
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelAdmission = async () => {
    if (!employee || !canCancelAdmission) return;

    try {
      // Atualizar status para 'cancelled' em vez de excluir
      await employeeService.updateEmployee({
        id: employee.id,
        status: 'cancelled'
      } as any);
      
      setEmployee({ ...employee, status: 'cancelled' });
      toast.success(t('employees.admissionCancelled'));
      navigate('/employees');
    } catch (error: any) {
      console.error('Error cancelling admission:', error);
      toast.error(t('common.error'));
    }
  };

  const cancelEdit = () => {
    setEditedEmployee(employee);
    setIsEditing(false);
  };

  const renderAccountingDocuments = () => {
    // Verificar se employee existe
    if (!employee) {
      return (
        <div className="bg-white rounded-xl shadow-soft p-6">
          <div className="text-center py-12">
            <p className="text-neutral-600">{t('employees.loadingEmployeeData')}</p>
          </div>
        </div>
      );
    }

    // Garantir que documents seja sempre um array
    const documents = Array.isArray(employee.documents) ? employee.documents : [];

    // Tipos de documentos específicos para contabilidade
    const accountingDocumentTypes = [
      { type: 'work_contract', name: t('employees.workContract'), required: true },
    ];

    // Check if all accounting documents are uploaded
    const accountingDocsUploaded = accountingDocumentTypes.every(docType =>
      documents.some(doc => doc.document_type === docType.type) ||
      uploadedDocuments.some(doc => doc.document_type === docType.type)
    );

    return (
      <div className="bg-white rounded-xl shadow-soft p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-neutral-900">{t('employees.accountingDocuments')}</h3>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-neutral-500">
              Total: {documents.filter(d => accountingDocumentTypes.some(t => t.type === d.document_type)).length} documentos
            </span>
            <span className="text-sm text-success-600">
              Verificados: {documents.filter(d => d.is_verified && accountingDocumentTypes.some(t => t.type === d.document_type)).length}
            </span>
            {accountingDocsUploaded && (
              <Badge variant="success">
                <CheckCircleIcon className="w-4 h-4 mr-1" />
                {t('employees.completedDocuments')}
              </Badge>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accountingDocumentTypes.map((docType) => {
            // Check both backend documents and local uploaded documents
            const backendDocument = documents.find(d => d.document_type === docType.type);
            const uploadedDocument = uploadedDocuments.find(u => u.document_type === docType.type);
            const document = uploadedDocument || backendDocument;
            const isUploading = uploadingDocuments.has(docType.type);
            
            return (
              <div key={docType.type} className="relative">
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleContractUpload(file);
                    }
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  id={`file-${docType.type}`}
                  disabled={isUploading}
                />
                <div
                  className={`relative p-6 rounded-xl border-2 border-dashed transition-all duration-200 hover:scale-105 cursor-pointer ${
                    document
                      ? 'border-success-300 bg-success-50 hover:bg-success-100'
                      : docType.required
                      ? 'border-warning-300 bg-warning-50 hover:bg-warning-100'
                      : 'border-neutral-300 bg-neutral-50 hover:bg-neutral-100'
                  }`}
                >
                  <div className="text-center">
                    <div className="mb-3">
                      {document ? (
                        <CheckCircleIcon className="w-8 h-8 text-success-500 mx-auto" />
                      ) : (
                        <CloudArrowUpIcon className="w-8 h-8 text-neutral-400 mx-auto" />
                      )}
                    </div>

                    <h4 className="font-medium text-neutral-900 mb-1">{docType.name}</h4>

                    <p className={`text-xs mb-2 ${
                      docType.required ? 'text-warning-600' : 'text-neutral-500'
                    }`}>
                      {docType.required ? t('employees.required') : t('employees.optional')}
                    </p>

                    {document ? (
                      <div className="space-y-2">
                        <p className="text-sm text-neutral-700 truncate" title={document.document_name}>
                          {document.document_name}
                        </p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(document.file, '_blank');
                          }}
                          className="text-xs text-primary-600 hover:text-primary-800 font-medium"
                        >
                          {t('employees.view')}
                        </button>
                      </div>
                    ) : (
                      <div className="text-center">
                        {isUploading ? (
                          <div className="space-y-2">
                            <div className="animate-spin w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full mx-auto"></div>
                            <p className="text-xs text-primary-600 font-medium">{t('employees.saving')}</p>
                          </div>
                        ) : (
                          <p className="text-xs text-neutral-500">
                            {t('employees.clickToUpload')}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    );
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'pending':
        return 'warning';
      case 'under_review':
        return 'info';
      case 'approved':
        return 'success';
      case 'inactive':
        return 'danger';
      case 'cancelled':
        return 'danger';
      default:
        return 'default';
    }
  };

  // Kit Demissional functions
  const handleTerminationDocumentUpload = async (file: File) => {
    if (!employee?.id) return;

    try {
      setIsUploadingTerminationDoc(true);

      // Create a unique document object
      const newDoc = {
        id: Date.now(),
        name: file.name,
        type: file.type,
        size: file.size,
        uploadDate: new Date().toISOString(),
        file: file,
        url: URL.createObjectURL(file),
        employeeId: employee.id
      };

      // Save to localStorage
      const storageKey = `termination-docs-${employee.id}`;
      const existingDocs = JSON.parse(localStorage.getItem(storageKey) || '[]');
      const updatedDocs = [...existingDocs, newDoc];
      localStorage.setItem(storageKey, JSON.stringify(updatedDocs));

      // Update state
      setTerminationDocuments(updatedDocs);

      toast.success(t('employees.documentAddedToTerminationKit', { fileName: file.name }));
    } catch (error) {
      console.error('Error uploading termination document:', error);
      toast.error('Erro ao adicionar documento');
    } finally {
      setIsUploadingTerminationDoc(false);
    }
  };

  const handleTerminationDocumentRemove = async (docId: number) => {
    if (!employee?.id) return;

    try {
      const storageKey = `termination-docs-${employee.id}`;
      const existingDocs = JSON.parse(localStorage.getItem(storageKey) || '[]');
      const updatedDocs = existingDocs.filter((doc: any) => doc.id !== docId);
      localStorage.setItem(storageKey, JSON.stringify(updatedDocs));

      setTerminationDocuments(updatedDocs);
      toast.success(t('employees.documentRemovedFromTerminationKit'));
    } catch (error) {
      console.error('Error removing termination document:', error);
      toast.error('Erro ao remover documento');
    }
  };

  const loadTerminationDocuments = () => {
    if (!employee?.id) return;

    const storageKey = `termination-docs-${employee.id}`;
    const savedDocs = JSON.parse(localStorage.getItem(storageKey) || '[]');
    setTerminationDocuments(savedDocs);
  };

  const renderTerminationDocuments = () => {
    return (
      <div className="bg-white rounded-xl shadow-soft p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-semibold text-neutral-900">{t('employees.terminationKit')}</h3>
            <p className="text-sm text-neutral-600">
              {t('employees.terminationKitDescription')}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="primary"
              icon={<CloudArrowUpIcon className="h-4 w-4" />}
              onClick={() => {
                const fileInput = document.createElement('input');
                fileInput.type = 'file';
                fileInput.accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png';
                fileInput.multiple = false;
                fileInput.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (file) {
                    handleTerminationDocumentUpload(file);
                  }
                };
                fileInput.click();
              }}
              disabled={isUploadingTerminationDoc}
            >
              {isUploadingTerminationDoc ? t('employees.adding') : t('employees.addDocument')}
            </Button>
            <button
              onClick={loadTerminationDocuments}
              className="text-sm text-primary-600 hover:text-primary-800 font-medium"
              title="Recarregar documentos"
            >
              🔄 {t('employees.updateDocuments')}
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {terminationDocuments.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-neutral-300 rounded-lg">
              <PaperClipIcon className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-neutral-900 mb-2">
                {t('employees.noDocumentsAdded')}
              </h4>
              <p className="text-neutral-600 mb-4">
                {t('employees.addTerminationDocs')}
              </p>
              <Button
                variant="primary"
                icon={<CloudArrowUpIcon className="h-4 w-4" />}
                onClick={() => {
                  const fileInput = document.createElement('input');
                  fileInput.type = 'file';
                  fileInput.accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png';
                  fileInput.multiple = false;
                  fileInput.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) {
                      handleTerminationDocumentUpload(file);
                    }
                  };
                  fileInput.click();
                }}
              >
                {t('employees.addFirstDocument')}
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {terminationDocuments.map((doc: any) => (
                <div key={doc.id} className="border border-neutral-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <PaperClipIcon className="h-5 w-5 text-neutral-500" />
                      <span className="text-sm font-medium text-neutral-900">
                        {doc.name.length > 20 ? `${doc.name.substring(0, 20)}...` : doc.name}
                      </span>
                    </div>
                    <button
                      onClick={() => handleTerminationDocumentRemove(doc.id)}
                      className="text-red-500 hover:text-red-700 text-sm"
                      title="Remover documento"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="text-xs text-neutral-500 mb-3">
                    <p>{t('employees.size')}: {(doc.size / 1024 / 1024).toFixed(2)} MB</p>
                    <p>{t('employees.addedOn')}: {new Date(doc.uploadDate).toLocaleDateString('pt-BR')}</p>
                  </div>

                  <div className="flex space-x-2">
                    <a
                      href={doc.url}
                      download={doc.name}
                      className="flex-1 bg-primary-50 text-primary-700 text-xs py-2 px-3 rounded text-center hover:bg-primary-100 transition-colors"
                    >
                      {t('employees.download')}
                    </a>
                    <button
                      onClick={() => window.open(doc.url, '_blank')}
                      className="flex-1 bg-neutral-50 text-neutral-700 text-xs py-2 px-3 rounded hover:bg-neutral-100 transition-colors"
                    >
                      Visualizar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };


  // Helper function to check if all required documents are uploaded
  const checkTabCompletion = (tabId: string) => {
    if (!employee) return false;

    const documents = Array.isArray(employee.documents) ? employee.documents : [];

    switch (tabId) {
      case 'documents': {
        const requiredEmployeeDocuments = ['rg', 'birth_certificate', 'education_certificate', 'work_card', 'medical_exam'];
        return requiredEmployeeDocuments.every(docType =>
          documents.some(doc => doc.document_type === docType) ||
          uploadedDocuments.some(doc => doc.document_type === docType)
        );
      }
      case 'accounting_docs': {
        const requiredAccountingDocuments = ['work_contract'];
        return requiredAccountingDocuments.every(docType =>
          documents.some(doc => doc.document_type === docType) ||
          uploadedDocuments.some(doc => doc.document_type === docType)
        );
      }
      default:
        return false;
    }
  };

  const tabs = [
    { id: 'personal', name: t('employees.personalInfo'), icon: UserIcon },
    { id: 'address', name: t('employees.addressInfo'), icon: MapPinIcon },
    { id: 'work', name: t('employees.workInfo'), icon: IdentificationIcon },
    { id: 'banking', name: t('employees.bankingInfo'), icon: BanknotesIcon },
    {
      id: 'documents',
      name: t('employees.employeeDocuments'),
      icon: DocumentTextIcon,
      completed: checkTabCompletion('documents')
    },
    {
      id: 'accounting_docs',
      name: t('employees.accountingDocuments'),
      icon: BanknotesIcon,
      completed: checkTabCompletion('accounting_docs')
    },
    {
      id: 'termination_docs',
      name: t('employees.terminationKit'),
      icon: PaperClipIcon,
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">{t('employees.employeeNotFound')}</h2>
          <Button onClick={() => navigate('/employees')}>
            {t('employees.backToEmployeeList')}
          </Button>
        </div>
      </div>
    );
  }

  const renderPersonalInfo = () => {
    if (!employee) {
      return (
        <div className="bg-white rounded-xl shadow-soft p-6">
          <div className="text-center py-12">
            <p className="text-neutral-600">{t('employees.loadingEmployeeData')}</p>
          </div>
        </div>
      );
    }

    return (
    <div className="space-y-6">
      {/* Basic Info */}
      <div className="bg-white rounded-xl shadow-soft p-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">{t('employees.basicInfo')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label={t('employees.fullName')}
            value={isEditing ? editedEmployee?.full_name || '' : employee.full_name || ''}
            onChange={(e) => handleInputChange('full_name', e.target.value)}
            disabled={!isEditing || !canEdit}
          />
          <Input
            label={t('employees.cpf')}
            value={isEditing ? editedEmployee?.cpf || '' : employee.cpf || ''}
            onChange={(e) => handleInputChange('cpf', e.target.value)}
            disabled={!isEditing || !canEdit}
          />
          <Input
            label={t('employees.rg')}
            value={isEditing ? editedEmployee?.rg || '' : employee.rg || ''}
            onChange={(e) => handleInputChange('rg', e.target.value)}
            disabled={!isEditing || !canEdit}
          />
          <Input
            label={t('employees.birthDate')}
            type="date"
            value={isEditing ? editedEmployee?.birth_date || '' : employee.birth_date || ''}
            onChange={(e) => handleInputChange('birth_date', e.target.value)}
            disabled={!isEditing || !canEdit}
          />
          <Select
            label={t('employees.maritalStatus')}
            value={isEditing ? editedEmployee?.marital_status || '' : employee.marital_status || ''}
            onChange={(value) => handleInputChange('marital_status', value)}
            options={maritalStatusOptions}
            disabled={!isEditing || !canEdit}
          />
          <Input
            label={t('employees.phone')}
            value={isEditing ? editedEmployee?.phone || '' : employee.phone || ''}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            disabled={!isEditing || !canEdit}
          />
        </div>
      </div>

      {/* Work Documents */}
      <div className="bg-white rounded-xl shadow-soft p-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">{t('employees.workDocuments')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label={t('employees.pisPassep')}
            value={isEditing ? editedEmployee?.pis_pasep || '' : employee.pis_pasep || ''}
            onChange={(e) => handleInputChange('pis_pasep', e.target.value)}
            disabled={!isEditing || !canEdit}
          />
          <Input
            label={t('employees.workCardNumber')}
            value={isEditing ? editedEmployee?.work_card_number || '' : employee.work_card_number || ''}
            onChange={(e) => handleInputChange('work_card_number', e.target.value)}
            disabled={!isEditing || !canEdit}
          />
          <Input
            label={t('employees.workCardSeries')}
            value={isEditing ? editedEmployee?.work_card_series || '' : employee.work_card_series || ''}
            onChange={(e) => handleInputChange('work_card_series', e.target.value)}
            disabled={!isEditing || !canEdit}
          />
        </div>
      </div>

      {/* Education */}
      <div className="bg-white rounded-xl shadow-soft p-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">{t('employees.education')}</h3>
        <Select
          label={t('employees.educationLevel')}
          value={isEditing ? editedEmployee?.education_level || '' : employee.education_level || ''}
          onChange={(value) => handleInputChange('education_level', value)}
          options={educationLevelOptions}
          disabled={!isEditing || !canEdit}
        />
      </div>
    </div>
    );
  };

  const renderAddressInfo = () => {
    if (!employee) {
      return (
        <div className="bg-white rounded-xl shadow-soft p-6">
          <div className="text-center py-12">
            <p className="text-neutral-600">{t('employees.loadingEmployeeData')}</p>
          </div>
        </div>
      );
    }

    return (
    <div className="bg-white rounded-xl shadow-soft p-6">
      <h3 className="text-lg font-semibold text-neutral-900 mb-4">{t('employees.residentialAddress')}</h3>
      
      {/* CEP first for auto-fill */}
      <div className="mb-4">
        <CEPInput
          label={t('employees.cep')}
          value={isEditing ? editedEmployee?.zip_code || '' : employee.zip_code || ''}
          onChange={(value) => handleInputChange('zip_code', value)}
          onAddressChange={(address) => {
            if (isEditing && canEdit) {
              setEditedEmployee(prev => ({
                ...prev!,
                zip_code: address.zip_code,
                street_address: address.street_address,
                neighborhood: address.neighborhood,
                city: address.city,
                state: address.state,
                address_complement: address.complement || prev!.address_complement,
              }));
              toast.success('Endereço preenchido automaticamente!');
            }
          }}
          disabled={!isEditing || !canEdit}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <Input
            label={t('employees.address')}
            value={isEditing ? editedEmployee?.street_address || '' : employee.street_address || ''}
            onChange={(e) => handleInputChange('street_address', e.target.value)}
            disabled={!isEditing || !canEdit}
          />
        </div>
        <Input
          label={t('employees.number')}
          value={isEditing ? editedEmployee?.address_number || '' : employee.address_number || ''}
          onChange={(e) => handleInputChange('address_number', e.target.value)}
          disabled={!isEditing || !canEdit}
        />
        <Input
          label={t('employees.complement')}
          value={isEditing ? editedEmployee?.address_complement || '' : employee.address_complement || ''}
          onChange={(e) => handleInputChange('address_complement', e.target.value)}
          disabled={!isEditing || !canEdit}
        />
        <Input
          label={t('employees.neighborhood')}
          value={isEditing ? editedEmployee?.neighborhood || '' : employee.neighborhood || ''}
          onChange={(e) => handleInputChange('neighborhood', e.target.value)}
          disabled={!isEditing || !canEdit}
        />
        <Input
          label={t('employees.city')}
          value={isEditing ? editedEmployee?.city || '' : employee.city || ''}
          onChange={(e) => handleInputChange('city', e.target.value)}
          disabled={!isEditing || !canEdit}
        />
        <Select
          label={t('employees.state')}
          value={isEditing ? editedEmployee?.state || '' : employee.state || ''}
          onChange={(value) => handleInputChange('state', value)}
          options={brazilianStates}
          disabled={!isEditing || !canEdit}
        />
      </div>
    </div>
    );
  };

  const renderWorkInfo = () => {
    if (!employee) {
      return (
        <div className="bg-white rounded-xl shadow-soft p-6">
          <div className="text-center py-12">
            <p className="text-neutral-600">{t('employees.loadingEmployeeData')}</p>
          </div>
        </div>
      );
    }

    return (
    <div className="bg-white rounded-xl shadow-soft p-6">
      <h3 className="text-lg font-semibold text-neutral-900 mb-4">{t('employees.professionalInfo')}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label={t('employees.department')}
          value={isEditing ? editedEmployee?.department || '' : employee.department || ''}
          onChange={(e) => handleInputChange('department', e.target.value)}
          disabled={!isEditing || !canEdit}
        />
        <Input
          label={t('employees.position')}
          value={isEditing ? editedEmployee?.position || '' : employee.position || ''}
          onChange={(e) => handleInputChange('position', e.target.value)}
          disabled={!isEditing || !canEdit}
        />
        <Input
          label={t('employees.admissionDate')}
          type="date"
          value={isEditing ? editedEmployee?.hire_date || '' : employee.hire_date || ''}
          onChange={(e) => handleInputChange('hire_date', e.target.value)}
          disabled={!isEditing || !canEdit}
        />
        <Input
          label={t('employees.salary')}
          type="number"
          step="0.01"
          value={isEditing ? editedEmployee?.salary || '' : employee.salary || ''}
          onChange={(e) => handleInputChange('salary', parseFloat(e.target.value) || 0)}
          disabled={!isEditing || !canEdit}
        />
      </div>
    </div>
    );
  };

  const renderBankingInfo = () => {
    if (!employee) {
      return (
        <div className="bg-white rounded-xl shadow-soft p-6">
          <div className="text-center py-12">
            <p className="text-neutral-600">{t('employees.loadingEmployeeData')}</p>
          </div>
        </div>
      );
    }

    return (
    <div className="bg-white rounded-xl shadow-soft p-6">
      <h3 className="text-lg font-semibold text-neutral-900 mb-4">{t('employees.bankingData')}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label={t('employees.bankName')}
          value={isEditing ? editedEmployee?.bank_name || '' : employee.bank_name || ''}
          onChange={(e) => handleInputChange('bank_name', e.target.value)}
          disabled={!isEditing || !canEdit}
        />
        <Input
          label={t('employees.bankCode')}
          value={isEditing ? editedEmployee?.bank_code || '' : employee.bank_code || ''}
          onChange={(e) => handleInputChange('bank_code', e.target.value)}
          disabled={!isEditing || !canEdit}
          maxLength={6}
        />
        <Input
          label={t('employees.agency')}
          value={isEditing ? editedEmployee?.agency_number || '' : employee.agency_number || ''}
          onChange={(e) => handleInputChange('agency_number', e.target.value)}
          disabled={!isEditing || !canEdit}
        />
        <Input
          label={t('employees.account')}
          value={isEditing ? editedEmployee?.account_number || '' : employee.account_number || ''}
          onChange={(e) => handleInputChange('account_number', e.target.value)}
          disabled={!isEditing || !canEdit}
        />
        <Select
          label={t('employees.accountType')}
          value={isEditing ? editedEmployee?.account_type || '' : employee.account_type || ''}
          onChange={(value) => handleInputChange('account_type', value)}
          options={accountTypeOptions}
          disabled={!isEditing || !canEdit}
        />
      </div>
    </div>
    );
  };

  const renderDocuments = () => {
    // Verificar se employee existe
    if (!employee) {
      return (
        <div className="bg-white rounded-xl shadow-soft p-6">
          <div className="text-center py-12">
            <p className="text-neutral-600">{t('employees.loadingEmployeeData')}</p>
          </div>
        </div>
      );
    }

    // Garantir que documents seja sempre um array
    const documents = Array.isArray(employee.documents) ? employee.documents : [];
    
    console.log('=== RENDERIZANDO DOCUMENTOS ===');
    console.log('Employee ID:', employee.id);
    console.log('Employee documents raw:', employee.documents);
    console.log('Employee documents type:', typeof employee.documents);
    console.log('Is array:', Array.isArray(employee.documents));
    console.log('Total documents:', documents.length);
    console.log('Documents:', documents);
    
    // Tipos de documentos esperados (sincronizado com backend)
    const documentTypes = [
      { type: 'rg', name: t('employees.documentTypes.rg'), required: true },
      { type: 'birth_certificate', name: t('employees.documentTypes.birthCertificate'), required: true },
      { type: 'education_certificate', name: t('employees.documentTypes.educationCertificate'), required: true },
      { type: 'work_card', name: t('employees.documentTypes.workCard'), required: true },
      { type: 'medical_exam', name: t('employees.documentTypes.medicalExam'), required: true },
      { type: 'bank_document', name: t('employees.documentTypes.bankDocument'), required: false },
      { type: 'address_proof', name: t('employees.documentTypes.addressProof'), required: false },
      { type: 'marriage_certificate', name: t('employees.documentTypes.marriageCertificate'), required: false },
      { type: 'other', name: t('employees.documentTypes.other'), required: false }
    ];

    return (
      <div className="bg-white rounded-xl shadow-soft p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-neutral-900">Documentos do Funcionário</h3>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-neutral-500">
              Total: {documents.length} documentos
            </span>
            <span className="text-sm text-success-600">
              Verificados: {documents.filter(d => d.is_verified).length}
            </span>
            {canEdit && (
              <Button
                size="sm"
                onClick={() => {
                  // Trigger file input for multiple document upload
                  const fileInput = document.createElement('input');
                  fileInput.type = 'file';
                  fileInput.accept = '.pdf,.jpg,.jpeg,.png';
                  fileInput.multiple = false;
                  fileInput.onchange = (e: any) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      // Show modal to select document type
                      const docType = prompt('Tipo de documento:\nrg, birth_certificate, education_certificate, work_card, medical_exam, bank_document, address_proof, marriage_certificate, other', 'other');
                      if (docType) {
                        handleDocumentUpload(file, docType);
                      }
                    }
                  };
                  fileInput.click();
                }}
              >
                + {t('employees.addDocument')}
              </Button>
            )}
            <button 
              onClick={() => {
                console.log('Recarregando dados do funcionário e documentos...');
                fetchEmployee();
              }}
              className="text-sm text-primary-600 hover:text-primary-800 font-medium"
              title="Recarregar documentos"
            >
              🔄 {t('employees.updateDocuments')}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documentTypes.map((docType) => {
              // Check both backend documents and local uploaded documents
              const backendDocument = documents.find(d => d.document_type === docType.type);
              const uploadedDocument = uploadedDocuments.find(u => u.document_type === docType.type);
              const document = uploadedDocument || backendDocument;
              const isUploading = uploadingDocuments.has(docType.type);
              
              return (
                <div key={docType.type} className="relative">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleDocumentUpload(file, docType.type);
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    id={`file-${docType.type}`}
                    disabled={isUploading}
                  />
                  <div
                    className={`relative p-6 rounded-xl border-2 border-dashed transition-all duration-200 hover:scale-105 cursor-pointer ${
                      document
                        ? 'border-success-300 bg-success-50 hover:bg-success-100'
                        : docType.required
                        ? 'border-warning-300 bg-warning-50 hover:bg-warning-100'
                        : 'border-neutral-300 bg-neutral-50 hover:bg-neutral-100'
                    }`}
                  >
                    <div className="text-center">
                      <div className="mb-3">
                        {document ? (
                          <CheckCircleIcon className="w-8 h-8 text-success-500 mx-auto" />
                        ) : (
                          <CloudArrowUpIcon className="w-8 h-8 text-neutral-400 mx-auto" />
                        )}
                      </div>

                      <h4 className="font-medium text-neutral-900 mb-1">{docType.name}</h4>

                      <p className={`text-xs mb-2 ${
                        docType.required ? 'text-warning-600' : 'text-neutral-500'
                      }`}>
                        {docType.required ? t('employees.required') : t('employees.optional')}
                      </p>

                      {document ? (
                        <div className="space-y-1">
                          <div className="flex items-center justify-center text-xs text-success-600">
                            <PaperClipIcon className="w-3 h-3 mr-1" />
                            {document.document_name}
                          </div>
                          <p className="text-xs text-success-600 font-medium">{t('employees.sent')}</p>
                          <p className="text-xs text-neutral-500">{t('employees.clickToReplace')}</p>
                        </div>
                      ) : isUploading ? (
                        <div className="space-y-1">
                          <div className="animate-spin w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full mx-auto"></div>
                          <p className="text-xs text-primary-600 font-medium">{t('employees.saving')}</p>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <p className="text-xs text-neutral-600 font-medium">{t('employees.clickToSend')}</p>
                          <p className="text-xs text-neutral-500">PDF, JPG ou PNG</p>
                          <p className="text-xs text-neutral-500">Máx. 10MB</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

      </div>
    );
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="secondary"
            icon={<ArrowLeftIcon />}
            onClick={() => navigate('/employees')}
          >
            {t('common.back')}
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">
              {employee?.full_name || formatName(employee?.user?.first_name || '', employee?.user?.last_name || '')}
            </h1>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-neutral-600">ID: {employee?.employee_id || t('employees.loading')}</span>
              <Badge variant={getStatusBadgeVariant(employee?.status || 'pending')}>
                {employee?.status || t('employees.loading')}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between w-full">
          {/* Badges e indicadores à esquerda */}
          <div className="flex items-center space-x-2">
            {!canEdit && (
              <Badge variant="info">
                <EyeIcon className="w-4 h-4 mr-1" />
                Somente Visualização
              </Badge>
            )}
          </div>

          {/* Botões de ação à direita - mesmo tamanho das outras seções */}
          <div className="flex items-center justify-end space-x-2 flex-1 max-w-md ml-auto">
            {canEdit && !isEditing && (
              <Button
                icon={<PencilIcon />}
                onClick={() => setIsEditing(true)}
              >
                {t('common.edit')}
              </Button>
            )}
            
            {/* Botão Salvar sempre visível quando pode editar */}
            {canEdit && (
              <Button
                icon={<CheckCircleIcon />}
                onClick={handleSave}
                isLoading={isSaving}
                disabled={!isEditing || isSaving}
                className="bg-success-500 hover:bg-success-600 text-white border-success-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                💾 {isEditing ? t('employees.saveInDatabase') : t('employees.saveActivateEdit')}
              </Button>
            )}
            
            {canEdit && isEditing && (
              <Button
                variant="secondary"
                onClick={cancelEdit}
              >
                {t('common.cancel')}
              </Button>
            )}
            
            {canCancelAdmission && employee && employee?.status !== 'cancelled' && (
              <Button
                variant="error"
                icon={<XCircleIcon />}
                onClick={() => setIsCancelAdmissionModalOpen(true)}
              >
                {t('employees.cancelAdmission')}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Employee Profile Header */}
      <div className="bg-white rounded-xl shadow-soft p-6">
        <div className="flex items-center space-x-6">
          <div className="h-20 w-20 rounded-full bg-primary-500 flex items-center justify-center">
            <span className="text-2xl font-bold text-white">
              {(() => {
                if (employee && employee.full_name) {
                  const names = employee.full_name.split(' ');
                  return getInitials(names[0], names.slice(1).join(' '));
                } else if (employee && employee.user && employee.user.first_name && employee.user.last_name) {
                  return getInitials(employee.user.first_name, employee.user.last_name);
                }
                return '??';
              })()}
            </span>
          </div>
          
          <div className="flex-1">
            <h2 className="text-xl font-bold text-neutral-900">
              {employee?.full_name || formatName(employee?.user?.first_name || '', employee?.user?.last_name || '')}
            </h2>
            <p className="text-neutral-600">{employee?.email || employee?.user?.email || 'Email não disponível'}</p>
            <div className="mt-2 flex items-center space-x-4">
              <span className="text-sm text-neutral-500">
                <strong>{t('employees.role')}:</strong> {employee?.position || t('employees.notInformed')}
              </span>
              <span className="text-sm text-neutral-500">
                <strong>{t('employees.department')}:</strong> {employee?.department || t('employees.notInformed')}
              </span>
              <span className="text-sm text-neutral-500">
                <strong>{t('employees.admission')}:</strong> {employee && employee.hire_date ? new Date(employee.hire_date).toLocaleDateString('pt-BR') : t('employees.notInformed')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-soft">
        <div className="border-b border-neutral-200">
          <div className="flex justify-between items-center px-6 py-2">
            <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isCompleted = (tab as any).completed;
              return (
                <button
                  key={tab.id}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                  }`}
                  onClick={() => setActiveTab(tab.id as any)}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                  {isCompleted && (
                    <CheckCircleIcon className="w-4 h-4 text-success-500" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'personal' && renderPersonalInfo()}
          {activeTab === 'address' && renderAddressInfo()}
          {activeTab === 'work' && renderWorkInfo()}
          {activeTab === 'banking' && renderBankingInfo()}
          {activeTab === 'documents' && renderDocuments()}
          {activeTab === 'accounting_docs' && renderAccountingDocuments()}
          {activeTab === 'termination_docs' && renderTerminationDocuments()}
        </div>
      </div>

      {/* Cancel Admission Confirmation Modal */}
      <Modal
        isOpen={isCancelAdmissionModalOpen}
        onClose={() => setIsCancelAdmissionModalOpen(false)}
        title={t('employees.cancelAdmissionProcess')}
        size="md"
      >
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <XCircleIcon className="h-10 w-10 text-warning-500" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-neutral-900">
                {t('employees.cancelEmployeeAdmission')}
              </h3>
              <p className="text-sm text-neutral-600">
                {t('employees.admissionWillBeCancelled')}
              </p>
            </div>
          </div>
          
          <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
            <p className="text-sm text-warning-800">
              <strong>{t('employees.employee')}:</strong> {employee?.full_name || formatName(employee?.user?.first_name || '', employee?.user?.last_name || '')}<br />
              <strong>ID:</strong> {employee?.employee_id || 'N/A'}<br />
              <strong>E-mail:</strong> {employee?.email || employee?.user?.email || 'N/A'}
            </p>
          </div>

          <div className="bg-info-50 border border-info-200 rounded-lg p-4">
            <p className="text-sm text-info-800">
              <strong>{t('common.info')}:</strong> {t('employees.importantAfterCancel')}
            </p>
          </div>
        </div>

        <div className="flex justify-end space-x-2 mt-6">
          <Button
            variant="secondary"
            onClick={() => setIsCancelAdmissionModalOpen(false)}
          >
            {t('common.back')}
          </Button>
          <Button
            variant="error"
            onClick={handleCancelAdmission}
            icon={<XCircleIcon />}
          >
            {t('employees.confirmCancellation')}
          </Button>
        </div>
      </Modal>
      </div>
      </div>
    </div>
  );
};

export default EmployeeDetail;