import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { PlusIcon } from '@heroicons/react/24/outline';
import { terminationRequestService } from '../services/terminationRequestService';
import { staffService } from '../services/staffService';
import { CreateTerminationRequest, TerminationReason, TerminationRequestListItem } from '../types/terminationRequest';
import { StaffEmployeeListItem } from '../types/staff';
import { Button, Card, Input, Modal, Select, StatusPill, TableContainer, Th, Td, Tr } from '../components/ui';
import type { PillVariant } from '../components/ui';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatDate } from '../utils/formatters';

const STATUS_PILL: Record<string, PillVariant> = {
  concluida: 'ok',
  aprovada_rh: 'ok',
  processando: 'pend',
  pendente_rh: 'pend',
  rascunho: 'pend',
  rejeitada_rh: 'rej',
  cancelada: 'rej',
};

const emptyForm: CreateTerminationRequest = {
  funcionario: 0,
  motivo: 0,
  data_ultimo_dia: '',
  data_desligamento: '',
  justificativa: '',
};

const Terminations: React.FC = () => {
  const [requests, setRequests] = useState<TerminationRequestListItem[]>([]);
  const [employees, setEmployees] = useState<StaffEmployeeListItem[]>([]);
  const [reasons, setReasons] = useState<TerminationReason[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);

  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<CreateTerminationRequest>(emptyForm);
  const [isSaving, setIsSaving] = useState(false);

  const [rejectTarget, setRejectTarget] = useState<TerminationRequestListItem | null>(null);
  const [comentario, setComentario] = useState('');

  const load = () => {
    setIsLoading(true);
    terminationRequestService
      .getRequests({ ordering: '-created_at' })
      .then((res) => setRequests(res.results))
      .catch(() => toast.error('Não foi possível carregar as rescisões.'))
      .finally(() => setIsLoading(false));
  };

  useEffect(load, []);

  useEffect(() => {
    staffService.getEmployees().then((res) => setEmployees(res.results)).catch(() => undefined);
    terminationRequestService.getReasons().then((res) => setReasons(res.results)).catch(() => undefined);
  }, []);

  const handleCreate = async () => {
    if (!form.funcionario || !form.motivo || !form.data_ultimo_dia || !form.data_desligamento || !form.justificativa.trim()) {
      toast.error('Preencha todos os campos.');
      return;
    }
    try {
      setIsSaving(true);
      await terminationRequestService.createRequest(form);
      toast.success('Solicitação de desligamento criada.');
      setShowCreate(false);
      setForm(emptyForm);
      load();
    } catch (error: any) {
      const data = error.response?.data;
      const detail = data ? Object.values(data).flat()[0] : 'Não foi possível criar a solicitação.';
      toast.error(typeof detail === 'string' ? detail : 'Não foi possível criar a solicitação.');
    } finally {
      setIsSaving(false);
    }
  };

  const runAction = async (id: number, action: () => Promise<any>, successMessage: string) => {
    try {
      setBusyId(id);
      await action();
      toast.success(successMessage);
      load();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Não foi possível concluir a ação.');
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async () => {
    if (!rejectTarget) return;
    if (!comentario.trim()) {
      toast.error('Informe o motivo da rejeição.');
      return;
    }
    await runAction(rejectTarget.id, () => terminationRequestService.reject(rejectTarget.id, comentario), 'Solicitação rejeitada.');
    setRejectTarget(null);
    setComentario('');
  };

  const nextAction = (item: TerminationRequestListItem) => {
    switch (item.status) {
      case 'rascunho':
        return (
          <Button
            variant="secondary"
            className="!px-3 !py-1.5 text-xs"
            isLoading={busyId === item.id}
            onClick={() => runAction(item.id, () => terminationRequestService.submitForApproval(item.id), 'Enviado para aprovação do RH.')}
          >
            Enviar para aprovação
          </Button>
        );
      case 'pendente_rh':
        return (
          <div className="flex gap-2">
            <Button
              className="!px-3 !py-1.5 text-xs"
              isLoading={busyId === item.id}
              onClick={() => runAction(item.id, () => terminationRequestService.approve(item.id), 'Solicitação aprovada.')}
            >
              Aprovar
            </Button>
            <Button variant="danger" className="!px-3 !py-1.5 text-xs" onClick={() => setRejectTarget(item)}>
              Rejeitar
            </Button>
          </div>
        );
      case 'aprovada_rh':
        return (
          <Button
            variant="secondary"
            className="!px-3 !py-1.5 text-xs"
            isLoading={busyId === item.id}
            onClick={() => runAction(item.id, () => terminationRequestService.startProcessing(item.id), 'Processamento iniciado.')}
          >
            Iniciar processamento
          </Button>
        );
      case 'processando':
        return (
          <Button
            className="!px-3 !py-1.5 text-xs"
            isLoading={busyId === item.id}
            onClick={() => runAction(item.id, () => terminationRequestService.complete(item.id), 'Desligamento concluído.')}
          >
            Concluir
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-[23px] font-semibold text-ink">Rescisões</h2>
          <p className="mt-[5px] text-sm text-muted">Fluxo de desligamento de funcionários.</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <PlusIcon className="h-4 w-4" />
          Nova rescisão
        </Button>
      </div>

      <Card bodyClassName="p-0">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner size="lg" />
          </div>
        ) : requests.length === 0 ? (
          <div className="px-[18px] py-16 text-center text-sm text-muted">Nenhuma solicitação de desligamento ainda.</div>
        ) : (
          <TableContainer>
            <thead>
              <tr>
                <Th>Funcionário</Th>
                <Th>Motivo</Th>
                <Th>Último dia</Th>
                <Th>Desligamento</Th>
                <Th>Status</Th>
                <Th></Th>
              </tr>
            </thead>
            <tbody>
              {requests.map((item) => (
                <Tr key={item.id}>
                  <Td>{item.funcionario_name}</Td>
                  <Td>{item.motivo_nome}</Td>
                  <Td className="font-mono">{formatDate(item.data_ultimo_dia)}</Td>
                  <Td className="font-mono">{formatDate(item.data_desligamento)}</Td>
                  <Td>
                    <StatusPill variant={STATUS_PILL[item.status] ?? 'pend'} label={item.status_display} />
                  </Td>
                  <Td>{nextAction(item)}</Td>
                </Tr>
              ))}
            </tbody>
          </TableContainer>
        )}
      </Card>

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Nova rescisão">
        <div className="grid grid-cols-1 gap-4">
          <Select label="Funcionário" value={form.funcionario} onChange={(e) => setForm({ ...form, funcionario: Number(e.target.value) })}>
            <option value={0}>Selecione</option>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.user}>
                {employee.nome}
              </option>
            ))}
          </Select>
          <Select label="Motivo" value={form.motivo} onChange={(e) => setForm({ ...form, motivo: Number(e.target.value) })}>
            <option value={0}>Selecione</option>
            {reasons.map((reason) => (
              <option key={reason.id} value={reason.id}>
                {reason.nome}
              </option>
            ))}
          </Select>
          <Input
            label="Último dia de trabalho"
            type="date"
            value={form.data_ultimo_dia}
            onChange={(e) => setForm({ ...form, data_ultimo_dia: e.target.value })}
          />
          <Input
            label="Data de desligamento"
            type="date"
            value={form.data_desligamento}
            onChange={(e) => setForm({ ...form, data_desligamento: e.target.value })}
          />
          <Input
            label="Justificativa"
            value={form.justificativa}
            onChange={(e) => setForm({ ...form, justificativa: e.target.value })}
          />
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setShowCreate(false)} disabled={isSaving}>
            Cancelar
          </Button>
          <Button onClick={handleCreate} isLoading={isSaving}>
            Criar solicitação
          </Button>
        </div>
      </Modal>

      <Modal isOpen={!!rejectTarget} onClose={() => setRejectTarget(null)} title="Rejeitar solicitação">
        <p className="mb-3 text-sm text-muted">{rejectTarget?.funcionario_name}</p>
        <Input
          label="Motivo da rejeição"
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          placeholder="Obrigatório para rejeições"
        />
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setRejectTarget(null)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleReject}>
            Confirmar rejeição
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default Terminations;
