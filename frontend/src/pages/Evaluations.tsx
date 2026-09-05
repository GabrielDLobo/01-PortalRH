import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { PlusIcon, TrophyIcon } from '@heroicons/react/24/outline';
import { performanceEvaluationService } from '../services/performanceEvaluationService';
import { staffService } from '../services/staffService';
import {
  CreateEvaluationRequest,
  EvaluationDetail,
  EvaluationListItem,
  EvaluationTemplate,
  EvaluationType,
} from '../types/performanceEvaluation';
import { StaffEmployeeListItem } from '../types/staff';
import { Button, Card, Input, Modal, Select, StatusPill, TableContainer, Th, Td, Tr } from '../components/ui';
import type { PillVariant } from '../components/ui';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatDate } from '../utils/formatters';

const STATUS_PILL: Record<string, PillVariant> = {
  concluida: 'ok',
  aprovada: 'ok',
  em_andamento: 'pend',
  pendente: 'pend',
  rascunho: 'pend',
  rejeitada: 'rej',
};

const TYPE_OPTIONS: { value: EvaluationType; label: string }[] = [
  { value: 'avaliacao_superior', label: 'Avaliação do Superior' },
  { value: 'auto_avaliacao', label: 'Auto-avaliação' },
  { value: 'avaliacao_360', label: 'Avaliação 360°' },
  { value: 'avaliacao_pares', label: 'Avaliação de Pares' },
];

const emptyForm: CreateEvaluationRequest = {
  template: 0,
  avaliado: 0,
  tipo: 'avaliacao_superior',
  periodo_inicio: '',
  periodo_fim: '',
};

const Evaluations: React.FC = () => {
  const [evaluations, setEvaluations] = useState<EvaluationListItem[]>([]);
  const [templates, setTemplates] = useState<EvaluationTemplate[]>([]);
  const [employees, setEmployees] = useState<StaffEmployeeListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<CreateEvaluationRequest>(emptyForm);
  const [isSaving, setIsSaving] = useState(false);

  const [scoring, setScoring] = useState<EvaluationDetail | null>(null);
  const [scores, setScores] = useState<Record<number, string>>({});
  const [isFinalizing, setIsFinalizing] = useState(false);

  const load = () => {
    setIsLoading(true);
    performanceEvaluationService
      .getEvaluations({ ordering: '-created_at' })
      .then((res) => setEvaluations(res.results))
      .catch(() => toast.error('Não foi possível carregar as avaliações.'))
      .finally(() => setIsLoading(false));
  };

  useEffect(load, []);

  useEffect(() => {
    performanceEvaluationService
      .getTemplates()
      .then((res) => setTemplates(res.results))
      .catch(() => undefined);
    staffService
      .getEmployees()
      .then((res) => setEmployees(res.results))
      .catch(() => undefined);
  }, []);

  const handleCreate = async () => {
    if (!form.template || !form.avaliado || !form.periodo_inicio || !form.periodo_fim) {
      toast.error('Preencha template, avaliado e o período.');
      return;
    }
    try {
      setIsSaving(true);
      await performanceEvaluationService.createEvaluation(form);
      toast.success('Avaliação criada.');
      setShowCreate(false);
      setForm(emptyForm);
      load();
    } catch (error: any) {
      const detail = error.response?.data?.periodo_fim?.[0] || 'Não foi possível criar a avaliação.';
      toast.error(detail);
    } finally {
      setIsSaving(false);
    }
  };

  const openScoring = async (evaluation: EvaluationListItem) => {
    try {
      const detail = await performanceEvaluationService.getEvaluation(evaluation.id);
      setScoring(detail);
      const initial: Record<number, string> = {};
      detail.scores.forEach((score) => {
        initial[score.criterio] = score.nota;
      });
      setScores(initial);
    } catch {
      toast.error('Não foi possível abrir a avaliação.');
    }
  };

  const handleSaveScores = async () => {
    if (!scoring) return;
    const criteria = scoring.template_info.criteria;
    const missing = criteria.some((criterio) => !scores[criterio.id]);
    if (missing) {
      toast.error('Preencha a nota de todos os critérios.');
      return;
    }
    try {
      setIsFinalizing(true);
      const alreadyScored = new Set(scoring.scores.map((score) => score.criterio));
      await Promise.all(
        criteria
          .filter((criterio) => !alreadyScored.has(criterio.id))
          .map((criterio) => performanceEvaluationService.addScore(scoring.id, criterio.id, Number(scores[criterio.id])))
      );
      const result = await performanceEvaluationService.finalize(scoring.id);
      toast.success(`Avaliação finalizada. Nota final: ${result.nota_final}`);
      setScoring(null);
      load();
    } catch (error: any) {
      const detail = error.response?.data?.detail || error.response?.data?.non_field_errors?.[0] || 'Não foi possível finalizar a avaliação.';
      toast.error(detail);
    } finally {
      setIsFinalizing(false);
    }
  };

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-[23px] font-semibold text-ink">Avaliações</h2>
          <p className="mt-[5px] text-sm text-muted">Ciclo de avaliação de desempenho.</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <PlusIcon className="h-4 w-4" />
          Nova avaliação
        </Button>
      </div>

      <Card bodyClassName="p-0">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner size="lg" />
          </div>
        ) : evaluations.length === 0 ? (
          <div className="px-[18px] py-16 text-center text-sm text-muted">Nenhuma avaliação criada ainda.</div>
        ) : (
          <TableContainer>
            <thead>
              <tr>
                <Th>Avaliado</Th>
                <Th>Tipo</Th>
                <Th>Período</Th>
                <Th>Nota final</Th>
                <Th>Status</Th>
                <Th></Th>
              </tr>
            </thead>
            <tbody>
              {evaluations.map((item) => (
                <Tr key={item.id}>
                  <Td>{item.avaliado_name}</Td>
                  <Td>{item.tipo_display}</Td>
                  <Td className="font-mono">
                    {formatDate(item.periodo_inicio)} a {formatDate(item.periodo_fim)}
                  </Td>
                  <Td className="font-mono">{item.nota_final ?? '—'}</Td>
                  <Td>
                    <StatusPill variant={STATUS_PILL[item.status] ?? 'pend'} label={item.status_display} />
                  </Td>
                  <Td>
                    {!item.is_completed && (
                      <button
                        type="button"
                        onClick={() => openScoring(item)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-700 hover:underline"
                      >
                        <TrophyIcon className="h-3.5 w-3.5" />
                        Avaliar
                      </button>
                    )}
                  </Td>
                </Tr>
              ))}
            </tbody>
          </TableContainer>
        )}
      </Card>

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Nova avaliação">
        <div className="grid grid-cols-1 gap-4">
          <Select
            label="Template"
            value={form.template}
            onChange={(e) => setForm({ ...form, template: Number(e.target.value) })}
          >
            <option value={0}>Selecione</option>
            {templates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.nome}
              </option>
            ))}
          </Select>
          <Select
            label="Avaliado"
            value={form.avaliado}
            onChange={(e) => setForm({ ...form, avaliado: Number(e.target.value) })}
          >
            <option value={0}>Selecione</option>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.user}>
                {employee.nome}
              </option>
            ))}
          </Select>
          <Select label="Tipo" value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value as EvaluationType })}>
            {TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
          <Input
            label="Início do período"
            type="date"
            value={form.periodo_inicio}
            onChange={(e) => setForm({ ...form, periodo_inicio: e.target.value })}
          />
          <Input
            label="Fim do período"
            type="date"
            value={form.periodo_fim}
            onChange={(e) => setForm({ ...form, periodo_fim: e.target.value })}
          />
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setShowCreate(false)} disabled={isSaving}>
            Cancelar
          </Button>
          <Button onClick={handleCreate} isLoading={isSaving}>
            Criar avaliação
          </Button>
        </div>
      </Modal>

      <Modal isOpen={!!scoring} onClose={() => setScoring(null)} title="Preencher avaliação" size="lg">
        {scoring && (
          <>
            <p className="mb-4 text-sm text-muted">
              {scoring.avaliado_info.first_name} {scoring.avaliado_info.last_name} · {scoring.template_info.nome}
            </p>
            <div className="flex flex-col gap-3">
              {scoring.template_info.criteria.map((criterio) => (
                <div key={criterio.id} className="grid grid-cols-[1fr_120px] items-center gap-3">
                  <span className="text-sm text-ink">{criterio.nome}</span>
                  <Input
                    type="number"
                    min={0}
                    max={10}
                    step="0.1"
                    value={scores[criterio.id] || ''}
                    onChange={(e) => setScores({ ...scores, [criterio.id]: e.target.value })}
                  />
                </div>
              ))}
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setScoring(null)} disabled={isFinalizing}>
                Cancelar
              </Button>
              <Button onClick={handleSaveScores} isLoading={isFinalizing}>
                Salvar e finalizar
              </Button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default Evaluations;
