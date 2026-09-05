import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ArrowLeftIcon,
  ArrowUpTrayIcon,
  DocumentIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { staffService } from '../services/staffService';
import { apiService } from '../services/api';
import {
  DOCUMENT_TYPES,
  EmployeeStatus,
  StaffEmployeeDetail,
  StaffEmployeeDocument,
  StaffEmployeeWriteRequest,
} from '../types/staff';
import { Avatar, Button, Card, Input, Select, StatusPill, TableContainer, Th, Td, Tr } from '../components/ui';
import type { PillVariant } from '../components/ui';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatDate } from '../utils/formatters';

type TabId = 'dados' | 'documentos' | 'historico' | 'avaliacoes' | 'ferias';

const TABS: { id: TabId; label: string }[] = [
  { id: 'dados', label: 'Dados' },
  { id: 'documentos', label: 'Documentos' },
  { id: 'historico', label: 'Histórico' },
  { id: 'avaliacoes', label: 'Avaliações' },
  { id: 'ferias', label: 'Férias' },
];

const STATUS_OPTIONS: { value: EmployeeStatus; label: string }[] = [
  { value: 'ativo', label: 'Ativo' },
  { value: 'ferias', label: 'Férias' },
  { value: 'afastado', label: 'Afastado' },
  { value: 'inativo', label: 'Inativo' },
];

const STATUS_PILL: Record<EmployeeStatus, PillVariant> = {
  ativo: 'ok',
  ferias: 'pend',
  afastado: 'pend',
  inativo: 'rej',
};

interface EvaluationItem {
  id: number;
  status: string;
  status_display: string;
  periodo_inicio: string;
  periodo_fim: string;
  nota_final: string | null;
}

interface LeaveRequestItem {
  id: number;
  solicitante: number;
  tipo_name: string;
  data_inicio: string;
  data_fim: string;
  dias_solicitados: number;
  status: string;
  status_display: string;
}

const LEAVE_PILL: Record<string, PillVariant> = {
  aprovada: 'ok',
  pendente: 'pend',
  rejeitada: 'rej',
  cancelada: 'rej',
};

const EVALUATION_PILL: Record<string, PillVariant> = {
  concluida: 'ok',
  em_andamento: 'pend',
  pendente: 'pend',
  cancelada: 'rej',
};

function emptyForm(employee: StaffEmployeeDetail): StaffEmployeeWriteRequest {
  return {
    nome: employee.nome,
    cargo: employee.cargo,
    setor: employee.setor,
    data_admissao: employee.data_admissao,
    data_demissao: employee.data_demissao,
    salario: employee.salario,
    cpf: employee.cpf,
    rg: employee.rg,
    telefone: employee.telefone,
    endereco: employee.endereco,
    data_nascimento: employee.data_nascimento,
    status: employee.status,
    observacoes: employee.observacoes,
  };
}

const EmployeeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const employeeId = Number(id);

  const [employee, setEmployee] = useState<StaffEmployeeDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [tab, setTab] = useState<TabId>('dados');

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<StaffEmployeeWriteRequest | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [documents, setDocuments] = useState<StaffEmployeeDocument[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadTipo, setUploadTipo] = useState(DOCUMENT_TYPES[0].value);
  const [uploadNome, setUploadNome] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  const [evaluations, setEvaluations] = useState<EvaluationItem[] | null>(null);
  const [leaves, setLeaves] = useState<LeaveRequestItem[] | null>(null);

  const loadEmployee = () => {
    setIsLoading(true);
    setHasError(false);
    staffService
      .getEmployee(employeeId)
      .then((data) => {
        setEmployee(data);
        setForm(emptyForm(data));
      })
      .catch((error) => {
        setHasError(true);
        console.error('Falha ao carregar funcionário', error);
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    if (!Number.isFinite(employeeId)) return;
    loadEmployee();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeId]);

  useEffect(() => {
    if (tab === 'documentos' && Number.isFinite(employeeId)) {
      staffService
        .getDocuments(employeeId)
        .then((res) => setDocuments(res.results))
        .catch(() => toast.error('Não foi possível carregar os documentos.'));
    }
    if (tab === 'avaliacoes' && employee && evaluations === null) {
      apiService
        .get<{ results: EvaluationItem[] }>('/v1/evaluations/evaluations/', { avaliado: employee.user.id })
        .then((res) => setEvaluations(res.results))
        .catch(() => {
          toast.error('Não foi possível carregar as avaliações.');
          setEvaluations([]);
        });
    }
    if (tab === 'ferias' && employee && leaves === null) {
      apiService
        .get<{ results: LeaveRequestItem[] }>('/v1/leave-requests/requests/', { page_size: 100 })
        .then((res) => setLeaves(res.results.filter((item) => item.solicitante === employee.user.id)))
        .catch(() => {
          toast.error('Não foi possível carregar as férias e afastamentos.');
          setLeaves([]);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, employee]);

  const startEdit = () => {
    if (employee) setForm(emptyForm(employee));
    setIsEditing(true);
  };

  const cancelEdit = () => {
    if (employee) setForm(emptyForm(employee));
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!form) return;
    try {
      setIsSaving(true);
      const updated = await staffService.updateEmployee(employeeId, form);
      setEmployee(updated);
      setIsEditing(false);
      toast.success('Dados do funcionário atualizados.');
    } catch (error: any) {
      const detail = error.response?.data?.cpf?.[0] || error.response?.data?.detail || 'Não foi possível salvar as alterações.';
      toast.error(detail);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpload = async () => {
    if (!uploadFile || !uploadNome.trim()) {
      toast.error('Informe o nome do documento e escolha um arquivo.');
      return;
    }
    try {
      setIsUploading(true);
      const created = await staffService.uploadDocument({
        employee: employeeId,
        tipo: uploadTipo,
        nome: uploadNome.trim(),
        arquivo: uploadFile,
      });
      setDocuments((prev) => [created, ...prev]);
      setUploadNome('');
      setUploadFile(null);
      toast.success('Documento enviado com sucesso.');
    } catch {
      toast.error('Não foi possível enviar o documento.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteDocument = async (documentId: number) => {
    try {
      await staffService.deleteDocument(documentId);
      setDocuments((prev) => prev.filter((doc) => doc.id !== documentId));
      toast.success('Documento removido.');
    } catch {
      toast.error('Não foi possível remover o documento.');
    }
  };

  const daysSinceAdmission = useMemo(() => {
    if (!employee) return 0;
    return Math.floor((Date.now() - new Date(employee.data_admissao).getTime()) / (1000 * 60 * 60 * 24));
  }, [employee]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (hasError || !employee || !form) {
    return (
      <Card>
        <p className="text-sm text-muted">Não foi possível carregar este funcionário.</p>
        <Button variant="secondary" className="mt-4" onClick={() => navigate('/employees')}>
          Voltar para a lista
        </Button>
      </Card>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => navigate('/employees')}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Funcionários
      </button>

      <div className="mb-5 flex flex-wrap items-center gap-4">
        <Avatar name={employee.nome} size="md" />
        <div className="flex-1">
          <h2 className="font-display text-[21px] font-semibold text-ink">{employee.nome}</h2>
          <p className="text-sm text-muted">
            {employee.cargo} · {employee.setor}
          </p>
        </div>
        <StatusPill variant={STATUS_PILL[employee.status]} label={employee.status_display} />
      </div>

      <div className="mb-5 flex gap-1 border-b border-line">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={
              tab === item.id
                ? 'border-b-2 border-cyan px-3 pb-3 text-sm font-semibold text-cyan-700'
                : 'border-b-2 border-transparent px-3 pb-3 text-sm font-medium text-muted hover:text-ink'
            }
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === 'dados' && (
        <Card
          title="Dados do funcionário"
          subtitle={
            !isEditing ? (
              <Button variant="secondary" className="!py-1.5 !px-3 text-xs" onClick={startEdit}>
                <PencilIcon className="h-3.5 w-3.5" />
                Editar
              </Button>
            ) : undefined
          }
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Nome completo" value={form.nome} disabled={!isEditing} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
            <Input label="Cargo" value={form.cargo} disabled={!isEditing} onChange={(e) => setForm({ ...form, cargo: e.target.value })} />
            <Input label="Setor" value={form.setor} disabled={!isEditing} onChange={(e) => setForm({ ...form, setor: e.target.value })} />
            <Select
              label="Status"
              value={form.status}
              disabled={!isEditing}
              onChange={(e) => setForm({ ...form, status: e.target.value as EmployeeStatus })}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
            <Input
              label="Data de admissão"
              type="date"
              value={form.data_admissao}
              disabled={!isEditing}
              onChange={(e) => setForm({ ...form, data_admissao: e.target.value })}
            />
            <Input
              label="Salário"
              type="number"
              step="0.01"
              value={form.salario}
              disabled={!isEditing}
              onChange={(e) => setForm({ ...form, salario: e.target.value })}
            />
            <Input label="CPF" value={form.cpf} disabled={!isEditing} onChange={(e) => setForm({ ...form, cpf: e.target.value })} />
            <Input label="RG" value={form.rg} disabled={!isEditing} onChange={(e) => setForm({ ...form, rg: e.target.value })} />
            <Input
              label="Data de nascimento"
              type="date"
              value={form.data_nascimento}
              disabled={!isEditing}
              onChange={(e) => setForm({ ...form, data_nascimento: e.target.value })}
            />
            <Input label="Telefone" value={form.telefone} disabled={!isEditing} onChange={(e) => setForm({ ...form, telefone: e.target.value })} />
            <Input
              label="Endereço"
              className="sm:col-span-2"
              value={form.endereco}
              disabled={!isEditing}
              onChange={(e) => setForm({ ...form, endereco: e.target.value })}
            />
            <Input
              label="Observações"
              className="sm:col-span-2"
              value={form.observacoes || ''}
              disabled={!isEditing}
              onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
            />
          </div>

          {isEditing && (
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="secondary" onClick={cancelEdit} disabled={isSaving}>
                Cancelar
              </Button>
              <Button onClick={handleSave} isLoading={isSaving}>
                Salvar alterações
              </Button>
            </div>
          )}
        </Card>
      )}

      {tab === 'documentos' && (
        <Card title="Documentos">
          <div className="mb-5 grid grid-cols-1 gap-3 rounded-xl border border-dashed border-line p-4 sm:grid-cols-[180px_1fr_1fr_auto]">
            <Select value={uploadTipo} onChange={(e) => setUploadTipo(e.target.value)}>
              {DOCUMENT_TYPES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
            <Input placeholder="Nome do documento" value={uploadNome} onChange={(e) => setUploadNome(e.target.value)} />
            <input
              type="file"
              onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
              className="text-sm text-muted file:mr-3 file:rounded-[10px] file:border-0 file:bg-surface-2 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-ink"
            />
            <Button onClick={handleUpload} isLoading={isUploading}>
              <ArrowUpTrayIcon className="h-4 w-4" />
              Enviar
            </Button>
          </div>

          {documents.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted">Nenhum documento enviado ainda.</p>
          ) : (
            <TableContainer>
              <thead>
                <tr>
                  <Th>Documento</Th>
                  <Th>Tipo</Th>
                  <Th>Enviado por</Th>
                  <Th>Data</Th>
                  <Th></Th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <Tr key={doc.id}>
                    <Td>
                      <a href={doc.arquivo} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-cyan-700 hover:underline">
                        <DocumentIcon className="h-4 w-4" />
                        {doc.nome}
                      </a>
                    </Td>
                    <Td>{doc.tipo_display}</Td>
                    <Td>{doc.uploaded_by_name || 'Sistema'}</Td>
                    <Td className="font-mono">{formatDate(doc.created_at)}</Td>
                    <Td>
                      <button
                        type="button"
                        onClick={() => handleDeleteDocument(doc.id)}
                        className="text-muted hover:text-danger"
                        aria-label="Remover documento"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </TableContainer>
          )}
        </Card>
      )}

      {tab === 'historico' && (
        <Card title="Histórico">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[.09em] text-muted">Admissão</div>
              <div className="mt-1 text-sm text-ink">
                {formatDate(employee.data_admissao)} · {daysSinceAdmission} dias de casa
              </div>
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[.09em] text-muted">Status atual</div>
              <div className="mt-1">
                <StatusPill variant={STATUS_PILL[employee.status]} label={employee.status_display} />
              </div>
            </div>
            {employee.data_demissao && (
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[.09em] text-muted">Data de desligamento</div>
                <div className="mt-1 text-sm text-ink">{formatDate(employee.data_demissao)}</div>
              </div>
            )}
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[.09em] text-muted">Registro criado em</div>
              <div className="mt-1 text-sm text-ink">{formatDate(employee.created_at, 'dd/MM/yyyy HH:mm')}</div>
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[.09em] text-muted">Última atualização</div>
              <div className="mt-1 text-sm text-ink">{formatDate(employee.updated_at, 'dd/MM/yyyy HH:mm')}</div>
            </div>
          </div>
        </Card>
      )}

      {tab === 'avaliacoes' && (
        <Card title="Avaliações">
          {evaluations === null ? (
            <div className="flex justify-center py-10">
              <LoadingSpinner />
            </div>
          ) : evaluations.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted">Nenhuma avaliação registrada para este funcionário.</p>
          ) : (
            <TableContainer>
              <thead>
                <tr>
                  <Th>Período</Th>
                  <Th>Nota final</Th>
                  <Th>Status</Th>
                </tr>
              </thead>
              <tbody>
                {evaluations.map((evaluation) => (
                  <Tr key={evaluation.id}>
                    <Td className="font-mono">
                      {formatDate(evaluation.periodo_inicio, 'dd/MM/yyyy')} a {formatDate(evaluation.periodo_fim, 'dd/MM/yyyy')}
                    </Td>
                    <Td className="font-mono">{evaluation.nota_final ?? 'Em aberto'}</Td>
                    <Td>
                      <StatusPill
                        variant={EVALUATION_PILL[evaluation.status] ?? 'pend'}
                        label={evaluation.status_display}
                      />
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </TableContainer>
          )}
        </Card>
      )}

      {tab === 'ferias' && (
        <Card title="Férias e afastamentos">
          {leaves === null ? (
            <div className="flex justify-center py-10">
              <LoadingSpinner />
            </div>
          ) : leaves.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted">Nenhuma solicitação registrada para este funcionário.</p>
          ) : (
            <TableContainer>
              <thead>
                <tr>
                  <Th>Tipo</Th>
                  <Th>Período</Th>
                  <Th>Dias</Th>
                  <Th>Status</Th>
                </tr>
              </thead>
              <tbody>
                {leaves.map((leave) => (
                  <Tr key={leave.id}>
                    <Td>{leave.tipo_name}</Td>
                    <Td className="font-mono">
                      {formatDate(leave.data_inicio, 'dd/MM/yyyy')} a {formatDate(leave.data_fim, 'dd/MM/yyyy')}
                    </Td>
                    <Td className="font-mono">{leave.dias_solicitados}</Td>
                    <Td>
                      <StatusPill variant={LEAVE_PILL[leave.status] ?? 'pend'} label={leave.status_display} />
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </TableContainer>
          )}
        </Card>
      )}
    </div>
  );
};

export default EmployeeDetail;
