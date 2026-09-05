import React, { useState } from 'react';
import {
  DocumentChartBarIcon,
  ArrowDownTrayIcon,
  CalendarIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  DocumentTextIcon,
  HomeIcon
} from '@heroicons/react/24/outline';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Employee } from '../types/employee';
import { TerminationRequest } from '../types/termination';
import { PerformanceEvaluation } from '../types/evaluation';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface ReportData {
  employees?: Employee[];
  terminations?: TerminationRequest[];
  evaluations?: PerformanceEvaluation[];
  leaves?: any[];
  admissions?: any[];
}

interface DateRange {
  from: string;
  to: string;
}

const Reports: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [selectedReportType, setSelectedReportType] = useState('');
  const [dateRange, setDateRange] = useState<DateRange>({ from: '', to: '' });
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportData, setReportData] = useState<ReportData>({});
  const [useAllData, setUseAllData] = useState(true);

  // Check permissions
  const canAccessReports = user?.role === 'admin_rh';

  if (!canAccessReports) {
    return (
      <div className="text-center py-12">
        <DocumentChartBarIcon className="mx-auto h-12 w-12 text-neutral-400" />
        <h3 className="mt-2 text-sm font-medium text-neutral-900">{t('common.accessDenied')}</h3>
        <p className="mt-1 text-sm text-neutral-500">{t('common.insufficientPermissions')}</p>
      </div>
    );
  }

  const reportTypes = [
    {
      value: 'employees',
      label: t('reports.reportTypes.employees'),
      icon: UsersIcon,
      description: t('reports.employeeReportDesc')
    },
    {
      value: 'terminations',
      label: t('reports.reportTypes.terminations'),
      icon: ClipboardDocumentListIcon,
      description: t('reports.terminationReportDesc')
    },
    {
      value: 'evaluations',
      label: t('reports.reportTypes.evaluations'),
      icon: ChartBarIcon,
      description: t('reports.evaluationReportDesc')
    },
    {
      value: 'leaves',
      label: t('reports.reportTypes.leaves'),
      icon: CalendarIcon,
      description: t('reports.leaveReportDesc')
    },
    {
      value: 'admissions',
      label: t('reports.reportTypes.admissions'),
      icon: DocumentTextIcon,
      description: t('reports.admissionReportDesc')
    }
  ];

  const getEmployeesData = (): Employee[] => {
    try {
      const saved = localStorage.getItem('portalrh-employees');
      if (saved) {
        const employees = JSON.parse(saved);
        return employees.map((emp: any) => ({
          id: emp.id,
          employee_id: emp.id?.toString() || `EMP${emp.id || Math.random().toString().slice(2, 7)}`,
          user: {
            id: emp.id,
            first_name: emp.first_name || 'N/A',
            last_name: emp.last_name || 'N/A',
            email: emp.email || 'N/A',
            is_active: true
          },
          department: emp.departamento || emp.department || 'N/A',
          position: emp.position || emp.cargo || 'N/A',
          hire_date: emp.hire_date || new Date().toISOString().split('T')[0],
          status: emp.status || 'active',
          phone: emp.phone || 'N/A',
          cpf: emp.cpf || 'N/A',
          rg: emp.rg || 'N/A',
          address: emp.address || 'N/A',
          salary: emp.salary || 'N/A',
          created_at: emp.created_at || new Date().toISOString(),
          updated_at: emp.updated_at || new Date().toISOString()
        } as Employee));
      }
    } catch (error) {
      console.error('Error loading employees data:', error);
    }
    return [];
  };

  const getTerminationsData = (): TerminationRequest[] => {
    try {
      const saved = localStorage.getItem('portalrh-terminations');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error loading terminations data:', error);
      return [];
    }
  };

  const getEvaluationsData = (): PerformanceEvaluation[] => {
    try {
      const saved = localStorage.getItem('portalrh-evaluations');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error loading evaluations data:', error);
      return [];
    }
  };

  const getLeavesData = (): any[] => {
    try {
      const saved = localStorage.getItem('portalrh-leave-requests');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error loading leaves data:', error);
      return [];
    }
  };

  const getAdmissionsData = (): any[] => {
    try {
      const saved = localStorage.getItem('portalrh-admissions');
      if (saved) {
        return JSON.parse(saved);
      }
      // Create sample admission data from employees
      const employees = getEmployeesData();
      return employees.slice(0, 5).map((emp, index) => ({
        id: index + 1,
        employee: emp,
        status: ['pending', 'under_review', 'approved', 'completed'][index % 4],
        documents_status: 'pending',
        created_at: new Date(Date.now() - index * 86400000).toISOString(),
        updated_at: new Date().toISOString(),
        process_step: ['document_collection', 'review', 'approval', 'finalization'][index % 4],
        completion_percentage: [25, 50, 75, 100][index % 4]
      }));
    } catch (error) {
      console.error('Error loading admissions data:', error);
      return [];
    }
  };

  const generateReport = async () => {
    if (!selectedReportType) {
      toast.error(t('reports.selectReport'));
      return;
    }

    setIsGenerating(true);
    try {
      const data: any = {};

      switch (selectedReportType) {
        case 'employees':
          data.employees = getEmployeesData();
          break;
        case 'terminations':
          data.terminations = getTerminationsData();
          break;
        case 'evaluations':
          data.evaluations = getEvaluationsData();
          break;
        case 'leaves':
          data.leaves = getLeavesData();
          break;
        case 'admissions':
          data.admissions = getAdmissionsData();
          break;
      }

      // Apply date filtering if specified
      if (!useAllData && dateRange.from && dateRange.to) {
        const fromDate = new Date(dateRange.from);
        const toDate = new Date(dateRange.to);

        if (data.employees) {
          data.employees = data.employees.filter((emp: Employee) => {
            const hireDate = new Date(emp.hire_date);
            return hireDate >= fromDate && hireDate <= toDate;
          });
        }

        if (data.terminations) {
          data.terminations = data.terminations.filter((term: TerminationRequest) => {
            const createdDate = new Date(term.created_at);
            return createdDate >= fromDate && createdDate <= toDate;
          });
        }

        if (data.evaluations) {
          data.evaluations = data.evaluations.filter((evaluation: PerformanceEvaluation) => {
            const createdDate = new Date(evaluation.created_at);
            return createdDate >= fromDate && createdDate <= toDate;
          });
        }

        if (data.leaves) {
          data.leaves = data.leaves.filter((leave: any) => {
            const createdDate = new Date(leave.createdAt || leave.created_at);
            return createdDate >= fromDate && createdDate <= toDate;
          });
        }

        if (data.admissions) {
          data.admissions = data.admissions.filter((admission: any) => {
            const createdDate = new Date(admission.created_at);
            return createdDate >= fromDate && createdDate <= toDate;
          });
        }
      }

      setReportData(data);
      toast.success(t('reports.success'));
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error(t('reports.error'));
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadPDF = () => {
    if (!selectedReportType || !reportData) {
      toast.error(t('reports.noData'));
      return;
    }

    console.log('Starting PDF generation...');
    console.log('Selected report type:', selectedReportType);
    console.log('Report data:', reportData);

    try {
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

      console.log('PDF instance created:', pdf);
      console.log('autoTable function:', autoTable);
      console.log('autoTable type:', typeof autoTable);

      const reportTitle = reportTypes.find(type => type.value === selectedReportType)?.label || 'Report';
      console.log('Report title:', reportTitle);

      // Add header
      pdf.setFontSize(18);
      pdf.text(reportTitle, 20, 20);

      pdf.setFontSize(12);
      pdf.text(`${t('common.generatedOn')}: ${new Date().toLocaleDateString()}`, 20, 30);
      pdf.text(`${t('common.totalRecords')}: ${getDataCount()}`, 20, 40);

      console.log('Header added successfully');
      console.log('Generating data table PDF...');
        // Data tables for other report types
        const dataKey = Object.keys(reportData)[0];
        const data = reportData[dataKey as keyof ReportData];

        if (Array.isArray(data) && data.length > 0) {
          console.log('Data is array with length:', data.length);
          let tableData: any[] = [];
          let headers: string[] = [];

          console.log('Processing report type:', selectedReportType);

          switch (selectedReportType) {
            case 'employees':
              console.log('Processing employees data...');
              headers = [
                t('reports.columns.id'),
                t('reports.columns.name'),
                t('reports.columns.email'),
                t('reports.columns.department'),
                t('reports.columns.position'),
                t('reports.columns.hireDate'),
                t('reports.columns.status'),
                t('common.cpf'),
                t('employees.rg'),
                t('common.phone'),
                t('common.address')
              ];
              console.log('Employee headers:', headers);

              tableData = (data as Employee[]).map((emp, index) => {
                try {
                  const row = [
                    emp.employee_id || 'N/A',
                    `${emp.user?.first_name || ''} ${emp.user?.last_name || ''}`.trim() || 'N/A',
                    emp.user?.email || 'N/A',
                    emp.department || 'N/A',
                    emp.position || 'N/A',
                    emp.hire_date ? new Date(emp.hire_date).toLocaleDateString() : 'N/A',
                    emp.status || 'N/A',
                    (emp as any).cpf || 'N/A',
                    (emp as any).rg || 'N/A',
                    (emp as any).phone || 'N/A',
                    (emp as any).address || 'N/A'
                  ];
                  console.log(`Employee row ${index}:`, row);
                  return row;
                } catch (err) {
                  console.error(`Error processing employee ${index}:`, err, emp);
                  return ['Error', 'Error', 'Error', 'Error', 'Error', 'Error', 'Error', 'Error', 'Error', 'Error', 'Error'];
                }
              });
              console.log('Employees tableData:', tableData);
              break;

            case 'terminations':
              console.log('Processing terminations data...');
              headers = [
                t('reports.columns.id'),
                t('reports.columns.employee'),
                t('reports.columns.requester'),
                t('reports.columns.terminationDate'),
                t('reports.columns.reason'),
                t('reports.columns.status'),
                t('reports.columns.urgency'),
                t('reports.columns.createdAt'),
                t('common.notice'),
                t('common.observations')
              ];
              tableData = (data as TerminationRequest[]).map((term, index) => {
                try {
                  return [
                    term.id || 'N/A',
                    term.funcionario_name ||
                      (term.funcionario ? `${term.funcionario.first_name || ''} ${term.funcionario.last_name || ''}`.trim() : 'N/A'),
                    term.solicitante_name ||
                      (term.solicitante ? `${term.solicitante.first_name || ''} ${term.solicitante.last_name || ''}`.trim() : 'N/A'),
                    term.data_desligamento ? new Date(term.data_desligamento).toLocaleDateString() : 'N/A',
                    term.motivo_nome || (term.motivo ? term.motivo.nome : 'N/A'),
                    term.status_display || term.status || 'N/A',
                    term.urgencia_display || term.urgencia || 'N/A',
                    term.created_at ? new Date(term.created_at).toLocaleDateString() : 'N/A',
                    term.tem_aviso_previo ? t('common.yes') : t('common.no'),
                    'N/A'
                  ];
                } catch (err) {
                  console.error(`Error processing termination ${index}:`, err, term);
                  return ['Error', 'Error', 'Error', 'Error', 'Error', 'Error', 'Error', 'Error', 'Error', 'Error'];
                }
              });
              break;

            case 'evaluations':
              console.log('Processing evaluations data...');
              headers = [
                t('reports.columns.id'),
                t('reports.columns.evaluatedEmployee'),
                t('reports.columns.evaluator'),
                t('reports.columns.rating'),
                t('reports.columns.period'),
                t('reports.columns.status'),
                t('reports.columns.createdAt'),
                t('evaluations.goals'),
                t('evaluations.achievements')
              ];
              tableData = (data as PerformanceEvaluation[]).map((evaluation, index) => {
                try {
                  return [
                    evaluation.id || 'N/A',
                    evaluation.employee?.user
                      ? `${evaluation.employee.user.first_name || ''} ${evaluation.employee.user.last_name || ''}`.trim()
                      : 'N/A',
                    evaluation.evaluator
                      ? `${evaluation.evaluator.first_name || ''} ${evaluation.evaluator.last_name || ''}`.trim()
                      : 'N/A',
                    evaluation.overall_rating || 'N/A',
                    `${evaluation.evaluation_period_start || ''} - ${evaluation.evaluation_period_end || ''}`,
                    evaluation.status || 'N/A',
                    evaluation.created_at ? new Date(evaluation.created_at).toLocaleDateString() : 'N/A',
                    evaluation.goals || 'N/A',
                    evaluation.achievements || 'N/A'
                  ];
                } catch (err) {
                  console.error(`Error processing evaluation ${index}:`, err, evaluation);
                  return ['Error', 'Error', 'Error', 'Error', 'Error', 'Error', 'Error', 'Error', 'Error'];
                }
              });
              break;

            case 'leaves':
              headers = [
                t('reports.columns.id'),
                t('reports.columns.employee'),
                t('reports.columns.leaveType'),
                t('reports.columns.startDate'),
                t('reports.columns.endDate'),
                t('reports.columns.numberOfDays'),
                t('reports.columns.status'),
                t('reports.columns.createdAt'),
                t('common.reason')
              ];
              tableData = data.map((leave: any) => [
                leave.id,
                leave.employee?.user ?
                  `${leave.employee.user.first_name} ${leave.employee.user.last_name}` : 'N/A',
                leave.leaveType,
                leave.startDate,
                leave.endDate,
                leave.numberOfDays,
                leave.status,
                new Date(leave.createdAt || leave.created_at).toLocaleDateString(),
                leave.reason || 'N/A'
              ]);
              break;

            case 'admissions':
              headers = [
                t('reports.columns.id'),
                t('reports.columns.employee'),
                t('reports.columns.status'),
                t('common.processStep'),
                t('common.progress'),
                t('common.documentsStatus'),
                t('reports.columns.createdAt'),
                t('common.lastUpdate')
              ];
              tableData = data.map((admission: any) => [
                admission.id,
                admission.employee?.user ?
                  `${admission.employee.user.first_name} ${admission.employee.user.last_name}` : 'N/A',
                admission.status,
                admission.process_step || 'N/A',
                `${admission.completion_percentage || 0}%`,
                admission.documents_status || 'N/A',
                new Date(admission.created_at).toLocaleDateString(),
                new Date(admission.updated_at).toLocaleDateString()
              ]);
              break;
          }

          console.log('Table headers:', headers);
          console.log('Table data rows:', tableData.length);
          console.log('Sample row:', tableData[0]);

          autoTable(pdf, {
            head: [headers],
            body: tableData,
            startY: 50,
            theme: 'grid',
            headStyles: { fillColor: [41, 128, 185] },
            styles: { fontSize: 8 },
            columnStyles: {
              0: { cellWidth: 15 },
              1: { cellWidth: 30 }
            }
          });

          console.log('Table created successfully');
        } else {
          console.log('Data is empty or not an array');
        }

      console.log('Saving PDF...');
      pdf.save(`${reportTitle}_${new Date().toISOString().split('T')[0]}.pdf`);
      console.log('PDF saved successfully');
      toast.success(t('reports.downloadPDF') + ' ' + t('common.completed'));
    } catch (error: any) {
      console.error('Error generating PDF:', error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      toast.error(`${t('reports.error')}: ${error.message || 'Unknown error'}`);
    }
  };

  const downloadExcel = () => {
    if (!selectedReportType || !reportData) {
      toast.error(t('reports.noData'));
      return;
    }

    try {
      const workbook = XLSX.utils.book_new();
      const dataKey = Object.keys(reportData)[0];
      const data = reportData[dataKey as keyof ReportData];

        if (Array.isArray(data) && data.length > 0) {
          let processedData: any[] = [];

          switch (selectedReportType) {
            case 'employees':
              processedData = (data as Employee[]).map(emp => ({
                [t('reports.columns.id')]: emp.employee_id,
                [t('reports.columns.name')]: `${emp.user.first_name} ${emp.user.last_name}`,
                [t('reports.columns.email')]: emp.user.email,
                [t('reports.columns.department')]: emp.department,
                [t('reports.columns.position')]: emp.position,
                [t('reports.columns.hireDate')]: emp.hire_date,
                [t('reports.columns.status')]: emp.status,
                [t('common.cpf')]: (emp as any).cpf || 'N/A',
                [t('employees.rg')]: (emp as any).rg || 'N/A',
                [t('common.phone')]: (emp as any).phone || 'N/A',
                [t('common.address')]: (emp as any).address || 'N/A',
                [t('employees.salary')]: (emp as any).salary || 'N/A',
                [t('reports.columns.createdAt')]: new Date(emp.created_at).toLocaleDateString(),
                [t('common.lastUpdate')]: new Date(emp.updated_at).toLocaleDateString()
              }));
              break;

            case 'terminations':
              processedData = (data as TerminationRequest[]).map(term => ({
                [t('reports.columns.id')]: term.id,
                [t('reports.columns.employee')]: term.funcionario_name || `${term.funcionario.first_name} ${term.funcionario.last_name}`,
                [t('reports.columns.requester')]: term.solicitante_name || `${term.solicitante.first_name} ${term.solicitante.last_name}`,
                [t('reports.columns.terminationDate')]: term.data_desligamento,
                [t('terminations.lastDay')]: term.data_ultimo_dia,
                [t('reports.columns.reason')]: term.motivo_nome || term.motivo.nome,
                [t('common.reasonCode')]: term.motivo_codigo || term.motivo.codigo,
                [t('reports.columns.status')]: term.status_display || term.status,
                [t('reports.columns.urgency')]: term.urgencia_display || term.urgencia,
                [t('common.notice')]: term.tem_aviso_previo ? t('common.yes') : t('common.no'),
                [t('common.noticeDays')]: term.dias_aviso_previo || 'N/A',
                [t('common.noticeCompensated')]: term.aviso_previo_indenizado ? t('common.yes') : t('common.no'),
                [t('common.accruedVacation')]: term.tem_ferias_vencidas ? t('common.yes') : t('common.no'),
                [t('common.accruedVacationDays')]: term.dias_ferias_vencidas || 'N/A',
                [t('common.proportionalVacation')]: term.tem_ferias_proporcionais ? t('common.yes') : t('common.no'),
                [t('common.proportionalVacationDays')]: term.dias_ferias_proporcionais || 'N/A',
                [t('common.proportional13th')]: term.tem_decimo_proporcional ? t('common.yes') : t('common.no'),
                [t('common.hasEquipment')]: term.possui_equipamentos ? t('common.yes') : t('common.no'),
                [t('common.equipmentList')]: term.lista_equipamentos || 'N/A',
                [t('common.hasSystemAccess')]: term.possui_acessos_sistemas ? t('common.yes') : t('common.no'),
                [t('common.accessList')]: term.lista_acessos || 'N/A',
                [t('common.justification')]: term.justificativa || 'N/A',
                [t('common.hrObservations')]: term.observacoes_rh || 'N/A',
                [t('common.severanceAmount')]: term.valor_rescisao || 'N/A',
                [t('common.hrApprover')]: term.aprovador_rh_name || 'N/A',
                [t('common.hrApprovalDate')]: term.data_aprovacao_rh || 'N/A',
                [t('common.approvalComment')]: term.comentario_aprovacao_rh || 'N/A',
                [t('reports.columns.createdAt')]: new Date(term.created_at).toLocaleDateString(),
                [t('common.lastUpdate')]: new Date(term.updated_at).toLocaleDateString()
              }));
              break;

            case 'evaluations':
              processedData = (data as PerformanceEvaluation[]).map(evaluation => ({
                [t('reports.columns.id')]: evaluation.id,
                [t('reports.columns.evaluatedEmployee')]: `${evaluation.employee.user.first_name} ${evaluation.employee.user.last_name}`,
                [t('common.employeeDepartment')]: evaluation.employee.department,
                [t('common.employeePosition')]: evaluation.employee.position,
                [t('reports.columns.evaluator')]: `${evaluation.evaluator.first_name} ${evaluation.evaluator.last_name}`,
                [t('reports.columns.rating')]: evaluation.overall_rating,
                [t('common.periodStart')]: evaluation.evaluation_period_start,
                [t('common.periodEnd')]: evaluation.evaluation_period_end,
                [t('reports.columns.status')]: evaluation.status,
                [t('evaluations.goals')]: evaluation.goals || 'N/A',
                [t('evaluations.achievements')]: evaluation.achievements || 'N/A',
                [t('evaluations.areasForImprovement')]: evaluation.areas_for_improvement || 'N/A',
                [t('common.managerComments')]: evaluation.manager_comments || 'N/A',
                [t('reports.columns.createdAt')]: new Date(evaluation.created_at).toLocaleDateString(),
                [t('common.lastUpdate')]: new Date(evaluation.updated_at).toLocaleDateString()
              }));
              break;

            case 'leaves':
              processedData = data.map((leave: any) => ({
                [t('reports.columns.id')]: leave.id,
                [t('reports.columns.employee')]: leave.employee?.user ?
                  `${leave.employee.user.first_name} ${leave.employee.user.last_name}` : 'N/A',
                [t('reports.columns.department')]: leave.employee?.department || 'N/A',
                [t('reports.columns.leaveType')]: leave.leaveType,
                [t('reports.columns.startDate')]: leave.startDate,
                [t('reports.columns.endDate')]: leave.endDate,
                [t('reports.columns.numberOfDays')]: leave.numberOfDays,
                [t('reports.columns.status')]: leave.status,
                [t('common.reason')]: leave.reason || 'N/A',
                [t('common.approver')]: leave.approver || 'N/A',
                [t('common.approvalDate')]: leave.approvalDate || 'N/A',
                [t('common.comments')]: leave.comments || 'N/A',
                [t('reports.columns.createdAt')]: new Date(leave.createdAt || leave.created_at).toLocaleDateString()
              }));
              break;

            case 'admissions':
              processedData = data.map((admission: any) => ({
                [t('reports.columns.id')]: admission.id,
                [t('reports.columns.employee')]: admission.employee?.user ?
                  `${admission.employee.user.first_name} ${admission.employee.user.last_name}` : 'N/A',
                [t('common.email')]: admission.employee?.user?.email || 'N/A',
                [t('reports.columns.department')]: admission.employee?.department || 'N/A',
                [t('reports.columns.position')]: admission.employee?.position || 'N/A',
                [t('reports.columns.status')]: admission.status,
                [t('common.processStep')]: admission.process_step || 'N/A',
                [t('common.progress')]: `${admission.completion_percentage || 0}%`,
                [t('common.documentsStatus')]: admission.documents_status || 'N/A',
                [t('common.responsible')]: admission.responsible || 'N/A',
                [t('common.observations')]: admission.notes || 'N/A',
                [t('reports.columns.createdAt')]: new Date(admission.created_at).toLocaleDateString(),
                [t('common.lastUpdate')]: new Date(admission.updated_at).toLocaleDateString()
              }));
              break;

            default:
              processedData = data;
          }

          const worksheet = XLSX.utils.json_to_sheet(processedData);
          const reportTitle = reportTypes.find(type => type.value === selectedReportType)?.label || 'Data';
          XLSX.utils.book_append_sheet(workbook, worksheet, reportTitle);
        } else {
          const worksheet = XLSX.utils.aoa_to_sheet([[t('reports.noData')]]);
          XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
        }

      const reportTitle = reportTypes.find(type => type.value === selectedReportType)?.label || 'Report';
      XLSX.writeFile(workbook, `${reportTitle}_${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success(t('reports.downloadExcel') + ' ' + t('common.completed'));
    } catch (error) {
      console.error('Error generating Excel:', error);
      toast.error(t('reports.error'));
    }
  };

  const getDataCount = () => {
    if (!reportData) return 0;

    const dataKey = Object.keys(reportData)[0];
    const data = reportData[dataKey as keyof ReportData];

    return Array.isArray(data) ? data.length : 0;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">{t('reports.title')}</h1>
          <p className="text-neutral-600 mt-1">{t('reports.subtitle')}</p>
        </div>
      </div>

      {/* Report Configuration */}
      <div className="bg-white rounded-xl shadow-soft p-6">
        <h3 className="text-lg font-medium text-neutral-900 mb-4">{t('reports.selectReport')}</h3>

        {/* Report Type Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {reportTypes.map((type) => {
            const Icon = type.icon;
            return (
              <div
                key={type.value}
                className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all duration-200 ${
                  selectedReportType === type.value
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
                onClick={() => setSelectedReportType(type.value)}
              >
                <div className="flex items-start space-x-3">
                  <Icon className={`h-6 w-6 flex-shrink-0 ${
                    selectedReportType === type.value ? 'text-primary-600' : 'text-neutral-400'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <h4 className={`text-sm font-medium ${
                      selectedReportType === type.value ? 'text-primary-900' : 'text-neutral-900'
                    }`}>
                      {type.label}
                    </h4>
                    <p className={`text-xs mt-1 ${
                      selectedReportType === type.value ? 'text-primary-700' : 'text-neutral-500'
                    }`}>
                      {type.description}
                    </p>
                  </div>
                </div>
                {selectedReportType === type.value && (
                  <div className="absolute top-2 right-2">
                    <div className="h-2 w-2 rounded-full bg-primary-600"></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Date Range Selection */}
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <input
              type="checkbox"
              id="useAllData"
              checked={useAllData}
              onChange={(e) => setUseAllData(e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
            />
            <label htmlFor="useAllData" className="text-sm font-medium text-neutral-700">
              {t('reports.allData')}
            </label>
          </div>

          {!useAllData && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label={t('reports.from')}
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
              />
              <Input
                label={t('reports.to')}
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
              />
            </div>
          )}
        </div>

        {/* Generate Button */}
        <div className="flex justify-end mt-6">
          <Button
            onClick={generateReport}
            isLoading={isGenerating}
            disabled={!selectedReportType || isGenerating}
            icon={<DocumentChartBarIcon />}
          >
            {t('reports.generateReport')}
          </Button>
        </div>
      </div>

      {/* Report Results */}
      {reportData && Object.keys(reportData).length > 0 && (
        <div className="bg-white rounded-xl shadow-soft p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h3 className="text-lg font-medium text-neutral-900">
                {reportTypes.find(type => type.value === selectedReportType)?.label}
              </h3>
              <p className="text-neutral-600 text-sm">
                {`${t('common.totalRecords')}: ${getDataCount()}`}
              </p>
            </div>

            <div className="flex space-x-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={downloadPDF}
                icon={<ArrowDownTrayIcon />}
              >
                {t('reports.downloadPDF')}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={downloadExcel}
                icon={<ArrowDownTrayIcon />}
              >
                {t('reports.downloadExcel')}
              </Button>
            </div>
          </div>

          {/* Data Preview */}
          <div className="border border-neutral-200 rounded-lg p-4 bg-neutral-50">
            <p className="text-sm text-neutral-600">
              {t('common.dataGenerated')} {new Date().toLocaleString()}
            </p>
            <p className="text-xs text-neutral-500 mt-1">
              {t('common.useDownloadButtons')}
            </p>
            <div className="mt-3 text-sm text-neutral-700">
              <strong>{t('reports.dataIncluded')}:</strong>
              <ul className="list-disc list-inside mt-1 text-xs">
                {selectedReportType === 'employees' && (
                  <>
                    <li>{t('reports.dataIncludedEmployee1')}</li>
                    <li>{t('reports.dataIncludedEmployee2')}</li>
                    <li>{t('reports.dataIncludedEmployee3')}</li>
                  </>
                )}
                {selectedReportType === 'terminations' && (
                  <>
                    <li>{t('reports.dataIncludedTermination1')}</li>
                    <li>{t('reports.dataIncludedTermination2')}</li>
                    <li>{t('reports.dataIncludedTermination3')}</li>
                    <li>{t('reports.dataIncludedTermination4')}</li>
                    <li>{t('reports.dataIncludedTermination5')}</li>
                    <li>{t('reports.dataIncludedTermination6')}</li>
                  </>
                )}
                {selectedReportType === 'evaluations' && (
                  <>
                    <li>{t('reports.dataIncludedEvaluation1')}</li>
                    <li>{t('reports.dataIncludedEvaluation2')}</li>
                    <li>{t('reports.dataIncludedEvaluation3')}</li>
                    <li>{t('reports.dataIncludedEvaluation4')}</li>
                  </>
                )}
                {selectedReportType === 'leaves' && (
                  <>
                    <li>{t('reports.dataIncludedLeave1')}</li>
                    <li>{t('reports.dataIncludedLeave2')}</li>
                    <li>{t('reports.dataIncludedLeave3')}</li>
                    <li>{t('reports.dataIncludedLeave4')}</li>
                  </>
                )}
                {selectedReportType === 'admissions' && (
                  <>
                    <li>{t('reports.dataIncludedAdmission1')}</li>
                    <li>{t('reports.dataIncludedAdmission2')}</li>
                    <li>{t('reports.dataIncludedAdmission3')}</li>
                    <li>{t('reports.dataIncludedAdmission4')}</li>
                    <li>{t('reports.dataIncludedAdmission5')}</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      {isGenerating && (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
          <span className="ml-3 text-neutral-600">{t('reports.loading')}</span>
        </div>
      )}
    </div>
  );
};

export default Reports;