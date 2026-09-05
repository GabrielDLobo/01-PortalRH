import React, { useState, useEffect } from 'react';
import {
  PlusIcon,
  CheckIcon,
  XMarkIcon,
  CalendarDaysIcon,
  ListBulletIcon,
  ClockIcon,
  UserGroupIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { StatCard } from '../components';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import { Employee } from '../types/employee';
import { employeeService } from '../services/employeeService';
import { formatName } from '../utils/formatters';
import toast from 'react-hot-toast';

interface LeaveStats {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  employeesOnLeave: number;
}

interface LeaveRequest {
  id: number;
  employee: Employee;
  leaveType: string;
  startDate: string;
  endDate: string;
  numberOfDays: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

const LeaveRequests: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [stats, setStats] = useState<LeaveStats>({
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    employeesOnLeave: 0
  });
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [isLoading, setIsLoading] = useState(true);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  
  // Leave Request Modal State
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [availableEmployees, setAvailableEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [leaveType, setLeaveType] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [numberOfDays, setNumberOfDays] = useState<number>(1);
  const [reason, setReason] = useState<string>('');
  const [employeeSearch, setEmployeeSearch] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // localStorage functions
  const saveLeaveRequestsToStorage = (requests: LeaveRequest[]) => {
    try {
      localStorage.setItem('leaveRequests', JSON.stringify(requests));
    } catch (error) {
      console.error('Error saving leave requests to localStorage:', error);
    }
  };

  const loadLeaveRequestsFromStorage = (): LeaveRequest[] => {
    try {
      const saved = localStorage.getItem('leaveRequests');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Error loading leave requests from localStorage:', error);
    }
    return [];
  };

  useEffect(() => {
    // Load saved requests from localStorage
    const savedRequests = loadLeaveRequestsFromStorage();

    // If no saved requests, add some example data for testing
    let requestsToUse = savedRequests;
    if (savedRequests.length === 0) {
      const exampleRequests: LeaveRequest[] = [
        {
          id: 1,
          employee: {
            id: 1,
            employee_id: "EMP001",
            user: {
              id: 1,
              first_name: "João",
              last_name: "Silva",
              email: "joao.silva@example.com",
              is_active: true
            },
            status: "active",
            hire_date: "2023-01-15",
            position: "Desenvolvedor",
            department: "TI",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          } as Employee,
          leaveType: "vacation",
          startDate: "2025-01-15",
          endDate: "2025-01-25",
          numberOfDays: 11,
          reason: "Férias de verão",
          status: "pending",
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          employee: {
            id: 2,
            employee_id: "EMP002",
            user: {
              id: 2,
              first_name: "Maria",
              last_name: "Santos",
              email: "maria.santos@example.com",
              is_active: true
            },
            status: "active",
            hire_date: "2022-03-10",
            position: "Analista",
            department: "RH",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          } as Employee,
          leaveType: "sick_leave",
          startDate: "2025-01-10",
          endDate: "2025-01-12",
          numberOfDays: 3,
          reason: "Consulta médica",
          status: "approved",
          createdAt: new Date().toISOString()
        }
      ];
      requestsToUse = exampleRequests;
      // Save example data to localStorage for future loads
      saveLeaveRequestsToStorage(exampleRequests);
    }

    setLeaveRequests(requestsToUse);

    // Update stats based on requests
    const totalRequests = requestsToUse.length;
    const pendingRequests = requestsToUse.filter(req => req.status === 'pending').length;
    const approvedRequests = requestsToUse.filter(req => req.status === 'approved').length;

    setStats(prev => ({
      ...prev,
      totalRequests,
      pendingRequests,
      approvedRequests
    }));

    // Simulate loading
    setTimeout(() => setIsLoading(false), 1000);
  }, []);

  // Calculate end date automatically when start date or number of days changes
  useEffect(() => {
    if (startDate && numberOfDays > 0) {
      const start = new Date(startDate);
      const end = new Date(start);
      end.setDate(start.getDate() + numberOfDays - 1);

      // Format date to YYYY-MM-DD for the input
      const formattedEndDate = end.toISOString().split('T')[0];
      setEndDate(formattedEndDate);
    }
  }, [startDate, numberOfDays]);

  // Fetch available employees when modal opens
  const fetchAvailableEmployees = async () => {
    try {
      console.log('Buscando funcionários disponíveis...');
      const response = await employeeService.getEmployees({
        page: 1,
        page_size: 100
      });
      
      console.log('Funcionários recebidos:', response.results);
      console.log('Total de funcionários:', response.results.length);
      
      // Filter employees that are available for leave requests
      // All employees except cancelled and terminated can request leave
      const availableEmps = response.results.filter((emp: Employee) => 
        emp.status !== 'cancelled' && emp.status !== 'terminated'
      );
      
      console.log('Funcionários disponíveis após filtro:', availableEmps);
      console.log('Status dos funcionários:', response.results.map(emp => ({
        name: formatName(emp.user.first_name, emp.user.last_name),
        status: emp.status,
        id: emp.id
      })));
      
      setAvailableEmployees(availableEmps);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error(t('common.error'));
    }
  };

  const handleOpenRequestModal = () => {
    setIsRequestModalOpen(true);
    fetchAvailableEmployees();
  };

  const handleCloseRequestModal = () => {
    setIsRequestModalOpen(false);
    setSelectedEmployee('');
    setLeaveType('');
    setStartDate('');
    setEndDate('');
    setNumberOfDays(1);
    setReason('');
    setEmployeeSearch('');
  };

  const handleSubmitLeaveRequest = async () => {
    if (!selectedEmployee || !leaveType || !startDate) {
      toast.error(t('validation.required'));
      return;
    }

    if (numberOfDays <= 0) {
      toast.error(t('validation.required'));
      return;
    }

    // Validate date conflict
    const conflictMessage = validateLeaveConflict(selectedEmployee, startDate, endDate);
    if (conflictMessage) {
      toast.error(conflictMessage);
      return;
    }

    try {
      setIsSubmitting(true);

      // Find the selected employee
      const employee = availableEmployees.find(emp => emp.id.toString() === selectedEmployee);
      if (!employee) {
        toast.error(t('common.error'));
        return;
      }

      // Create new leave request
      const newLeaveRequest: LeaveRequest = {
        id: Date.now(), // Simple ID generation for demo
        employee: employee,
        leaveType: leaveType,
        startDate: startDate,
        endDate: endDate,
        numberOfDays: numberOfDays,
        reason: reason.trim() || '',
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      // Add to requests list
      const updatedRequests = [newLeaveRequest, ...leaveRequests];
      setLeaveRequests(updatedRequests);

      // Save to localStorage
      saveLeaveRequestsToStorage(updatedRequests);

      // Update stats
      setStats(prev => ({
        ...prev,
        totalRequests: prev.totalRequests + 1,
        pendingRequests: prev.pendingRequests + 1
      }));

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast.success(t('common.success'));
      handleCloseRequestModal();
    } catch (error) {
      console.error('Error submitting leave request:', error);
      toast.error(t('common.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter employees based on search
  const filteredEmployees = availableEmployees.filter(emp => {
    const fullName = formatName(emp.user.first_name, emp.user.last_name).toLowerCase();
    const email = emp.user.email.toLowerCase();
    const search = employeeSearch.toLowerCase();
    return fullName.includes(search) || email.includes(search) || emp.employee_id.toLowerCase().includes(search);
  });

  // Function to check if date ranges overlap
  const checkDateOverlap = (startDate1: string, endDate1: string, startDate2: string, endDate2: string): boolean => {
    const start1 = new Date(startDate1);
    const end1 = new Date(endDate1);
    const start2 = new Date(startDate2);
    const end2 = new Date(endDate2);

    // Check if ranges overlap: start1 <= end2 && start2 <= end1
    return start1 <= end2 && start2 <= end1;
  };

  // Function to validate if a new leave request conflicts with existing ones
  const validateLeaveConflict = (employeeId: string, newStartDate: string, newEndDate: string): string | null => {
    // Get all existing leaves for the same employee (approved and pending)
    const employeeLeaves = leaveRequests.filter(
      request =>
        request.employee.id.toString() === employeeId &&
        (request.status === 'approved' || request.status === 'pending')
    );

    for (const existingLeave of employeeLeaves) {
      if (checkDateOverlap(newStartDate, newEndDate, existingLeave.startDate, existingLeave.endDate)) {
        const conflictStart = new Date(existingLeave.startDate).toLocaleDateString('pt-BR');
        const conflictEnd = new Date(existingLeave.endDate).toLocaleDateString('pt-BR');
        const leaveTypeName = leaveTypeOptions.find(opt => opt.value === existingLeave.leaveType)?.label || existingLeave.leaveType;

        return `Conflito detectado! Já existe uma licença de "${leaveTypeName}" no período de ${conflictStart} a ${conflictEnd}. As licenças não podem ter datas sobrepostas.`;
      }
    }

    return null; // No conflict found
  };

  const handleApproveRequest = (requestId: number) => {
    const updatedRequests = leaveRequests.map(request =>
      request.id === requestId
        ? { ...request, status: 'approved' as const }
        : request
    );

    setLeaveRequests(updatedRequests);

    // Save to localStorage
    saveLeaveRequestsToStorage(updatedRequests);

    // Update stats
    setStats(prev => ({
      ...prev,
      pendingRequests: prev.pendingRequests - 1,
      approvedRequests: prev.approvedRequests + 1
    }));

    toast.success(t('leaves.approved'));
  };

  const handleRejectRequest = (requestId: number) => {
    const updatedRequests = leaveRequests.map(request =>
      request.id === requestId
        ? { ...request, status: 'rejected' as const }
        : request
    );

    setLeaveRequests(updatedRequests);

    // Save to localStorage
    saveLeaveRequestsToStorage(updatedRequests);

    // Update stats
    setStats(prev => ({
      ...prev,
      pendingRequests: prev.pendingRequests - 1
    }));

    toast.success(t('leaves.rejected'));
  };

  const leaveTypeOptions = [
    { value: 'vacation', label: t('leaves.annual') },
    { value: 'sick', label: t('leaves.sick') },
    { value: 'personal', label: t('leaves.personal') },
    { value: 'maternity', label: t('leaves.maternity') },
    { value: 'paternity', label: t('leaves.paternity') },
    { value: 'emergency', label: 'Licença Emergencial' },
    { value: 'study', label: 'Licença para Estudos' },
    { value: 'other', label: 'Outro' }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Section - Futuristic Design */}
      <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white rounded-2xl p-8 shadow-glow relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/3 -translate-x-1/4"></div>
        </div>
        
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between">
            <div className="mb-6 lg:mb-0">
              <h1 className="text-4xl font-bold mb-3 text-shadow-lg">
                {t('leaves.title')}
                <span className="ml-3 inline-block">📅</span>
              </h1>
              <p className="text-primary-100 text-lg font-medium mb-2">
                {t('leaves.manageDescription')}
              </p>
              <div className="flex items-center space-x-4 text-primary-200 text-sm">
                <span>Total: {stats.totalRequests} {t('leaves.totalRequestsCount')}</span>
                <span>•</span>
                <span>{t('leaves.pending')}: {stats.pendingRequests}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* View Mode Toggle */}
              <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-lg p-1">
                <button
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    viewMode === 'list'
                      ? 'bg-white text-primary-700'
                      : 'text-white/80 hover:text-white'
                  }`}
                  onClick={() => setViewMode('list')}
                >
                  <ListBulletIcon className="h-4 w-4 mr-2 inline" />
                  {t('leaves.listView')}
                </button>
                <button
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    viewMode === 'calendar'
                      ? 'bg-white text-primary-700'
                      : 'text-white/80 hover:text-white'
                  }`}
                  onClick={() => setViewMode('calendar')}
                >
                  <CalendarDaysIcon className="h-4 w-4 mr-2 inline" />
                  {t('leaves.calendarView')}
                </button>
              </div>
              
              {/* New Request Button */}
              <Button 
                variant="primary"
                icon={<PlusIcon />}
                onClick={handleOpenRequestModal}
              >
                {t('leaves.requestLeave')}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title={t('leaves.totalRequests')}
          value={stats.totalRequests}
          icon={<DocumentTextIcon className="h-full w-full" />}
          color="primary"
        />
        <StatCard
          title={t('leaves.pendingApproval')}
          value={stats.pendingRequests}
          icon={<ClockIcon className="h-full w-full" />}
          color="warning"
        />
        <StatCard
          title={t('leaves.approved')}
          value={stats.approvedRequests}
          icon={<CheckIcon className="h-full w-full" />}
          color="success"
        />
        <StatCard
          title={t('leaves.employeesOnLeave')}
          value={stats.employeesOnLeave}
          icon={<UserGroupIcon className="h-full w-full" />}
          color="info"
        />
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-2xl shadow-soft border border-neutral-200 overflow-hidden">
        {/* Header */}
        <div className="border-b border-neutral-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-neutral-900">{t('leaves.allLeaveRequests')}</h2>
        </div>

        {/* Content */}
        <div className="p-6">
          {viewMode === 'list' ? (
            leaveRequests.length === 0 ? (
              <div className="text-center py-12">
                <CalendarDaysIcon className="mx-auto h-12 w-12 text-neutral-400" />
                <h3 className="mt-2 text-sm font-medium text-neutral-900">Nenhuma solicitação encontrada</h3>
                <p className="mt-1 text-sm text-neutral-500">
                  Comece criando uma nova solicitação de licença
                </p>
                <div className="mt-6">
                  <Button
                    variant="primary"
                    icon={<PlusIcon />}
                    onClick={handleOpenRequestModal}
                  >
                    {t('leaves.requestLeave')}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {leaveRequests.map((request) => (
                  <div key={request.id} className="bg-white border border-neutral-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="h-10 w-10 rounded-full bg-primary-500 flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">
                              {request.employee.user.first_name.charAt(0)}{request.employee.user.last_name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-neutral-900">
                              {formatName(request.employee.user.first_name, request.employee.user.last_name)}
                            </h3>
                            <p className="text-sm text-neutral-500">
                              {request.employee.employee_id} • {request.employee.position}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                          <div>
                            <label className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
                              Tipo de Licença
                            </label>
                            <p className="text-sm font-medium text-neutral-900 mt-1">
                              {leaveTypeOptions.find(opt => opt.value === request.leaveType)?.label || request.leaveType}
                            </p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
                              Data de Início
                            </label>
                            <p className="text-sm font-medium text-neutral-900 mt-1">
                              {new Date(request.startDate).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
                              Data de Fim
                            </label>
                            <p className="text-sm font-medium text-neutral-900 mt-1">
                              {new Date(request.endDate).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
                              Duração
                            </label>
                            <p className="text-sm font-medium text-neutral-900 mt-1">
                              {request.numberOfDays} dia{request.numberOfDays > 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>

                        {request.reason && (
                          <div className="mt-4">
                            <label className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
                              Motivo
                            </label>
                            <p className="text-sm text-neutral-700 mt-1">
                              {request.reason}
                            </p>
                          </div>
                        )}

                        <div className="mt-4 text-xs text-neutral-500">
                          Criado em {new Date(request.createdAt).toLocaleDateString('pt-BR')} às {new Date(request.createdAt).toLocaleTimeString('pt-BR')}
                        </div>
                      </div>

                      <div className="flex flex-col items-end space-y-3">
                        {request.status === 'pending' ? (
                          <div className="flex flex-col items-end space-y-3">
                            <span className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                              <ClockIcon className="h-4 w-4 mr-1.5" />
                              {t('leaves.pending')}
                            </span>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleApproveRequest(request.id)}
                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200 shadow-sm"
                                title="Aprovar solicitação"
                              >
                                <CheckIcon className="h-4 w-4 mr-1" />
                                {t('leaves.approve')}
                              </button>
                              <button
                                onClick={() => handleRejectRequest(request.id)}
                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200 shadow-sm"
                                title="Reprovar solicitação"
                              >
                                <XMarkIcon className="h-4 w-4 mr-1" />
                                {t('leaves.reject')}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium border ${
                            request.status === 'approved'
                              ? 'bg-green-100 text-green-800 border-green-200'
                              : 'bg-red-100 text-red-800 border-red-200'
                          }`}>
                            {request.status === 'approved' ? (
                              <>
                                <CheckIcon className="h-4 w-4 mr-1.5" />
                                {t('leaves.approved')}
                              </>
                            ) : (
                              <>
                                <XMarkIcon className="h-4 w-4 mr-1.5" />
                                {t('leaves.rejected')}
                              </>
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            <div className="text-center py-12">
              <CalendarDaysIcon className="mx-auto h-12 w-12 text-neutral-400" />
              <h3 className="mt-2 text-sm font-medium text-neutral-900">Visualização em Calendário</h3>
              <p className="mt-1 text-sm text-neutral-500">
                Funcionalidade em desenvolvimento
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Leave Request Modal */}
      <Modal
        isOpen={isRequestModalOpen}
        onClose={handleCloseRequestModal}
        title={t('leaves.newLeaveRequest')}
        size="lg"
      >
        <div className="space-y-6">
          {/* Employee Selection */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              {t('leaves.employee')} *
            </label>
            <div className="space-y-3">
              <Input
                placeholder={t('leaves.searchEmployee')}
                icon={<MagnifyingGlassIcon />}
                value={employeeSearch}
                onChange={(e) => setEmployeeSearch(e.target.value)}
              />
              
              <div className="max-h-40 overflow-y-auto border border-neutral-200 rounded-lg">
                {filteredEmployees.length === 0 ? (
                  <div className="p-4 text-center text-neutral-500">
                    {employeeSearch ? t('leaves.noEmployeeFound') : t('leaves.loadingEmployees')}
                  </div>
                ) : (
                  filteredEmployees.map((employee) => (
                    <div
                      key={employee.id}
                      className={`p-3 cursor-pointer border-b border-neutral-100 hover:bg-neutral-50 ${
                        selectedEmployee === employee.id.toString() ? 'bg-primary-50 border-primary-200' : ''
                      }`}
                      onClick={() => setSelectedEmployee(employee.id.toString())}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-neutral-900">
                            {formatName(employee.user.first_name, employee.user.last_name)}
                          </div>
                          <div className="text-sm text-neutral-500">
                            {employee.user.email} • ID: {employee.employee_id}
                          </div>
                          <div className="text-xs text-neutral-400">
                            {employee.department} • {employee.position}
                          </div>
                        </div>
                        <div className="text-xs">
                          <span className={`px-2 py-1 rounded-full ${
                            employee.status === 'active' ? 'bg-success-100 text-success-800' :
                            employee.status === 'approved' ? 'bg-info-100 text-info-800' :
                            'bg-neutral-100 text-neutral-800'
                          }`}>
                            {employee.status === 'active' ? t('leaves.active') :
                             employee.status === 'approved' ? 'Aprovado' :
                             employee.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Leave Type */}
          <Select
            label={`${t('leaves.leaveType')} *`}
            value={leaveType}
            onChange={setLeaveType}
            options={[{ value: '', label: t('leaves.selectLeaveType') }, ...leaveTypeOptions]}
            required
          />

          {/* Start Date and Number of Days */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label={`${t('leaves.startDate')} *`}
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
            <Input
              label={`${t('leaves.numberOfDays')} *`}
              type="number"
              min="1"
              max="365"
              value={numberOfDays.toString()}
              onChange={(e) => setNumberOfDays(parseInt(e.target.value) || 1)}
              required
            />
          </div>

          {/* End Date - Calculated Automatically */}
          <div className="grid grid-cols-1">
            <Input
              label={t('leaves.endDateCalculated')}
              type="date"
              value={endDate}
              disabled={true}
              className="bg-neutral-100 cursor-not-allowed"
              helperText={endDate ? `${t('common.calculatedDate')}: ${new Date(endDate).toLocaleDateString()}` : t('leaves.fillStartDateAndDays')}
            />
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              {t('leaves.reasonOptional')}
            </label>
            <textarea
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
              rows={4}
              placeholder={t('leaves.describeReason')}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          {/* Summary */}
          {selectedEmployee && leaveType && startDate && endDate && (
            <div className="bg-neutral-50 rounded-lg p-4">
              <h4 className="font-medium text-neutral-900 mb-2">{t('leaves.requestSummary')}</h4>
              <div className="space-y-1 text-sm text-neutral-600">
                <div><strong>{t('leaves.employee')}:</strong> {formatName(
                  availableEmployees.find(e => e.id.toString() === selectedEmployee)?.user.first_name || '',
                  availableEmployees.find(e => e.id.toString() === selectedEmployee)?.user.last_name || ''
                )}</div>
                <div><strong>{t('leaves.type')}:</strong> {leaveTypeOptions.find(opt => opt.value === leaveType)?.label}</div>
                <div><strong>{t('leaves.startDate')}:</strong> {new Date(startDate).toLocaleDateString('pt-BR')}</div>
                <div><strong>{t('leaves.numberOfDays')}:</strong> {numberOfDays} {t('leaves.days')}</div>
                <div><strong>{t('leaves.endDate')}:</strong> {new Date(endDate).toLocaleDateString('pt-BR')} (calculada automaticamente)</div>
              </div>

              {/* Conflict Warning */}
              {(() => {
                const conflictMessage = validateLeaveConflict(selectedEmployee, startDate, endDate);
                if (conflictMessage) {
                  return (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                      <div className="flex items-start">
                        <XMarkIcon className="h-5 w-5 text-red-400 mt-0.5 mr-2 flex-shrink-0" />
                        <div>
                          <h5 className="text-sm font-medium text-red-800">{t('leaves.dateConflict')}</h5>
                          <p className="text-sm text-red-700 mt-1">{conflictMessage}</p>
                        </div>
                      </div>
                    </div>
                  );
                } else {
                  return (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
                      <div className="flex items-start">
                        <CheckIcon className="h-5 w-5 text-green-400 mt-0.5 mr-2 flex-shrink-0" />
                        <div>
                          <h5 className="text-sm font-medium text-green-800">{t('leaves.datesAvailable')}</h5>
                          <p className="text-sm text-green-700 mt-1">{t('leaves.noConflictsWithOtherLeaves')}</p>
                        </div>
                      </div>
                    </div>
                  );
                }
              })()}
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="flex justify-end space-x-3 mt-8">
          <Button
            variant="secondary"
            onClick={handleCloseRequestModal}
            disabled={isSubmitting}
          >
            {t('common.cancel')}
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmitLeaveRequest}
            isLoading={isSubmitting}
            disabled={
              isSubmitting ||
              !selectedEmployee ||
              !leaveType ||
              !startDate ||
              numberOfDays <= 0 ||
              Boolean(selectedEmployee && startDate && endDate &&
                validateLeaveConflict(selectedEmployee, startDate, endDate))
            }
          >
            {t('leaves.createRequest')}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default LeaveRequests;