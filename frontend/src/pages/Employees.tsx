import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusIcon, MagnifyingGlassIcon, FunnelIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Employee } from '../types/employee';
import { employeeService } from '../services/employeeService';
import Table, { Column, SortConfig } from '../components/common/Table';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Pagination from '../components/common/Pagination';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import { formatDate, formatName } from '../utils/formatters';
import toast from 'react-hot-toast';

interface EmployeeFilters {
  search: string;
  department: string;
  position: string;
  status: string;
}



const Employees: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(25);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'user.last_name',
    direction: 'asc',
  });
  const [filters, setFilters] = useState<EmployeeFilters>({
    search: '',
    department: '',
    position: '',
    status: '',
  });
  const [departments, setDepartments] = useState<string[]>([]);
  const [positions, setPositions] = useState<string[]>([]);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [cancellingAdmissionId, setCancellingAdmissionId] = useState<number | null>(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [employeeToCancel, setEmployeeToCancel] = useState<Employee | null>(null);

  // Check permissions
  const canCancelAdmission = user?.role === 'admin_rh';
  const canAddEmployee = user?.role === 'admin_rh';

  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
    fetchPositions();
  }, [currentPage, sortConfig]);

  useEffect(() => {
    applyFilters();
  }, [employees, filters]);

  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      const response = await employeeService.getEmployees({
        page: currentPage,
        page_size: itemsPerPage,
        ordering: sortConfig.direction === 'asc' ? sortConfig.key : `-${sortConfig.key}`,
      });

      setEmployees(response.results);
      setTotalPages(Math.ceil(response.count / itemsPerPage));
      setTotalItems(response.count);

      // Save employees to localStorage for use in other pages (like Terminations)
      if (response.results && response.results.length > 0) {
        const employeesForStorage = response.results.map(emp => ({
          id: emp.id,
          first_name: emp.user.first_name,
          last_name: emp.user.last_name,
          email: emp.user.email,
          departamento: emp.department || 'N/A'
        }));
        saveEmployeesToStorage(employeesForStorage);
      }
    } catch (error) {
      toast.error(t('common.error'));
      console.error('Error fetching employees:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const deps = await employeeService.getDepartments();
      setDepartments(deps);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchPositions = async () => {
    try {
      const pos = await employeeService.getPositions();
      setPositions(pos);
    } catch (error) {
      console.error('Error fetching positions:', error);
    }
  };

  const applyFilters = () => {
    let filtered = employees;

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (emp) =>
          emp.user.first_name.toLowerCase().includes(searchLower) ||
          emp.user.last_name.toLowerCase().includes(searchLower) ||
          emp.user.email.toLowerCase().includes(searchLower) ||
          emp.employee_id.toLowerCase().includes(searchLower)
      );
    }

    if (filters.department) {
      filtered = filtered.filter((emp) => emp.department === filters.department);
    }

    if (filters.position) {
      filtered = filtered.filter((emp) => emp.position === filters.position);
    }

    if (filters.status) {
      filtered = filtered.filter((emp) => emp.status === filters.status);
    }

    setFilteredEmployees(filtered);
  };

  const handleSort = (key: string) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc',
    });
  };

  const handleFilterChange = (key: keyof EmployeeFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      department: '',
      position: '',
      status: '',
    });
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
        return 'warning';
      case 'terminated':
        return 'danger';
      case 'cancelled':
        return 'danger';
      default:
        return 'default';
    }
  };

  const handleCancelAdmission = async (employee: Employee) => {
    setEmployeeToCancel(employee);
    setIsCancelModalOpen(true);
  };

  const confirmCancelAdmission = async () => {
    if (!employeeToCancel || !canCancelAdmission) return;

    try {
      setCancellingAdmissionId(employeeToCancel.id);
      await employeeService.updateEmployee({
        id: employeeToCancel.id,
        status: 'cancelled'
      } as any);
      
      // Update the employee in the local state
      setEmployees(prev => 
        prev.map(emp => 
          emp.id === employeeToCancel.id 
            ? { ...emp, status: 'cancelled' as any }
            : emp
        )
      );
      
      toast.success(t('employees.admissionCancelled'));
      setIsCancelModalOpen(false);
      setEmployeeToCancel(null);
    } catch (error: any) {
      console.error('Error cancelling admission:', error);
      toast.error(t('common.error'));
    } finally {
      setCancellingAdmissionId(null);
    }
  };

  const handleAddEmployee = () => {
    if (!canAddEmployee) {
      toast.error(t('employees.noPermissionToAdd'));
      return;
    }
    navigate('/admission');
  };

  const columns: Column<Employee>[] = [
    {
      key: 'employee_id',
      header: 'ID',
      width: '100px',
      sortable: true,
    },
    {
      key: 'user.first_name',
      header: t('employees.firstName'),
      sortable: true,
      render: (employee) => formatName(employee.user.first_name, employee.user.last_name),
    },
    {
      key: 'user.email',
      header: t('employees.email'),
      sortable: true,
      render: (employee) => employee.user.email,
    },
    {
      key: 'department',
      header: t('employees.department'),
      sortable: true,
    },
    {
      key: 'position',
      header: t('employees.position'),
      sortable: true,
    },
    {
      key: 'hire_date',
      header: t('employees.hireDate'),
      sortable: true,
      render: (employee) => formatDate(employee.hire_date),
    },
    {
      key: 'status',
      header: t('employees.status'),
      sortable: true,
      render: (employee) => (
        <div className="flex items-center space-x-2">
          <Badge variant={getStatusBadgeVariant(employee.status)}>
            {employee.status === 'pending' ? t('employees.pending') :
             employee.status === 'under_review' ? t('employees.underReview') :
             employee.status === 'approved' ? t('leaves.approved') :
             employee.status === 'cancelled' ? t('employees.admissionCancelled') :
             employee.status === 'active' ? t('employees.active') :
             employee.status === 'inactive' ? t('employees.inactive') :
             employee.status === 'terminated' ? t('employees.terminated') :
             employee.status}
          </Badge>
          {canCancelAdmission && 
           (employee.status === 'pending' || employee.status === 'under_review') && (
            <Button
              size="sm"
              variant="primary"
              icon={<XCircleIcon className="w-4 h-4" />}
              onClick={(e) => {
                e.stopPropagation(); // Prevent row click
                handleCancelAdmission(employee);
              }}
              isLoading={cancellingAdmissionId === employee.id}
              disabled={cancellingAdmissionId === employee.id}
              className="ml-2"
            >
              {t('employees.cancelAdmission')}
            </Button>
          )}
        </div>
      ),
    },
  ];

  const departmentOptions = departments.map((dep) => ({ value: dep, label: dep }));
  const positionOptions = positions.map((pos) => ({ value: pos, label: pos }));
  const statusOptions = [
    { value: 'pending', label: t('employees.pending') },
    { value: 'under_review', label: t('employees.underReview') },
    { value: 'approved', label: t('leaves.approved') },
    { value: 'active', label: t('employees.active') },
    { value: 'inactive', label: t('employees.inactive') },
    { value: 'terminated', label: t('employees.terminated') },
    { value: 'cancelled', label: t('employees.admissionCancelled') },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">{t('employees.title')}</h1>
          <p className="text-neutral-600 mt-1">
            {t('employees.title')}
          </p>
        </div>
        {canAddEmployee && (
          <Button icon={<PlusIcon />} onClick={handleAddEmployee}>
            {t('employees.addEmployee')}
          </Button>
        )}
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-xl shadow-soft p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder={`${t('common.search')} employees...`}
              icon={<MagnifyingGlassIcon />}
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>
          <Button
            variant="secondary"
            icon={<FunnelIcon />}
            onClick={() => setIsFilterModalOpen(true)}
          >
            {t('common.filter')}
          </Button>
        </div>

        {/* Active Filters */}
        {(filters.department || filters.position || filters.status) && (
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-sm text-neutral-600">{t('common.filter')}:</span>
            {filters.department && (
              <Badge variant="primary">{t('employees.department')}: {filters.department}</Badge>
            )}
            {filters.position && (
              <Badge variant="primary">{t('employees.position')}: {filters.position}</Badge>
            )}
            {filters.status && (
              <Badge variant="primary">{t('employees.status')}: {filters.status}</Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-xs"
            >
              {t('common.cancel')}
            </Button>
          </div>
        )}
      </div>

      {/* Employees Table */}
      <div className="bg-white rounded-xl shadow-soft overflow-hidden">
        <Table
          columns={columns}
          data={filteredEmployees}
          sortConfig={sortConfig}
          onSort={handleSort}
          isLoading={isLoading}
          emptyMessage={t('common.noData')}
          onRowClick={(employee) => {
            navigate(`/employees/${employee.id}`);
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

      {/* Filter Modal */}
      <Modal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        title={t('common.filter')}
        size="md"
      >
        <div className="space-y-4">
          <Select
            label={t('employees.department')}
            value={filters.department}
            onChange={(value) => handleFilterChange('department', value)}
            options={[{ value: '', label: t('employees.allDepartments') }, ...departmentOptions]}
          />

          <Select
            label={t('employees.position')}
            value={filters.position}
            onChange={(value) => handleFilterChange('position', value)}
            options={[{ value: '', label: t('employees.allPositions') }, ...positionOptions]}
          />

          <Select
            label={t('employees.status')}
            value={filters.status}
            onChange={(value) => handleFilterChange('status', value)}
            options={[{ value: '', label: t('employees.allStatuses') }, ...statusOptions]}
          />
        </div>

        <div className="flex justify-end space-x-2 mt-6">
          <Button
            variant="secondary"
            onClick={() => setIsFilterModalOpen(false)}
          >
            {t('common.cancel')}
          </Button>
          <Button onClick={() => setIsFilterModalOpen(false)}>
            {t('common.submit')}
          </Button>
        </div>
      </Modal>

      {/* Cancel Admission Confirmation Modal */}
      <Modal
        isOpen={isCancelModalOpen}
        onClose={() => {
          setIsCancelModalOpen(false);
          setEmployeeToCancel(null);
        }}
        title={t('employees.cancelAdmission')}
        size="md"
      >
        {employeeToCancel && (
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <XCircleIcon className="h-10 w-10 text-warning-500" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-neutral-900">
                  {t('employees.confirmCancellation')}
                </h3>
                <p className="text-sm text-neutral-600">
                  {t('employees.cancelAdmissionWarning')}
                </p>
              </div>
            </div>
            
            <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
              <p className="text-sm text-warning-800">
                <strong>{t('employees.employee')}:</strong> {formatName(employeeToCancel.user.first_name, employeeToCancel.user.last_name)}<br />
                <strong>ID:</strong> {employeeToCancel.employee_id}<br />
                <strong>E-mail:</strong> {employeeToCancel.user.email}<br />
                <strong>{t('employees.status')}:</strong> {employeeToCancel.status === 'pending' ? t('employees.pending') : employeeToCancel.status}
              </p>
            </div>

            <div className="bg-info-50 border border-info-200 rounded-lg p-4">
              <p className="text-sm text-info-800">
                <strong>{t('common.info')}:</strong> {t('employees.cancelAdmissionInfo')}
              </p>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <Button
                variant="secondary"
                onClick={() => {
                  setIsCancelModalOpen(false);
                  setEmployeeToCancel(null);
                }}
              >
                {t('common.back')}
              </Button>
              <Button
                variant="error"
                onClick={confirmCancelAdmission}
                icon={<XCircleIcon />}
                isLoading={cancellingAdmissionId === employeeToCancel.id}
                disabled={cancellingAdmissionId === employeeToCancel.id}
              >
                {t('employees.confirmCancellation')}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

// localStorage helper functions for employees
const saveEmployeesToStorage = (employees: any[]) => {
  try {
    localStorage.setItem('portalrh-employees', JSON.stringify(employees));
  } catch (error) {
    console.error('Error saving employees to localStorage:', error);
  }
};

export default Employees;