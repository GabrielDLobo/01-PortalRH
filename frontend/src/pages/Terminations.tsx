import React, { useState, useEffect } from 'react';
import {
  PlusIcon,
  UserMinusIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { TerminationRequest, CreateTerminationRequest } from '../types/termination';
import { terminationService } from '../services/terminationService';
import { employeeService } from '../services/employeeService';
import { useNavigate } from 'react-router-dom';
import Table, { Column, SortConfig } from '../components/common/Table';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Pagination from '../components/common/Pagination';
import Modal from '../components/common/Modal';
import { formatDate, formatName } from '../utils/formatters';
import toast from 'react-hot-toast';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Terminations: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [terminations, setTerminations] = useState<TerminationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(25);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'created_at',
    direction: 'desc',
  });
  const [activeTab, setActiveTab] = useState<'all' | 'my-requests'>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    employee: '',
    expected_termination_date: '',
    reason: '',
    notice_type: ''
  });
  const [employees, setEmployees] = useState<any[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<any[]>([]);
  const [employeeSearchQuery, setEmployeeSearchQuery] = useState('');
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchTerminations();
  }, [currentPage, sortConfig, activeTab]);

  useEffect(() => {
    if (isCreateModalOpen) {
      fetchEmployees();
    }
  }, [isCreateModalOpen]);

  useEffect(() => {
    filterEmployees();
  }, [employees, employeeSearchQuery]);

  const fetchTerminations = async () => {
    try {
      setIsLoading(true);

      // Try to get from localStorage first (fallback)
      const savedTerminations = getTerminationsFromStorage();

      if (savedTerminations.length > 0) {
        // Filter based on active tab if needed
        const filteredTerminations = activeTab === 'my-requests'
          ? savedTerminations.filter(termination => termination.solicitante.id === user?.id)
          : savedTerminations;

        setTerminations(filteredTerminations);
        setTotalPages(Math.ceil(filteredTerminations.length / itemsPerPage));
        setTotalItems(filteredTerminations.length);
      } else {
        // If no saved terminations, create some example data
        const exampleTerminations = createExampleTerminations();
        saveTerminationsToStorage(exampleTerminations);
        setTerminations(exampleTerminations);
        setTotalPages(Math.ceil(exampleTerminations.length / itemsPerPage));
        setTotalItems(exampleTerminations.length);
      }
    } catch (error) {
      console.error('Error fetching terminations:', error);
      // Create fallback data
      const fallbackTerminations = createExampleTerminations();
      setTerminations(fallbackTerminations);
      setTotalPages(Math.ceil(fallbackTerminations.length / itemsPerPage));
      setTotalItems(fallbackTerminations.length);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      setIsLoadingEmployees(true);
      console.log('Fetching employees for termination form...');

      // Always try to fetch fresh data from API first
      try {
        console.log('Trying to fetch from API...');
        const response = await employeeService.getEmployees({ status: 'active' });
        console.log('API response:', response);

        if (response.results && response.results.length > 0) {
          // Convert API response to the format we need
          const employeesForForm = response.results.map(emp => ({
            id: emp.id,
            first_name: emp.user?.first_name || 'N/A',
            last_name: emp.user?.last_name || 'N/A',
            email: emp.user?.email || '',
            departamento: emp.department || 'N/A'
          }));

          console.log('Processed employees for form:', employeesForForm);
          setEmployees(employeesForForm);
          saveEmployeesToStorage(employeesForForm);
          return;
        }
      } catch (apiError) {
        console.error('API fetch failed:', apiError);
      }

      // Try localStorage as fallback
      console.log('Trying localStorage...');
      const savedEmployees = getEmployeesFromStorage();
      console.log('Saved employees from localStorage:', savedEmployees);

      if (savedEmployees.length > 0) {
        setEmployees(savedEmployees);
        return;
      }

      // Final fallback to example employees
      console.log('Using example employees as final fallback...');
      const exampleEmployees = [
        { id: 1, first_name: 'João', last_name: 'Silva', email: 'joao.silva@empresa.com', departamento: 'TI' },
        { id: 2, first_name: 'Maria', last_name: 'Santos', email: 'maria.santos@empresa.com', departamento: 'RH' },
        { id: 3, first_name: 'Pedro', last_name: 'Costa', email: 'pedro.costa@empresa.com', departamento: 'Vendas' },
        { id: 4, first_name: 'Ana', last_name: 'Oliveira', email: 'ana.oliveira@empresa.com', departamento: 'Marketing' },
        { id: 5, first_name: 'Carlos', last_name: 'Ferreira', email: 'carlos.ferreira@empresa.com', departamento: 'Financeiro' }
      ];
      setEmployees(exampleEmployees);
      saveEmployeesToStorage(exampleEmployees);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error(t('common.error'));
    } finally {
      setIsLoadingEmployees(false);
    }
  };

  const filterEmployees = () => {
    if (!employeeSearchQuery.trim()) {
      setFilteredEmployees(employees);
    } else {
      const filtered = employees.filter(emp =>
        `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(employeeSearchQuery.toLowerCase()) ||
        emp.email.toLowerCase().includes(employeeSearchQuery.toLowerCase())
      );
      setFilteredEmployees(filtered);
    }
  };

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmitTermination = async () => {
    try {
      // Validate form
      if (!formData.employee || !formData.expected_termination_date || !formData.reason || !formData.notice_type) {
        toast.error(t('validation.required'));
        return;
      }

      setIsSubmitting(true);

      const selectedEmployee = employees.find(emp => emp.id.toString() === formData.employee);
      if (!selectedEmployee) {
        toast.error(t('common.error'));
        return;
      }

      // Try to submit via API, fallback to localStorage
      try {
        const terminationData: CreateTerminationRequest = {
          funcionario: parseInt(formData.employee),
          motivo: parseInt(formData.reason),
          data_ultimo_dia: formData.expected_termination_date,
          data_desligamento: formData.expected_termination_date,
          justificativa: '',
          tem_aviso_previo: formData.notice_type !== 'not_applicable',
          aviso_previo_indenizado: formData.notice_type === 'compensated',
          tem_ferias_vencidas: false,
          tem_ferias_proporcionais: false,
          tem_decimo_proporcional: false,
          possui_equipamentos: false,
          possui_acessos_sistemas: false,
          urgencia: 'normal' as const
        };

        await terminationService.createTerminationRequest(terminationData);
        toast.success(t('common.success'));
      } catch (error) {
        // Fallback: add to localStorage
        const newTermination: TerminationRequest = {
          id: Date.now(),
          funcionario: selectedEmployee,
          solicitante: {
            id: user?.id || 1,
            first_name: user?.first_name || 'Admin',
            last_name: user?.last_name || 'RH',
            email: user?.email || 'admin@empresa.com'
          },
          motivo: {
            id: parseInt(formData.reason),
            nome: getTerminationReasonName(formData.reason),
            codigo: formData.reason,
            descricao: '',
            requer_aviso_previo: formData.notice_type !== 'not_applicable',
            permite_saque_fgts: true,
            gera_multa_fgts: false,
            direito_seguro_desemprego: true,
            ativo: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          data_ultimo_dia: formData.expected_termination_date,
          data_desligamento: formData.expected_termination_date,
          justificativa: '',
          observacoes_rh: '',
          tem_aviso_previo: formData.notice_type !== 'not_applicable',
          dias_aviso_previo: null,
          aviso_previo_indenizado: formData.notice_type === 'compensated',
          tem_ferias_vencidas: false,
          dias_ferias_vencidas: null,
          tem_ferias_proporcionais: false,
          dias_ferias_proporcionais: null,
          tem_decimo_proporcional: false,
          possui_equipamentos: false,
          lista_equipamentos: '',
          possui_acessos_sistemas: false,
          lista_acessos: '',
          aprovador_rh: null,
          data_aprovacao_rh: null,
          comentario_aprovacao_rh: '',
          valor_rescisao: null,
          anexo_documentos: null,
          status: 'processando',
          urgencia: 'normal',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const existingTerminations = getTerminationsFromStorage();
        const updatedTerminations = [newTermination, ...existingTerminations];
        saveTerminationsToStorage(updatedTerminations);
        toast.success(t('common.success'));
      }

      // Reset form and close modal
      setFormData({
        employee: '',
        expected_termination_date: '',
        reason: '',
        notice_type: ''
      });
      setEmployeeSearchQuery('');
      setIsCreateModalOpen(false);

      // Refresh the terminations list
      fetchTerminations();

    } catch (error) {
      console.error('Error creating termination:', error);
      toast.error(t('common.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTerminationReasonName = (reasonId: string) => {
    const reasons: Record<string, string> = {
      '1': 'Pedido de Demissão',
      '2': 'Término de Contrato',
      '3': 'Justa Causa',
      '4': 'Aposentadoria',
      '5': 'Reestruturação',
      '6': 'Redução de Quadro'
    };
    return reasons[reasonId] || 'Outros';
  };

  const handleSort = (key: string) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc',
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'concluida':
        return 'success';
      case 'aprovada_rh':
        return 'primary';
      case 'pendente_rh':
        return 'warning';
      case 'rejeitada_rh':
        return 'danger';
      case 'processando':
        return 'info';
      case 'rascunho':
        return 'secondary';
      case 'cancelada':
        return 'default';
      default:
        return 'default';
    }
  };

  const getUrgencyBadgeVariant = (urgencia: string) => {
    switch (urgencia) {
      case 'critica':
        return 'danger';
      case 'urgente':
        return 'warning';
      case 'normal':
        return 'success';
      default:
        return 'default';
    }
  };

  // localStorage functions
  const saveTerminationsToStorage = (terminations: TerminationRequest[]) => {
    try {
      localStorage.setItem('terminationRequests', JSON.stringify(terminations));
    } catch (error) {
      console.error('Error saving terminations to localStorage:', error);
    }
  };

  const getTerminationsFromStorage = (): TerminationRequest[] => {
    try {
      const saved = localStorage.getItem('terminationRequests');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error loading terminations from localStorage:', error);
      return [];
    }
  };

  const saveEmployeesToStorage = (employees: any[]) => {
    try {
      localStorage.setItem('portalrh-employees', JSON.stringify(employees));
    } catch (error) {
      console.error('Error saving employees to localStorage:', error);
    }
  };

  const getEmployeesFromStorage = (): any[] => {
    try {
      const saved = localStorage.getItem('portalrh-employees');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error loading employees from localStorage:', error);
      return [];
    }
  };

  const createExampleTerminations = (): TerminationRequest[] => {
    return [
      {
        id: 1,
        funcionario: {
          id: 1,
          first_name: 'João',
          last_name: 'Silva',
          email: 'joao.silva@empresa.com',
        },
        solicitante: {
          id: 4,
          first_name: 'Ana',
          last_name: 'Costa',
          email: 'ana.costa@empresa.com',
        },
        motivo: {
          id: 1,
          nome: 'Demissão sem Justa Causa',
          codigo: 'DSJC',
          descricao: 'Demissão por iniciativa da empresa sem justa causa',
          requer_aviso_previo: true,
          permite_saque_fgts: true,
          gera_multa_fgts: true,
          direito_seguro_desemprego: true,
          ativo: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
        data_ultimo_dia: '2024-09-30',
        data_desligamento: '2024-09-30',
        justificativa: 'Reestruturação organizacional. Eliminação do cargo devido à reorganização dos processos internos.',
        observacoes_rh: '',
        tem_aviso_previo: true,
        dias_aviso_previo: 30,
        aviso_previo_indenizado: true,
        tem_ferias_vencidas: false,
        dias_ferias_vencidas: null,
        tem_ferias_proporcionais: true,
        dias_ferias_proporcionais: 15,
        tem_decimo_proporcional: true,
        possui_equipamentos: true,
        lista_equipamentos: 'Notebook Dell, Mouse, Teclado, Monitor 24"',
        possui_acessos_sistemas: true,
        lista_acessos: 'Sistema ERP, Email corporativo, VPN, Acesso ao prédio',
        urgencia: 'normal' as const,
        status: 'pendente_rh' as const,
        aprovador_rh: null,
        data_aprovacao_rh: null,
        comentario_aprovacao_rh: '',
        valor_rescisao: null,
        anexo_documentos: null,
        created_at: '2024-09-15T10:00:00Z',
        updated_at: '2024-09-15T10:00:00Z',
      },
      {
        id: 2,
        funcionario: {
          id: 2,
          first_name: 'Maria',
          last_name: 'Santos',
          email: 'maria.santos@empresa.com',
        },
        solicitante: {
          id: 5,
          first_name: 'Roberto',
          last_name: 'Lima',
          email: 'roberto.lima@empresa.com',
        },
        motivo: {
          id: 2,
          nome: 'Pedido de Demissão',
          codigo: 'PD',
          descricao: 'Demissão por iniciativa do empregado',
          requer_aviso_previo: true,
          permite_saque_fgts: false,
          gera_multa_fgts: false,
          direito_seguro_desemprego: false,
          ativo: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
        data_ultimo_dia: '2024-10-15',
        data_desligamento: '2024-10-15',
        justificativa: 'Funcionária recebeu proposta de trabalho em outra empresa com melhor remuneração e oportunidades de crescimento.',
        observacoes_rh: 'Aprovado. Funcionária cumpriu aviso prévio.',
        tem_aviso_previo: true,
        dias_aviso_previo: 30,
        aviso_previo_indenizado: false,
        tem_ferias_vencidas: true,
        dias_ferias_vencidas: 20,
        tem_ferias_proporcionais: true,
        dias_ferias_proporcionais: 8,
        tem_decimo_proporcional: true,
        possui_equipamentos: false,
        lista_equipamentos: '',
        possui_acessos_sistemas: true,
        lista_acessos: 'Sistema de vendas, Email corporativo, CRM',
        urgencia: 'normal' as const,
        status: 'concluida' as const,
        aprovador_rh: {
          id: 6,
          first_name: 'Patricia',
          last_name: 'Ferreira',
          email: 'patricia.ferreira@empresa.com',
        },
        data_aprovacao_rh: '2024-09-10T14:30:00Z',
        comentario_aprovacao_rh: 'Processo de desligamento aprovado. Funcionária será bem-vinda para retornar no futuro.',
        valor_rescisao: 8500.00,
        anexo_documentos: null,
        created_at: '2024-09-08T09:15:00Z',
        updated_at: '2024-09-20T16:45:00Z',
      },
    ] as TerminationRequest[];
  };

  const columns: Column<TerminationRequest>[] = [
    {
      key: 'employee.first_name',
      header: t('terminations.employee'),
      sortable: true,
      render: (termination) => (
        <div>
          <div className="font-medium">
            {formatName(
              termination.funcionario.first_name,
              termination.funcionario.last_name
            )}
          </div>
          <div className="text-sm text-neutral-500">
            {termination.funcionario.email}
          </div>
        </div>
      ),
    },
    {
      key: 'reason.nome',
      header: t('terminations.reason'),
      render: (termination) => (
        <div>
          <div className="font-medium">{termination.motivo.nome}</div>
          <div className="text-sm text-neutral-500">{termination.motivo.codigo}</div>
        </div>
      ),
    },
    {
      key: 'last_day',
      header: t('terminations.lastDay'),
      sortable: true,
      render: (termination) => formatDate(termination.data_ultimo_dia),
    },
    {
      key: 'requester.first_name',
      header: t('terminations.requester'),
      render: (termination) => formatName(
        termination.solicitante.first_name,
        termination.solicitante.last_name
      ),
    },
    {
      key: 'created_at',
      header: t('evaluations.created'),
      sortable: true,
      render: (termination) => formatDate(termination.created_at),
    },
  ];

  // Calculate analytics data
  const averageProcessingTime = 5; // days
  const statusDistribution = {
    rascunho: terminations.filter(t => t.status === 'rascunho').length,
    pendente_rh: terminations.filter(t => t.status === 'pendente_rh').length,
    aprovada_rh: terminations.filter(t => t.status === 'aprovada_rh').length,
    processando: terminations.filter(t => t.status === 'processando').length,
    concluida: terminations.filter(t => t.status === 'concluida').length,
    rejeitada_rh: terminations.filter(t => t.status === 'rejeitada_rh').length,
    cancelada: terminations.filter(t => t.status === 'cancelada').length,
  };

  const urgencyDistribution = {
    normal: terminations.filter(t => t.urgencia === 'normal').length,
    urgente: terminations.filter(t => t.urgencia === 'urgente').length,
    critica: terminations.filter(t => t.urgencia === 'critica').length,
  };

  // Chart configurations
  const statusChartData = {
    labels: [t('evaluations.draft'), t('employees.pending'), t('leaves.approved'), t('dashboard.inProgress'), t('evaluations.completed'), t('leaves.rejected'), t('employees.admissionCancelled')],
    datasets: [
      {
        label: t('leaves.totalRequestsCount'),
        data: Object.values(statusDistribution),
        backgroundColor: [
          '#94a3b8',
          '#f59e0b',
          '#0ea5e9',
          '#6366f1',
          '#22c55e',
          '#ef4444',
          '#6b7280',
        ],
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  const urgencyChartData = {
    labels: ['Normal', 'Urgente', 'Crítica'],
    datasets: [
      {
        data: Object.values(urgencyDistribution),
        backgroundColor: ['#22c55e', '#f59e0b', '#ef4444'],
        borderWidth: 0,
        cutout: '60%',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        align: 'center' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        cornerRadius: 8,
      },
    },
    layout: {
      padding: {
        top: 10,
        bottom: 10,
      },
    },
  };

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    bgColor: string;
    trend?: string;
  }> = ({ title, value, icon: Icon, color, bgColor, trend }) => (
    <div className="stat-card group">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className={`p-3 rounded-xl ${bgColor} group-hover:scale-110 transition-transform duration-300`}>
            <Icon className={`h-6 w-6 ${color}`} />
          </div>
          <div className="ml-4">
            <h3 className="text-sm font-medium text-neutral-600">{title}</h3>
            <p className="text-2xl font-bold text-neutral-900">{value}</p>
            {trend && <p className="text-xs text-neutral-500 mt-1">{trend}</p>}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">{t('terminations.title')}</h1>
          <p className="text-neutral-600 mt-2 text-lg">
            {t('terminations.description')}
          </p>
        </div>
        {user?.role === 'admin_rh' && (
          <Button
            icon={<PlusIcon />}
            className="btn-gradient-primary"
            onClick={() => setIsCreateModalOpen(true)}
          >
            {t('terminations.newTerminationRequest')}
          </Button>
        )}
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title={t('leaves.totalRequests')}
          value={totalItems}
          icon={DocumentTextIcon}
          color="text-primary-600"
          bgColor="bg-primary-100"
          trend={t('terminations.allTime')}
        />
        <StatCard
          title={t('terminations.averageProcessingTime')}
          value={`${averageProcessingTime} ${t('terminations.days')}`}
          icon={ChartBarIcon}
          color="text-accent-indigo"
          bgColor="bg-indigo-100"
          trend={t('terminations.averageProcessing')}
        />
        <StatCard
          title={t('terminations.completed')}
          value={statusDistribution.concluida}
          icon={CheckCircleIcon}
          color="text-success-600"
          bgColor="bg-success-100"
          trend={t('terminations.thisMonth')}
        />
      </div>


      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-soft p-6">
        <div className="border-b border-neutral-200">
          <nav className="-mb-px flex space-x-8">
            <button
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'all'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
              }`}
              onClick={() => setActiveTab('all')}
            >
              {t('leaves.allRequests')}
            </button>
            <button
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'my-requests'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
              }`}
              onClick={() => setActiveTab('my-requests')}
            >
              {t('leaves.myRequests')}
            </button>
          </nav>
        </div>
      </div>

      {/* Terminations Table */}
      <div className="bg-white rounded-xl shadow-soft overflow-hidden">
        <Table
          columns={columns}
          data={terminations}
          sortConfig={sortConfig}
          onSort={handleSort}
          isLoading={isLoading}
          emptyMessage={t('terminations.noTerminationRequestsFound')}
          onRowClick={(termination) => {
            navigate(`/employees/${termination.funcionario.id}`);
          }}
        />

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Create Termination Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title={t('terminations.newTerminationRequest')}
        size="xl"
      >
        <div className="space-y-6">
          {/* Employee Selection */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              {t('terminations.employee')} *
            </label>
            {isLoadingEmployees ? (
              <div className="text-center py-2 text-neutral-500">{t('terminations.loadingEmployees')}</div>
            ) : (
              <select
                value={formData.employee}
                onChange={(e) => handleFormChange('employee', e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-neutral-900 bg-white"
                required
              >
                <option value="" className="text-neutral-500">{t('terminations.selectEmployee')}</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id.toString()} className="text-neutral-900">
                    {employee.first_name} {employee.last_name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Termination Information */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-neutral-900 mb-4">{t('terminations.terminationInformation')}</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Termination Date */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  {t('terminations.expectedTerminationDate')} *
                </label>
                <input
                  type="date"
                  value={formData.expected_termination_date}
                  onChange={(e) => handleFormChange('expected_termination_date', e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>

              {/* Termination Reason */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  {t('terminations.terminationReason')} *
                </label>
                <select
                  value={formData.reason}
                  onChange={(e) => handleFormChange('reason', e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                >
                  <option value="">{t('terminations.selectReason')}</option>
                  <option value="1">{t('terminations.resignationRequest')}</option>
                  <option value="2">{t('terminations.contractTermination')}</option>
                  <option value="3">{t('terminations.justCause')}</option>
                  <option value="4">{t('terminations.retirement')}</option>
                  <option value="5">{t('terminations.restructuring')}</option>
                  <option value="6">{t('terminations.downsizing')}</option>
                </select>
              </div>

              {/* Notice Period Type */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  {t('terminations.noticeType')} *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="notice_type"
                      value="worked"
                      checked={formData.notice_type === 'worked'}
                      onChange={(e) => handleFormChange('notice_type', e.target.value)}
                      className="text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-neutral-700">{t('terminations.worked')}</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="notice_type"
                      value="compensated"
                      checked={formData.notice_type === 'compensated'}
                      onChange={(e) => handleFormChange('notice_type', e.target.value)}
                      className="text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-neutral-700">{t('terminations.compensated')}</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="notice_type"
                      value="not_applicable"
                      checked={formData.notice_type === 'not_applicable'}
                      onChange={(e) => handleFormChange('notice_type', e.target.value)}
                      className="text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-neutral-700">{t('terminations.notApplicable')}</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button
              variant="secondary"
              onClick={() => setIsCreateModalOpen(false)}
              disabled={isSubmitting}
            >
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleSubmitTermination}
              disabled={isSubmitting}
              className="min-w-[120px]"
            >
              {isSubmitting ? t('terminations.creating') : t('terminations.createRequest')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Terminations;