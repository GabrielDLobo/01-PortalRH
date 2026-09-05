import { useEffect, useMemo, useState } from 'react';
import {
  UsersIcon,
  CalendarDaysIcon,
  TrophyIcon,
  UserMinusIcon,
  CheckCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { terminationService } from '../services/terminationService';
import { Avatar, Card, StatKPI, StatusPill, TableContainer, Th, Td, Tr } from '../components/ui';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatDate, formatRelativeTime } from '../utils/formatters';
import { parseISO } from 'date-fns';
import type { PillVariant } from '../components/ui';

interface PaginatedResponse<T> {
  count: number;
  results: T[];
}

interface StaffEmployee {
  id: number;
  nome: string;
  cargo: string;
  setor: string;
  status: string;
  status_display: string;
  data_admissao: string;
}

interface LeaveRequestItem {
  id: number;
  solicitante_name: string;
  tipo_name: string;
  data_inicio: string;
  data_fim: string;
  dias_solicitados: number;
  status: string;
  status_display: string;
  created_at: string;
}

interface EvaluationItem {
  id: number;
  avaliado_name: string;
  status: string;
  status_display: string;
  nota_final: string | null;
  data_conclusao: string | null;
  created_at: string;
}

interface ActivityEntry {
  key: string;
  timestamp: string;
  icon: typeof CheckCircleIcon;
  iconClass: string;
  message: React.ReactNode;
}

const LEAVE_PILL: Record<string, PillVariant> = {
  aprovada: 'ok',
  pendente: 'pend',
  rejeitada: 'rej',
  cancelada: 'rej',
};

function isCurrentMonth(dateIso: string): boolean {
  const date = parseISO(dateIso);
  const now = new Date();
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<StaffEmployee[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequestItem[]>([]);
  const [evaluations, setEvaluations] = useState<EvaluationItem[]>([]);
  const [terminationsThisMonth, setTerminationsThisMonth] = useState(0);
  const [terminationsLastMonth, setTerminationsLastMonth] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      const [employeesRes, leavesRes, evaluationsRes, terminationStats] = await Promise.allSettled([
        apiService.get<PaginatedResponse<StaffEmployee>>('/v1/staff/employees/', { page_size: 100 }),
        apiService.get<PaginatedResponse<LeaveRequestItem>>('/v1/leave-requests/requests/', { page_size: 100 }),
        apiService.get<PaginatedResponse<EvaluationItem>>('/v1/evaluations/evaluations/', { page_size: 100 }),
        terminationService.getTerminationStats(),
      ]);

      if (!mounted) return;

      if (employeesRes.status === 'fulfilled') {
        setEmployees(employeesRes.value.results);
      } else {
        console.error('Falha ao carregar funcionários', employeesRes.reason);
      }

      if (leavesRes.status === 'fulfilled') {
        setLeaveRequests(leavesRes.value.results);
      } else {
        console.error('Falha ao carregar solicitações de férias', leavesRes.reason);
      }

      if (evaluationsRes.status === 'fulfilled') {
        setEvaluations(evaluationsRes.value.results);
      } else {
        console.error('Falha ao carregar avaliações', evaluationsRes.reason);
      }

      if (terminationStats.status === 'fulfilled') {
        const porMes = terminationStats.value.por_mes ?? [];
        setTerminationsThisMonth(porMes[porMes.length - 1]?.count ?? 0);
        setTerminationsLastMonth(porMes[porMes.length - 2]?.count ?? 0);
      } else {
        console.error('Falha ao carregar estatísticas de desligamento', terminationStats.reason);
      }

      setIsLoading(false);
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const setorBySolicitante = useMemo(() => {
    const map = new Map<string, string>();
    employees.forEach((employee) => map.set(employee.nome, employee.setor));
    return map;
  }, [employees]);

  const activeEmployees = employees.filter((employee) => employee.status === 'ativo');
  const newHiresThisMonth = employees.filter((employee) => isCurrentMonth(employee.data_admissao));

  const pendingLeaves = leaveRequests.filter((request) => request.status === 'pendente');

  const completedEvaluations = evaluations.filter((evaluation) => evaluation.status === 'concluida');
  const evaluationRate =
    evaluations.length > 0 ? Math.round((completedEvaluations.length / evaluations.length) * 100) : 0;

  const bySetor = useMemo(() => {
    const counts = new Map<string, number>();
    employees.forEach((employee) => counts.set(employee.setor, (counts.get(employee.setor) ?? 0) + 1));
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 7);
  }, [employees]);
  const maxSetorCount = Math.max(1, ...bySetor.map(([, count]) => count));

  const upcomingLeaves = useMemo(() => {
    const todayIso = new Date().toISOString().slice(0, 10);
    const upcoming = leaveRequests
      .filter((request) => request.data_inicio >= todayIso)
      .sort((a, b) => a.data_inicio.localeCompare(b.data_inicio));
    if (upcoming.length >= 5) return upcoming.slice(0, 5);

    const past = leaveRequests
      .filter((request) => request.data_inicio < todayIso)
      .sort((a, b) => b.data_inicio.localeCompare(a.data_inicio));
    return [...upcoming, ...past].slice(0, 5);
  }, [leaveRequests]);

  const recentActivity = useMemo(() => {
    const entries: ActivityEntry[] = [];

    leaveRequests
      .filter((request) => request.status === 'aprovada')
      .forEach((request) =>
        entries.push({
          key: `leave-approved-${request.id}`,
          timestamp: request.created_at,
          icon: CheckCircleIcon,
          iconClass: 'bg-success/10 text-[#047857]',
          message: (
            <>
              <b className="font-semibold">{request.tipo_name} aprovada</b> para {request.solicitante_name}
            </>
          ),
        })
      );

    completedEvaluations.forEach((evaluation) =>
      entries.push({
        key: `evaluation-${evaluation.id}`,
        timestamp: evaluation.data_conclusao || evaluation.created_at,
        icon: TrophyIcon,
        iconClass: 'bg-violet/10 text-violet',
        message: (
          <>
            <b className="font-semibold">Avaliação concluída</b>: nota {evaluation.nota_final} para{' '}
            {evaluation.avaliado_name}
          </>
        ),
      })
    );

    pendingLeaves.forEach((request) =>
      entries.push({
        key: `leave-pending-${request.id}`,
        timestamp: request.created_at,
        icon: ClockIcon,
        iconClass: 'bg-warning/10 text-[#B45309]',
        message: (
          <>
            <b className="font-semibold">Solicitação de {request.tipo_name}</b> de {request.solicitante_name}{' '}
            aguardando aprovação
          </>
        ),
      })
    );

    return entries.sort((a, b) => b.timestamp.localeCompare(a.timestamp)).slice(0, 4);
  }, [leaveRequests, completedEvaluations, pendingLeaves]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const firstName = user?.first_name || 'RH';
  const terminationDelta =
    terminationsThisMonth === terminationsLastMonth
      ? { direction: 'flat' as const, label: 'mesmo nível do mês anterior' }
      : terminationsThisMonth > terminationsLastMonth
        ? { direction: 'up' as const, label: `${terminationsThisMonth - terminationsLastMonth} a mais que o mês anterior` }
        : { direction: 'down' as const, label: `${terminationsLastMonth - terminationsThisMonth} a menos que o mês anterior` };

  return (
    <div>
      <div className="mb-[22px]">
        <h2 className="font-display text-[23px] font-semibold text-ink">Bom dia, {firstName}</h2>
        <p className="mt-[5px] text-sm text-muted">
          Panorama de pessoas da sua empresa hoje, {formatDate(new Date(), "EEEE, d 'de' MMMM")}.
        </p>
      </div>

      <div className="mb-[22px] grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatKPI
          icon={<UsersIcon />}
          color="cyan"
          label="Funcionários ativos"
          value={activeEmployees.length}
          delta={
            newHiresThisMonth.length > 0
              ? { direction: 'up', label: `${newHiresThisMonth.length} este mês` }
              : undefined
          }
        />
        <StatKPI
          icon={<CalendarDaysIcon />}
          color="warning"
          label="Férias pendentes"
          value={pendingLeaves.length}
          delta={{ direction: 'flat', label: 'aguardando aprovação' }}
        />
        <StatKPI
          icon={<TrophyIcon />}
          color="violet"
          label="Avaliações do ciclo"
          value={
            <>
              {completedEvaluations.length}
              <span className="text-[15px] text-muted"> / {evaluations.length}</span>
            </>
          }
          delta={evaluations.length > 0 ? { direction: 'up', label: `${evaluationRate}% concluídas` } : undefined}
        />
        <StatKPI
          icon={<UserMinusIcon />}
          color="human"
          label="Desligamentos no mês"
          value={terminationsThisMonth}
          delta={terminationDelta}
        />
      </div>

      <div className="mb-[22px] grid grid-cols-1 gap-4 lg:grid-cols-[1.35fr_1fr]">
        <Card title="Funcionários por setor" subtitle={`${employees.length} no total`}>
          <div className="flex flex-col gap-[11px]">
            {bySetor.length === 0 && <p className="text-sm text-muted">Sem dados de funcionários ainda.</p>}
            {bySetor.map(([setor, count]) => (
              <div key={setor} className="grid grid-cols-[96px_1fr_34px] items-center gap-3">
                <span className="truncate text-[12.5px] font-medium text-ink">{setor}</span>
                <span className="h-3 overflow-hidden rounded-md bg-line-2">
                  <span
                    className="block h-full rounded-md bg-gradient-to-r from-cyan-600 to-cyan shadow-[0_0_10px_rgba(34,211,238,.4)]"
                    style={{ width: `${(count / maxSetorCount) * 100}%` }}
                  />
                </span>
                <span className="text-right font-mono text-[12.5px] font-semibold text-muted">{count}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Atividade recente">
          <div className="flex flex-col">
            {recentActivity.length === 0 && <p className="text-sm text-muted">Nenhuma atividade recente.</p>}
            {recentActivity.map((entry, index) => (
              <div
                key={entry.key}
                className={
                  index < recentActivity.length - 1
                    ? 'flex gap-3 border-b border-line-2 py-[11px]'
                    : 'flex gap-3 py-[11px]'
                }
              >
                <span className={`grid h-8 w-8 flex-none place-items-center rounded-[9px] ${entry.iconClass}`}>
                  <entry.icon className="h-4 w-4" />
                </span>
                <div className="text-[13px] leading-snug text-ink">
                  {entry.message}
                  <span className="mt-0.5 block text-[11.5px] text-muted">{formatRelativeTime(entry.timestamp)}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card title="Próximas férias e afastamentos" subtitle={formatDate(new Date(), 'MMMM')}>
        <TableContainer>
          <thead>
            <tr>
              <Th>Funcionário</Th>
              <Th>Tipo</Th>
              <Th>Período</Th>
              <Th>Dias</Th>
              <Th>Status</Th>
            </tr>
          </thead>
          <tbody>
            {upcomingLeaves.length === 0 && (
              <Tr>
                <Td colSpan={5} className="text-muted">
                  Nenhuma solicitação de férias ou afastamento registrada.
                </Td>
              </Tr>
            )}
            {upcomingLeaves.map((request) => (
              <Tr key={request.id}>
                <Td>
                  <div className="flex items-center gap-2.5">
                    <Avatar name={request.solicitante_name} />
                    <div>
                      {request.solicitante_name}
                      <div className="text-[11.5px] text-muted">
                        {setorBySolicitante.get(request.solicitante_name) || 'Sem setor'}
                      </div>
                    </div>
                  </div>
                </Td>
                <Td>{request.tipo_name}</Td>
                <Td className="font-mono">
                  {formatDate(request.data_inicio, 'dd/MM')} a {formatDate(request.data_fim, 'dd/MM')}
                </Td>
                <Td className="font-mono">{request.dias_solicitados}</Td>
                <Td>
                  <StatusPill variant={LEAVE_PILL[request.status] ?? 'pend'} label={request.status_display} />
                </Td>
              </Tr>
            ))}
          </tbody>
        </TableContainer>
      </Card>
    </div>
  );
};

export default Dashboard;
