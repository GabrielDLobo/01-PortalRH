import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  UsersIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  ClockIcon,
  CurrencyDollarIcon,
  AcademicCapIcon,
  TrophyIcon,
  ExclamationTriangleIcon,
  UserPlusIcon,
  UserMinusIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { employeeService } from '../services/employeeService';
import { terminationService } from '../services/terminationService';
import { LoadingSpinner, StatCard, ResponsiveGrid } from '../components';
import toast from 'react-hot-toast';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

interface DashboardStats {
  totalEmployees: number;
  newHires: number;
  totalTerminations: number;
  activeEmployees: number;
  satisfactionRate: number;
  employeesByDepartment: Record<string, number>;
  terminationsByMonth: Record<string, number>;
  recentActivity: any[];
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Get data from localStorage and APIs
        const [employeesData, terminationsData] = await Promise.all([
          getEmployeesData(),
          getTerminationsData()
        ]);

        // Calculate stats
        const totalEmployees = employeesData.length;
        const activeEmployees = employeesData.filter((emp: any) => emp.status !== 'cancelled').length;
        const newHires = employeesData.filter((emp: any) => {
          const hireDate = new Date(emp.hire_date || emp.created_at);
          const now = new Date();
          const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
          return hireDate >= monthAgo;
        }).length;

        // Calculate satisfaction rate based on active employees vs total
        const satisfactionRate = totalEmployees > 0
          ? Math.round((activeEmployees / totalEmployees) * 100)
          : 85; // Default satisfaction rate

        // Group employees by department
        const employeesByDepartment = employeesData.reduce((acc: Record<string, number>, emp: any) => {
          const dept = emp.department || emp.departamento || 'Outros';
          acc[dept] = (acc[dept] || 0) + 1;
          return acc;
        }, {});

        // Calculate terminations by month
        const terminationsByMonth = terminationsData.reduce((acc: Record<string, number>, term: any) => {
          const date = new Date(term.created_at);
          const monthKey = date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
          acc[monthKey] = (acc[monthKey] || 0) + 1;
          return acc;
        }, {});

        setStats({
          totalEmployees,
          newHires,
          totalTerminations: terminationsData.length,
          activeEmployees,
          satisfactionRate,
          employeesByDepartment,
          terminationsByMonth,
          recentActivity: [...employeesData.slice(0, 5), ...terminationsData.slice(0, 5)]
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error(t('common.error'));

        // Fallback to empty stats
        setStats({
          totalEmployees: 0,
          newHires: 0,
          totalTerminations: 0,
          activeEmployees: 0,
          satisfactionRate: 85,
          employeesByDepartment: {},
          terminationsByMonth: {},
          recentActivity: []
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Helper functions to get data
  const getEmployeesData = async () => {
    try {
      // Try API first
      const response = await employeeService.getEmployees();
      if (response.results && response.results.length > 0) {
        // Save to localStorage
        const employeesForStorage = response.results.map(emp => ({
          id: emp.id,
          first_name: emp.user?.first_name || 'N/A',
          last_name: emp.user?.last_name || 'N/A',
          email: emp.user?.email || '',
          department: emp.department || 'N/A',
          status: emp.status || 'active',
          hire_date: emp.hire_date,
          created_at: emp.created_at || new Date().toISOString()
        }));
        localStorage.setItem('portalrh-employees', JSON.stringify(employeesForStorage));
        return employeesForStorage;
      }
    } catch (error) {
      console.error('Error fetching employees from API:', error);
    }

    // Fallback to localStorage
    const saved = localStorage.getItem('portalrh-employees');
    return saved ? JSON.parse(saved) : [];
  };

  const getTerminationsData = async () => {
    try {
      // Try API first
      const response = await terminationService.getTerminationRequests();
      if (response.results && response.results.length > 0) {
        return response.results;
      }
    } catch (error) {
      console.error('Error fetching terminations from API:', error);
    }

    // Fallback to localStorage
    const saved = localStorage.getItem('terminationRequests');
    return saved ? JSON.parse(saved) : [];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{t('common.error')}</p>
      </div>
    );
  }

  // Chart data configurations
  const departmentChartData = {
    labels: Object.keys(stats.employeesByDepartment),
    datasets: [
      {
        label: t('dashboard.totalEmployees'),
        data: Object.values(stats.employeesByDepartment),
        backgroundColor: [
          '#3B82F6',
          '#22C55E',
          '#F59E0B',
          '#EF4444',
          '#8B5CF6',
          '#06B6D4',
          '#F97316',
          '#10B981',
        ],
        borderWidth: 0,
      },
    ],
  };

  const terminationChartData = {
    labels: Object.keys(stats.terminationsByMonth).slice(0, 6),
    datasets: [
      {
        label: t('dashboard.exits'),
        data: Object.values(stats.terminationsByMonth).slice(0, 6),
        backgroundColor: ['#F59E0B', '#22C55E', '#EF4444', '#8B5CF6', '#06B6D4', '#F97316'],
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Section - Futuristic Design */}
      <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white rounded-2xl p-8 shadow-glow relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/3 -translate-x-1/4"></div>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-3 text-shadow-lg">
                {t('dashboard.welcome')}, {user?.first_name || user?.email}!
                <span className="ml-3 inline-block animate-bounce-gentle">👋</span>
              </h1>
              <p className="text-primary-100 text-lg font-medium mb-2">
                {t('dashboard.overview')}
              </p>
              <div className="flex items-center space-x-4 text-primary-200 text-sm">
                <span>{t('dashboard.role')}: {user?.role_display}</span>
                <span>•</span>
                <span>{t('dashboard.today')}: {new Date().toLocaleDateString('pt-BR')}</span>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-soft">
                <ChartBarIcon className="w-10 h-10 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Stats Cards */}
      <ResponsiveGrid cols={{ sm: 1, md: 2, lg: 4 }}>
        <StatCard
          title={t('dashboard.totalEmployees')}
          value={stats.totalEmployees}
          icon={<UsersIcon className="h-full w-full" />}
          color="primary"
        />
        
        <StatCard
          title={t('dashboard.activeLeaves')}
          value={stats.activeEmployees}
          icon={<CalendarDaysIcon className="h-full w-full" />}
          color="success"
        />
        
        <StatCard
          title={t('dashboard.pendingEvaluations')}
          value={stats.totalTerminations}
          icon={<ChartBarIcon className="h-full w-full" />}
          color="warning"
        />
        
        <StatCard
          title={t('dashboard.recentActivity')}
          value={stats.recentActivity.length}
          icon={<ClockIcon className="h-full w-full" />}
          color="neutral"
        />
      </ResponsiveGrid>

      {/* Additional HR Metrics */}
      <ResponsiveGrid cols={{ sm: 1, md: 2, lg: 3 }}>
        <StatCard
          title={t('dashboard.newHires')}
          value={stats.newHires}
          icon={<UserPlusIcon className="h-full w-full" />}
          color="success"
        />
        
        <StatCard
          title={t('dashboard.turnover')}
          value={stats.totalTerminations}
          icon={<UserMinusIcon className="h-full w-full" />}
          color="danger"
        />
        
      </ResponsiveGrid>


      {/* Charts Section - Enhanced Design */}
      <ResponsiveGrid cols={{ sm: 1, lg: 2 }}>
        {/* Employees by Department */}
        <div className="bg-white rounded-2xl shadow-soft-lg p-6 border border-neutral-200 hover:shadow-glow transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-neutral-900">
              {t('dashboard.employeesByDepartment')}
            </h3>
            <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
              <UsersIcon className="w-5 h-5 text-primary-600" />
            </div>
          </div>
          <div style={{ height: '300px' }} className="rounded-lg overflow-hidden">
            <Bar data={departmentChartData} options={chartOptions} />
          </div>
        </div>

        {/* Leave Requests Status */}
        <div className="bg-white rounded-2xl shadow-soft-lg p-6 border border-neutral-200 hover:shadow-glow transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-neutral-900">
{t('dashboard.terminationsByMonth')}
            </h3>
            <div className="w-10 h-10 bg-success-100 rounded-xl flex items-center justify-center">
              <CalendarDaysIcon className="w-5 h-5 text-success-600" />
            </div>
          </div>
          <div style={{ height: '300px' }} className="rounded-lg overflow-hidden">
            <Doughnut data={terminationChartData} options={chartOptions} />
          </div>
        </div>
      </ResponsiveGrid>


      {/* Recent Activity - Modern Design */}
      <div className="bg-white rounded-2xl shadow-soft-lg p-6 border border-neutral-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-neutral-900">
            {t('dashboard.recentActivity')}
          </h3>
          <div className="w-10 h-10 bg-warning-100 rounded-xl flex items-center justify-center">
            <ClockIcon className="w-5 h-5 text-warning-600" />
          </div>
        </div>
        <div className="space-y-3">
          {[
            { type: 'user', message: t('dashboard.recentActivities.newEmployeeJoined', { name: 'John Doe', department: 'HR' }), time: t('dashboard.timeAgo.hoursAgo', { hours: 2 }), color: 'primary' },
            { type: 'leave', message: t('dashboard.recentActivities.leaveRequestApproved', { name: 'Maria Silva' }), time: t('dashboard.timeAgo.hoursAgo', { hours: 4 }), color: 'success' },
            { type: 'evaluation', message: t('dashboard.recentActivities.performanceEvaluationCompleted'), time: t('dashboard.timeAgo.hoursAgo', { hours: 6 }), color: 'warning' },
            { type: 'user', message: t('dashboard.recentActivities.employeeDataUpdated', { name: 'Pedro Santos' }), time: t('dashboard.timeAgo.dayAgo'), color: 'neutral' },
            { type: 'system', message: t('dashboard.recentActivities.weeklyReportGenerated'), time: t('dashboard.timeAgo.daysAgo', { days: 2 }), color: 'info' }
          ].map((activity, index) => (
            <div key={index} className="flex items-start p-4 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-colors duration-200">
              <div className={`w-3 h-3 rounded-full mr-4 mt-1 ${
                activity.color === 'primary' ? 'bg-primary-500' :
                activity.color === 'success' ? 'bg-success-500' :
                activity.color === 'warning' ? 'bg-warning-500' :
                activity.color === 'info' ? 'bg-accent-cyan' :
                'bg-neutral-400'
              }`}></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-neutral-900 mb-1">
                  {activity.message}
                </p>
                <p className="text-xs text-neutral-500">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;