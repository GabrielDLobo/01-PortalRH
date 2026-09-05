import { useState } from 'react';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { ArrowDownTrayIcon, DocumentChartBarIcon } from '@heroicons/react/24/outline';
import { reportService } from '../services/reportService';
import { REPORT_TYPES, ReportResult, ReportType } from '../types/report';
import { Button, Card, Select, TableContainer, Th, Td, Tr } from '../components/ui';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatDate } from '../utils/formatters';

// Algumas quebras (breakdowns) do backend vêm fragmentadas por causa de um
// order_by anterior ao annotate (efeito colateral conhecido do Django ORM);
// reagrupamos aqui para exibir contagens corretas por rótulo.
function aggregateBreakdown(rows: Record<string, unknown>[], labelKey: string): { label: string; count: number }[] {
  const totals = new Map<string, number>();
  rows.forEach((row) => {
    const label = String(row[labelKey] ?? 'Não informado');
    const count = Number(row.count ?? 0);
    totals.set(label, (totals.get(label) ?? 0) + count);
  });
  return Array.from(totals.entries()).map(([label, count]) => ({ label, count }));
}

function findBreakdownKey(summary: Record<string, unknown>): string | null {
  const key = Object.keys(summary).find((k) => Array.isArray(summary[k]) && k.includes('breakdown'));
  return key ?? null;
}

function labelKeyFor(row: Record<string, unknown>): string {
  return Object.keys(row).find((key) => key !== 'count') || 'status';
}

const LABELS: Record<string, string> = {
  total_employees: 'Total de funcionários',
  average_salary: 'Salário médio',
  department_breakdown: 'Funcionários por setor',
  status_breakdown: 'Por status',
  total_evaluations: 'Total de avaliações',
  average_score: 'Nota média',
  score_distribution: 'Distribuição de notas',
  total_requests: 'Total de solicitações',
  total_days_requested: 'Total de dias solicitados',
  type_breakdown: 'Por tipo',
  total_terminations: 'Total de desligamentos',
  reason_breakdown: 'Por motivo',
  monthly_breakdown: 'Por mês',
  total_admissions: 'Total de admissões',
  completion_stats: 'Conclusão do processo',
  id: 'ID',
  employee_name: 'Funcionário',
  employee_email: 'E-mail',
  employee_id: 'Matrícula',
  full_name: 'Nome completo',
  email: 'E-mail',
  department: 'Setor',
  position: 'Cargo',
  hire_date: 'Admissão',
  salary: 'Salário',
  status: 'Status',
  phone: 'Telefone',
  education_level: 'Escolaridade',
  reason: 'Motivo',
  termination_date: 'Desligamento',
  last_work_day: 'Último dia',
  requester: 'Solicitante',
  justification: 'Justificativa',
  created_at: 'Criado em',
  evaluator_name: 'Avaliador',
  period: 'Período',
  overall_score: 'Nota final',
  leave_type: 'Tipo',
  start_date: 'Início',
  end_date: 'Fim',
  days_requested: 'Dias',
};

function humanize(key: string): string {
  return LABELS[key] || key.replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase());
}

const Reports: React.FC = () => {
  const [type, setType] = useState<ReportType>('employees');
  const [result, setResult] = useState<ReportResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const generate = async () => {
    try {
      setIsLoading(true);
      const data = await reportService.getReport(type);
      setResult(data);
    } catch {
      toast.error('Não foi possível gerar o relatório.');
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  const columns = result && result.data.length > 0 ? Object.keys(result.data[0]) : [];

  const exportPdf = () => {
    if (!result) return;
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    doc.setFontSize(14);
    doc.text(REPORT_TYPES.find((t) => t.value === result.report_type)?.label || result.report_type, 14, 14);
    doc.setFontSize(9);
    doc.text(`Gerado em ${formatDate(result.generated_at, 'dd/MM/yyyy HH:mm')}`, 14, 20);
    autoTable(doc, {
      startY: 26,
      head: [columns.map(humanize)],
      body: result.data.map((row) => columns.map((col) => String(row[col] ?? ''))),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [34, 211, 238], textColor: [4, 7, 13] },
    });
    doc.save(`relatorio_${result.report_type}_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const exportExcel = () => {
    if (!result) return;
    const worksheet = XLSX.utils.json_to_sheet(result.data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Relatório');
    XLSX.writeFile(workbook, `relatorio_${result.report_type}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const exportCsv = () => {
    if (!result) return;
    const header = columns.join(';');
    const rows = result.data.map((row) => columns.map((col) => String(row[col] ?? '')).join(';'));
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `relatorio_${result.report_type}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const breakdownKey = result ? findBreakdownKey(result.summary) : null;
  const breakdownRows = breakdownKey ? (result!.summary[breakdownKey] as Record<string, unknown>[]) : [];
  const breakdown = breakdownRows.length > 0 ? aggregateBreakdown(breakdownRows, labelKeyFor(breakdownRows[0])) : [];
  const maxBreakdown = Math.max(1, ...breakdown.map((b) => b.count));

  const scalarSummary: [string, string | number][] = result
    ? (Object.entries(result.summary).filter(
        ([, value]) => typeof value === 'number' || typeof value === 'string'
      ) as [string, string | number][])
    : [];

  return (
    <div>
      <div className="mb-5">
        <h2 className="font-display text-[23px] font-semibold text-ink">Relatórios</h2>
        <p className="mt-[5px] text-sm text-muted">Gere relatórios com dados atualizados do sistema.</p>
      </div>

      <Card className="mb-5">
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-full sm:w-72">
            <Select label="Tipo de relatório" value={type} onChange={(e) => setType(e.target.value as ReportType)}>
              {REPORT_TYPES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
          <Button onClick={generate} isLoading={isLoading}>
            <DocumentChartBarIcon className="h-4 w-4" />
            Gerar relatório
          </Button>
        </div>
      </Card>

      {isLoading && (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {!isLoading && result && (
        <>
          <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {scalarSummary.map(([key, value]) => (
              <div key={key} className="rounded-2xl border border-line bg-surface p-[18px] shadow-sm">
                <div className="text-[12.5px] font-medium text-muted">{humanize(key)}</div>
                <div className="mt-[3px] font-display text-[24px] font-bold text-ink">
                  {typeof value === 'number' ? value.toLocaleString('pt-BR', { maximumFractionDigits: 2 }) : value}
                </div>
              </div>
            ))}
          </div>

          {breakdown.length > 0 && (
            <Card title={humanize(breakdownKey || '')} className="mb-5">
              <div className="flex flex-col gap-[11px]">
                {breakdown.map((row) => (
                  <div key={row.label} className="grid grid-cols-[140px_1fr_34px] items-center gap-3">
                    <span className="truncate text-[12.5px] font-medium text-ink">{row.label}</span>
                    <span className="h-3 overflow-hidden rounded-md bg-line-2">
                      <span
                        className="block h-full rounded-md bg-gradient-to-r from-cyan-600 to-cyan"
                        style={{ width: `${(row.count / maxBreakdown) * 100}%` }}
                      />
                    </span>
                    <span className="text-right font-mono text-[12.5px] font-semibold text-muted">{row.count}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <Card
            title="Dados do relatório"
            subtitle={
              <div className="flex gap-2">
                <Button variant="secondary" className="!px-3 !py-1.5 text-xs" onClick={exportCsv}>
                  <ArrowDownTrayIcon className="h-3.5 w-3.5" />
                  CSV
                </Button>
                <Button variant="secondary" className="!px-3 !py-1.5 text-xs" onClick={exportExcel}>
                  <ArrowDownTrayIcon className="h-3.5 w-3.5" />
                  Excel
                </Button>
                <Button variant="secondary" className="!px-3 !py-1.5 text-xs" onClick={exportPdf}>
                  <ArrowDownTrayIcon className="h-3.5 w-3.5" />
                  PDF
                </Button>
              </div>
            }
            bodyClassName="p-0"
          >
            {result.data.length === 0 ? (
              <p className="px-[18px] py-10 text-center text-sm text-muted">Nenhum registro encontrado.</p>
            ) : (
              <TableContainer>
                <thead>
                  <tr>
                    {columns.map((col) => (
                      <Th key={col}>{humanize(col)}</Th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.data.slice(0, 50).map((row, index) => (
                    <Tr key={index}>
                      {columns.map((col) => (
                        <Td key={col}>{String(row[col] ?? '')}</Td>
                      ))}
                    </Tr>
                  ))}
                </tbody>
              </TableContainer>
            )}
            {result.data.length > 50 && (
              <p className="border-t border-line-2 px-[18px] py-3 text-xs text-muted">
                Mostrando 50 de {result.data.length} registros. Exporte para ver a lista completa.
              </p>
            )}
          </Card>
        </>
      )}
    </div>
  );
};

export default Reports;
