import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { CheckIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { leaveService } from '../services/leaveService';
import { CreateLeaveRequest, LeaveRequestListItem, LeavePriority, LeaveType } from '../types/leave';
import {
  Button,
  Card,
  Input,
  Modal,
  Pagination,
  Select,
  StatusPill,
  TableContainer,
  Th,
  Td,
  Tr,
} from '../components/ui';
import type { PillVariant } from '../components/ui';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatDate } from '../utils/formatters';

const PAGE_SIZE = 20;

const STATUS_PILL: Record<string, PillVariant> = {
  aprovada: 'ok',
  pendente: 'pend',
  rejeitada: 'rej',
  cancelada: 'rej',
};

const PRIORITY_OPTIONS: { value: LeavePriority; label: string }[] = [
  { value: 'baixa', label: 'Baixa' },
  { value: 'media', label: 'Média' },
  { value: 'alta', label: 'Alta' },
  { value: 'urgente', label: 'Urgente' },
];

const emptyRequest: CreateLeaveRequest = {
  tipo: 0,
  data_inicio: '',
  motivo: '',
  prioridade: 'media',
  dias_gozo: undefined,
  tem_abono_pecuniario: false,
  dias_abono_pecuniario: undefined,
};

const LeaveRequests: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin_rh';

  const [requests, setRequests] = useState<LeaveRequestListItem[]>([]);
  const [types, setTypes] = useState<LeaveType[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<CreateLeaveRequest>(emptyRequest);
  const [isSaving, setIsSaving] = useState(false);

  const [approvalTarget, setApprovalTarget] = useState<{ item: LeaveRequestListItem; action: 'approve' | 'reject' } | null>(null);
  const [comentario, setComentario] = useState('');

  useEffect(() => {
    leaveService
      .getLeaveTypes()
      .then((res) => setTypes(res.results))
      .catch(() => undefined);
  }, []);

  const load = () => {
    setIsLoading(true);
    leaveService
      .getLeaveRequests({ page, status: status || undefined, ordering: '-created_at' })
      .then((res) => {
        setRequests(res.results);
        setTotalItems(res.count);
      })
      .catch(() => toast.error('Não foi possível carregar as solicitações.'))
      .finally(() => setIsLoading(false));
  };

  useEffect(load, [page, status]);

  const selectedType = types.find((t) => t.id === form.tipo);
  const isVacation = selectedType ? selectedType.nome.toLowerCase().includes('rias') : false;

  const handleCreate = async () => {
    if (!form.tipo || !form.data_inicio || !form.motivo.trim()) {
      toast.error('Selecione o tipo, a data de início e informe o motivo.');
      return;
    }
    if (isVacation && !form.dias_gozo) {
      toast.error('Informe os dias de gozo para a solicitação de férias.');
      return;
    }
    try {
      setIsSaving(true);
      await leaveService.createLeaveRequest(form);
      toast.success('Solicitação enviada.');
      setShowCreate(false);
      setForm(emptyRequest);
      setPage(1);
      load();
    } catch (error: any) {
      const data = error.response?.data;
      const detail = data ? Object.values(data).flat()[0] : 'Não foi possível enviar a solicitação.';
      toast.error(typeof detail === 'string' ? detail : 'Não foi possível enviar a solicitação.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDecision = async () => {
    if (!approvalTarget) return;
    try {
      if (approvalTarget.action === 'approve') {
        await leaveService.approveLeaveRequest(approvalTarget.item.id, comentario);
        toast.success('Solicitação aprovada.');
      } else {
        await leaveService.rejectLeaveRequest(approvalTarget.item.id, comentario);
        toast.success('Solicitação rejeitada.');
      }
      setApprovalTarget(null);
      setComentario('');
      load();
    } catch {
      toast.error('Não foi possível processar a solicitação.');
    }
  };

  const pageCount = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-[23px] font-semibold text-ink">Férias e afastamentos</h2>
          <p className="mt-[5px] text-sm text-muted">
            {isAdmin ? 'Solicitações de toda a equipe.' : 'Suas solicitações de férias e licenças.'}
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <PlusIcon className="h-4 w-4" />
          Nova solicitação
        </Button>
      </div>

      <Card bodyClassName="p-0">
        <div className="flex flex-wrap gap-3 p-[18px]">
          <div className="w-full sm:w-52">
            <Select value={status} onChange={(e) => { setPage(1); setStatus(e.target.value); }}>
              <option value="">Todos os status</option>
              <option value="pendente">Pendente</option>
              <option value="aprovada">Aprovada</option>
              <option value="rejeitada">Rejeitada</option>
              <option value="cancelada">Cancelada</option>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner size="lg" />
          </div>
        ) : requests.length === 0 ? (
          <div className="px-[18px] py-16 text-center text-sm text-muted">Nenhuma solicitação encontrada.</div>
        ) : (
          <>
            <TableContainer>
              <thead>
                <tr>
                  {isAdmin && <Th>Funcionário</Th>}
                  <Th>Tipo</Th>
                  <Th>Período</Th>
                  <Th>Dias</Th>
                  <Th>Prioridade</Th>
                  <Th>Status</Th>
                  {isAdmin && <Th></Th>}
                </tr>
              </thead>
              <tbody>
                {requests.map((item) => (
                  <Tr key={item.id}>
                    {isAdmin && <Td>{item.solicitante_name}</Td>}
                    <Td>{item.tipo_name}</Td>
                    <Td className="font-mono">
                      {formatDate(item.data_inicio, 'dd/MM/yyyy')} a {formatDate(item.data_fim, 'dd/MM/yyyy')}
                    </Td>
                    <Td className="font-mono">{item.dias_solicitados}</Td>
                    <Td>{item.prioridade_display}</Td>
                    <Td>
                      <StatusPill variant={STATUS_PILL[item.status] ?? 'pend'} label={item.status_display} />
                    </Td>
                    {isAdmin && (
                      <Td>
                        {item.status === 'pendente' && (
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setApprovalTarget({ item, action: 'approve' })}
                              className="text-success hover:opacity-70"
                              aria-label="Aprovar"
                            >
                              <CheckIcon className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setApprovalTarget({ item, action: 'reject' })}
                              className="text-danger hover:opacity-70"
                              aria-label="Rejeitar"
                            >
                              <XMarkIcon className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </Td>
                    )}
                  </Tr>
                ))}
              </tbody>
            </TableContainer>
            <Pagination page={page} pageCount={pageCount} totalItems={totalItems} pageSize={PAGE_SIZE} onPageChange={setPage} />
          </>
        )}
      </Card>

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Nova solicitação">
        <div className="grid grid-cols-1 gap-4">
          <Select label="Tipo" value={form.tipo} onChange={(e) => setForm({ ...form, tipo: Number(e.target.value) })}>
            <option value={0}>Selecione</option>
            {types.map((type) => (
              <option key={type.id} value={type.id}>
                {type.nome}
              </option>
            ))}
          </Select>
          <Input
            label="Data de início"
            type="date"
            value={form.data_inicio}
            onChange={(e) => setForm({ ...form, data_inicio: e.target.value })}
          />
          {isVacation ? (
            <Input
              label="Dias de gozo"
              type="number"
              min={1}
              max={30}
              value={form.dias_gozo || ''}
              onChange={(e) => setForm({ ...form, dias_gozo: Number(e.target.value) })}
            />
          ) : (
            <Input
              label="Data de fim"
              type="date"
              value={form.data_fim || ''}
              onChange={(e) => setForm({ ...form, data_fim: e.target.value })}
            />
          )}
          <Select
            label="Prioridade"
            value={form.prioridade}
            onChange={(e) => setForm({ ...form, prioridade: e.target.value as LeavePriority })}
          >
            {PRIORITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
          <Input label="Motivo" value={form.motivo} onChange={(e) => setForm({ ...form, motivo: e.target.value })} />
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setShowCreate(false)} disabled={isSaving}>
            Cancelar
          </Button>
          <Button onClick={handleCreate} isLoading={isSaving}>
            Enviar solicitação
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={!!approvalTarget}
        onClose={() => setApprovalTarget(null)}
        title={approvalTarget?.action === 'approve' ? 'Aprovar solicitação' : 'Rejeitar solicitação'}
      >
        <p className="mb-3 text-sm text-muted">
          {approvalTarget?.item.solicitante_name} · {approvalTarget?.item.tipo_name}
        </p>
        <Input
          label="Comentário (opcional)"
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          placeholder="Explique o motivo da decisão"
        />
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setApprovalTarget(null)}>
            Cancelar
          </Button>
          <Button variant={approvalTarget?.action === 'reject' ? 'danger' : 'primary'} onClick={handleDecision}>
            Confirmar
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default LeaveRequests;
