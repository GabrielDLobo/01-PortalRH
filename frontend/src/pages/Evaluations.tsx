import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  StarIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
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
import { PerformanceEvaluation, CreateEvaluationRequest } from '../types/evaluation';
import { evaluationService } from '../services/evaluationService';
import { employeeService } from '../services/employeeService';
import { Employee } from '../types/employee';
import Table, { Column, SortConfig } from '../components/common/Table';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Pagination from '../components/common/Pagination';
import Modal from '../components/common/Modal';
import { formatDate, formatName } from '../utils/formatters';
import { EVALUATION_RATINGS } from '../utils/constants';
import toast from 'react-hot-toast';

// Helper functions for localStorage
const getEvaluationsFromStorage = (): PerformanceEvaluation[] => {
  try {
    const stored = localStorage.getItem('portalrh-evaluations');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveEvaluationsToStorage = (evaluations: PerformanceEvaluation[]) => {
  try {
    localStorage.setItem('portalrh-evaluations', JSON.stringify(evaluations));
  } catch (error) {
    console.error('Error saving evaluations to localStorage:', error);
  }
};

const createExampleEvaluations = (): PerformanceEvaluation[] => {
  return [
    {
      id: 1,
      employee: {
        id: 1,
        user: {
          first_name: 'João',
          last_name: 'Silva',
          email: 'joao.silva@example.com'
        },
        employee_id: 'EMP001',
        department: 'TI',
        position: 'Desenvolvedor Senior'
      },
      evaluator: {
        id: 2,
        first_name: 'Maria',
        last_name: 'Santos'
      },
      evaluation_period_start: '2024-01-01',
      evaluation_period_end: '2024-06-30',
      overall_rating: 4,
      goals: 'Melhorar habilidades de liderança e gestão de projetos',
      achievements: 'Completou certificação em gestão de projetos, liderou 3 projetos importantes',
      areas_for_improvement: 'Comunicação interpessoal, gestão de tempo',
      manager_comments: 'Excelente desempenho, demonstra grande potencial de crescimento',
      status: 'completed' as const,
      created_at: '2024-07-01T10:00:00Z',
      updated_at: '2024-07-01T10:00:00Z'
    },
    {
      id: 2,
      employee: {
        id: 3,
        user: {
          first_name: 'Ana',
          last_name: 'Costa',
          email: 'ana.costa@example.com'
        },
        employee_id: 'EMP002',
        department: 'TI',
        position: 'Analista de Sistemas'
      },
      evaluator: {
        id: 2,
        first_name: 'Maria',
        last_name: 'Santos'
      },
      evaluation_period_start: '2024-01-01',
      evaluation_period_end: '2024-06-30',
      overall_rating: 5,
      goals: 'Desenvolver conhecimentos técnicos avançados',
      achievements: 'Implementou novo sistema de automação, reduziu tempo de processo em 40%',
      areas_for_improvement: 'Participação em apresentações públicas',
      manager_comments: 'Performance excepcional, referência para a equipe',
      status: 'completed' as const,
      created_at: '2024-07-01T11:00:00Z',
      updated_at: '2024-07-01T11:00:00Z'
    }
  ];
};

const createExampleEmployees = (): Employee[] => {
  return [
    {
      id: 1,
      employee_id: 'EMP001',
      user: {
        id: 1,
        email: 'joao.silva@example.com',
        first_name: 'João',
        last_name: 'Silva',
        is_active: true
      },
      position: 'Desenvolvedor Senior',
      department: 'TI',
      hire_date: '2023-01-15',
      status: 'active',
      created_at: '2023-01-15T08:00:00Z',
      updated_at: '2023-01-15T08:00:00Z'
    },
    {
      id: 2,
      employee_id: 'EMP002',
      user: {
        id: 2,
        email: 'ana.costa@example.com',
        first_name: 'Ana',
        last_name: 'Costa',
        is_active: true
      },
      position: 'Analista de Sistemas',
      department: 'TI',
      hire_date: '2023-03-01',
      status: 'active',
      created_at: '2023-03-01T08:00:00Z',
      updated_at: '2023-03-01T08:00:00Z'
    }
  ];
};

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

const Evaluations: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [evaluations, setEvaluations] = useState<PerformanceEvaluation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(25);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'created_at',
    direction: 'desc',
  });
  const [activeTab, setActiveTab] = useState<'all' | 'my-evaluations'>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [createForm, setCreateForm] = useState<CreateEvaluationRequest>({
    employee_id: 0,
    evaluation_period_start: '',
    evaluation_period_end: '',
    overall_rating: 3,
    goals: '',
    achievements: '',
    areas_for_improvement: '',
    manager_comments: '',
  });

  useEffect(() => {
    fetchEvaluations();
  }, [currentPage, sortConfig, activeTab]);

  useEffect(() => {
    if (isCreateModalOpen) {
      fetchEmployees();
    }
  }, [isCreateModalOpen]);

  const fetchEvaluations = async () => {
    try {
      setIsLoading(true);

      // Try to get from localStorage first
      const savedEvaluations = getEvaluationsFromStorage();

      if (savedEvaluations.length > 0) {
        // Filter based on active tab if needed
        const filteredEvaluations = activeTab === 'my-evaluations'
          ? savedEvaluations.filter(evaluation => evaluation.evaluator.id === user?.id)
          : savedEvaluations;

        setEvaluations(filteredEvaluations);
        setTotalPages(Math.ceil(filteredEvaluations.length / itemsPerPage));
        setTotalItems(filteredEvaluations.length);
      } else {
        // If no saved evaluations, create some example data
        const exampleEvaluations = createExampleEvaluations();
        saveEvaluationsToStorage(exampleEvaluations);
        setEvaluations(exampleEvaluations);
        setTotalPages(Math.ceil(exampleEvaluations.length / itemsPerPage));
        setTotalItems(exampleEvaluations.length);
      }
    } catch (error) {
      console.error('Error fetching evaluations:', error);
      // Create fallback data
      const fallbackEvaluations = createExampleEvaluations();
      setEvaluations(fallbackEvaluations);
      setTotalPages(Math.ceil(fallbackEvaluations.length / itemsPerPage));
      setTotalItems(fallbackEvaluations.length);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await employeeService.getEmployees({ page_size: 1000 });
      setEmployees(response.results);
    } catch (error) {
      console.error('Error fetching employees:', error);
      // Create fallback employees data
      const fallbackEmployees = createExampleEmployees();
      setEmployees(fallbackEmployees);
    }
  };

  const handleCreateEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.employee_id || !createForm.evaluation_period_start || !createForm.evaluation_period_end) {
      toast.error(t('validation.required'));
      return;
    }

    setIsCreating(true);
    try {
      // Find the selected employee
      const selectedEmployee = employees.find(emp => emp.id === createForm.employee_id);
      if (!selectedEmployee) {
        toast.error(t('common.error'));
        return;
      }

      // Create new evaluation object
      const newEvaluation: PerformanceEvaluation = {
        id: Date.now(), // Simple ID generation
        employee: {
          id: selectedEmployee.id,
          user: selectedEmployee.user,
          employee_id: selectedEmployee.employee_id,
          department: selectedEmployee.department,
          position: selectedEmployee.position,
        },
        evaluator: {
          id: user?.id || 1,
          first_name: user?.first_name || 'Manager',
          last_name: user?.last_name || 'System',
        },
        evaluation_period_start: createForm.evaluation_period_start,
        evaluation_period_end: createForm.evaluation_period_end,
        overall_rating: createForm.overall_rating as 1 | 2 | 3 | 4 | 5,
        goals: createForm.goals,
        achievements: createForm.achievements,
        areas_for_improvement: createForm.areas_for_improvement,
        manager_comments: createForm.manager_comments,
        employee_comments: '',
        status: 'draft' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Save to localStorage
      const existingEvaluations = getEvaluationsFromStorage();
      const updatedEvaluations = [...existingEvaluations, newEvaluation];
      saveEvaluationsToStorage(updatedEvaluations);

      toast.success(t('common.success'));
      setIsCreateModalOpen(false);
      setCreateForm({
        employee_id: 0,
        evaluation_period_start: '',
        evaluation_period_end: '',
        overall_rating: 3,
        goals: '',
        achievements: '',
        areas_for_improvement: '',
        manager_comments: '',
      });
      fetchEvaluations();
    } catch (error) {
      toast.error(t('common.error'));
      console.error('Error creating evaluation:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleFormChange = (field: keyof CreateEvaluationRequest, value: string | number) => {
    setCreateForm(prev => ({ ...prev, [field]: value }));
  };



  const handleSort = (key: string) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc',
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'submitted':
        return 'primary';
      case 'draft':
        return 'warning';
      default:
        return 'default';
    }
  };

  const renderRating = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <div key={star}>
            {star <= rating ? (
              <StarIconSolid className="h-5 w-5 text-yellow-400" />
            ) : (
              <StarIcon className="h-5 w-5 text-neutral-300" />
            )}
          </div>
        ))}
        <span className="ml-2 text-sm text-neutral-600">
          {t(`evaluations.${EVALUATION_RATINGS[rating as keyof typeof EVALUATION_RATINGS]}`.toLowerCase())}
        </span>
      </div>
    );
  };

  const columns: Column<PerformanceEvaluation>[] = [
    {
      key: 'employee.user.first_name',
      header: t('evaluations.employee'),
      sortable: true,
      render: (evaluation) => (
        <div>
          <div className="font-medium">
            {formatName(
              evaluation.employee.user.first_name,
              evaluation.employee.user.last_name
            )}
          </div>
          <div className="text-sm text-neutral-500">
            {evaluation.employee.position} • {evaluation.employee.department}
          </div>
        </div>
      ),
    },
    {
      key: 'evaluator.first_name',
      header: t('evaluations.evaluator'),
      render: (evaluation) => formatName(
        evaluation.evaluator.first_name,
        evaluation.evaluator.last_name
      ),
    },
    {
      key: 'evaluation_period_start',
      header: t('evaluations.evaluationPeriod'),
      sortable: true,
      render: (evaluation) => (
        <div className="text-sm">
          <div>{formatDate(evaluation.evaluation_period_start)}</div>
          <div className="text-neutral-500">to {formatDate(evaluation.evaluation_period_end)}</div>
        </div>
      ),
    },
    {
      key: 'overall_rating',
      header: t('evaluations.overallRating'),
      sortable: true,
      render: (evaluation) => renderRating(evaluation.overall_rating),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (evaluation) => (
        <Badge variant={getStatusBadgeVariant(evaluation.status)}>
          {evaluation.status.charAt(0).toUpperCase() + evaluation.status.slice(1)}
        </Badge>
      ),
    },
    {
      key: 'created_at',
      header: t('evaluations.created'),
      sortable: true,
      render: (evaluation) => formatDate(evaluation.created_at),
    },
  ];

  // Calculate analytics data - with null checks
  const averageRating = evaluations && evaluations.length > 0 
    ? evaluations.reduce((sum, evaluation) => sum + evaluation.overall_rating, 0) / evaluations.length 
    : 0;
  const ratingDistribution = [1, 2, 3, 4, 5].map(rating => 
    evaluations ? evaluations.filter(evaluation => evaluation.overall_rating === rating).length : 0
  );
  const statusDistribution = {
    draft: evaluations ? evaluations.filter(e => e.status === 'draft').length : 0,
    submitted: evaluations ? evaluations.filter(e => e.status === 'submitted').length : 0,
    completed: evaluations ? evaluations.filter(e => e.status === 'completed').length : 0,
  };

  // Chart configurations
  const ratingChartData = {
    labels: ['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars'],
    datasets: [
      {
        label: t('evaluations.numberOfEvaluations'),
        data: ratingDistribution,
        backgroundColor: [
          '#ef4444',
          '#f97316',
          '#f59e0b',
          '#22c55e',
          '#0ea5e9',
        ],
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  const statusChartData = {
    labels: [t('evaluations.draft'), t('evaluations.submitted'), t('evaluations.completed')],
    datasets: [
      {
        data: Object.values(statusDistribution),
        backgroundColor: ['#f59e0b', '#0ea5e9', '#22c55e'],
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
          <h1 className="text-3xl font-bold text-neutral-900">{t('evaluations.title')}</h1>
          <p className="text-neutral-600 mt-2 text-lg">
            {t('evaluations.description')}
          </p>
        </div>
        {user?.role === 'admin_rh' && (
          <Button
            icon={<PlusIcon />}
            className="btn-gradient-primary"
            onClick={() => setIsCreateModalOpen(true)}
          >
            {t('evaluations.newEvaluation')}
          </Button>
        )}
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title={t('evaluations.totalEvaluations')}
          value={totalItems}
          icon={DocumentTextIcon}
          color="text-primary-600"
          bgColor="bg-primary-100"
          trend={t('evaluations.allTime')}
        />
        <StatCard
          title={t('evaluations.averageRating')}
          value={averageRating.toFixed(1)}
          icon={StarIcon}
          color="text-warning-600"
          bgColor="bg-warning-100"
          trend={t('evaluations.outOfFive')}
        />
        <StatCard
          title={t('evaluations.pendingReviews')}
          value={statusDistribution.draft + statusDistribution.submitted}
          icon={ClockIcon}
          color="text-accent-indigo"
          bgColor="bg-indigo-100"
          trend={t('evaluations.awaitingCompletion')}
        />
        <StatCard
          title={t('evaluations.completed')}
          value={statusDistribution.completed}
          icon={CheckCircleIcon}
          color="text-success-600"
          bgColor="bg-success-100"
          trend={t('evaluations.thisQuarter')}
        />
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Rating Distribution */}
        <div className="bg-white rounded-2xl shadow-soft-lg p-6 border border-neutral-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-neutral-900">{t('evaluations.ratingDistribution')}</h3>
            <div className="text-right">
              <div className="text-2xl font-bold text-warning-600">{averageRating.toFixed(1)}/5</div>
              <div className="text-xs text-neutral-500">{t('evaluations.averageRatingShort')}</div>
            </div>
          </div>
          <div className="flex justify-center">
            <div style={{ height: '240px', width: '100%' }}>
              <Bar data={ratingChartData} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-white rounded-2xl shadow-soft-lg p-6 border border-neutral-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-neutral-900">{t('evaluations.evaluationStatus')}</h3>
            <div className="text-right">
              <div className="text-lg font-semibold text-neutral-900">
                {evaluations ? evaluations.length : 0}
              </div>
              <div className="text-xs text-neutral-500">{t('evaluations.totalEvaluations')}</div>
            </div>
          </div>
          <div className="flex justify-center">
            <div style={{ height: '240px', width: '100%' }}>
              <Doughnut data={statusChartData} options={chartOptions} />
            </div>
          </div>
        </div>
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
              {t('evaluations.allEvaluations')}
            </button>
            <button
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'my-evaluations'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
              }`}
              onClick={() => setActiveTab('my-evaluations')}
            >
              {t('evaluations.myEvaluations')}
            </button>
          </nav>
        </div>
      </div>

      {/* Evaluations Table */}
      <div className="bg-white rounded-xl shadow-soft overflow-hidden">
        <Table
          columns={columns}
          data={evaluations}
          sortConfig={sortConfig}
          onSort={handleSort}
          isLoading={isLoading}
          emptyMessage={t('common.noData')}
          onRowClick={(evaluation) => {
            console.log('Navigate to evaluation:', evaluation.id);
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

      {/* Create Evaluation Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title={t('evaluations.newEvaluation')}
        size="lg"
      >
        <form onSubmit={handleCreateEvaluation} className="space-y-6">
          {/* Employee Selection */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              {t('evaluations.employee')} *
            </label>
            <select
              value={createForm.employee_id}
              onChange={(e) => handleFormChange('employee_id', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              required
            >
              <option value={0}>{t('evaluations.selectEmployee')}</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {formatName(employee.user.first_name, employee.user.last_name)} - {employee.position}
                </option>
              ))}
            </select>
          </div>

          {/* Evaluation Period */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                {t('evaluations.periodStartDate')} *
              </label>
              <input
                type="date"
                value={createForm.evaluation_period_start}
                onChange={(e) => handleFormChange('evaluation_period_start', e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                {t('evaluations.periodEndDate')} *
              </label>
              <input
                type="date"
                value={createForm.evaluation_period_end}
                onChange={(e) => handleFormChange('evaluation_period_end', e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>
          </div>

          {/* Overall Rating */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              {t('evaluations.overallRating')} *
            </label>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => handleFormChange('overall_rating', rating)}
                  className="focus:outline-none"
                >
                  {rating <= createForm.overall_rating ? (
                    <StarIconSolid className="h-8 w-8 text-yellow-400 hover:text-yellow-500" />
                  ) : (
                    <StarIcon className="h-8 w-8 text-neutral-300 hover:text-yellow-400" />
                  )}
                </button>
              ))}
              <span className="ml-2 text-sm text-neutral-600">
                {t(`evaluations.${EVALUATION_RATINGS[createForm.overall_rating as keyof typeof EVALUATION_RATINGS]}`.toLowerCase())}
              </span>
            </div>
          </div>

          {/* Goals */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              {t('evaluations.form.goalsObjectives')} *
            </label>
            <textarea
              value={createForm.goals}
              onChange={(e) => handleFormChange('goals', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder={t('evaluations.form.goalsPlaceholder')}
              required
            />
          </div>

          {/* Achievements */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              {t('evaluations.form.achievementsResults')} *
            </label>
            <textarea
              value={createForm.achievements}
              onChange={(e) => handleFormChange('achievements', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder={t('evaluations.form.achievementsPlaceholder')}
              required
            />
          </div>

          {/* Areas for Improvement */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              {t('evaluations.form.developmentAreas')} *
            </label>
            <textarea
              value={createForm.areas_for_improvement}
              onChange={(e) => handleFormChange('areas_for_improvement', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder={t('evaluations.form.developmentPlaceholder')}
              required
            />
          </div>

          {/* Manager Comments */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              {t('evaluations.form.managerComments')} *
            </label>
            <textarea
              value={createForm.manager_comments}
              onChange={(e) => handleFormChange('manager_comments', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder={t('evaluations.form.managerPlaceholder')}
              required
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-neutral-200">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsCreateModalOpen(false)}
              disabled={isCreating}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              className="btn-gradient-primary"
              disabled={isCreating}
            >
              {isCreating ? t('evaluations.creating') : t('evaluations.createEvaluation')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Evaluations;