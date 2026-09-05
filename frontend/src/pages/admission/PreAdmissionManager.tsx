import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { KeyIcon, PaperAirplaneIcon, PlusIcon } from '@heroicons/react/24/outline';
import { admissionService } from '../../services/admissionService';
import {
  CONTRACT_TYPES,
  CreateEmployeeAccountResponse,
  PreAdmission,
  PreAdmissionWriteRequest,
  WORKLOAD_OPTIONS,
} from '../../types/admission';
import { Button, Card, Input, Select, StatusPill, TableContainer, Th, Td, Tr } from '../../components/ui';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate } from '../../utils/formatters';

const emptyForm: PreAdmissionWriteRequest = {
  personal_email: '',
  full_name: '',
  position: '',
  department: '',
  job_description: '',
  work_schedule: '',
  weekly_workload: '40h',
  contract_type: 'clt',
  salary: '',
  benefits: '',
  start_date: '',
  vacation_policy: '',
  direct_manager: '',
};

export default function PreAdmissionManager() {
  const [preAdmissions, setPreAdmissions] = useState<PreAdmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<PreAdmissionWriteRequest>(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [credentials, setCredentials] = useState<CreateEmployeeAccountResponse | null>(null);

  const load = () => {
    setIsLoading(true);
    admissionService
      .getPreAdmissions()
      .then((res) => setPreAdmissions(res.results))
      .catch(() => toast.error('Não foi possível carregar as pré-admissões.'))
      .finally(() => setIsLoading(false));
  };

  useEffect(load, []);

  const update = (field: keyof PreAdmissionWriteRequest, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleCreate = async () => {
    if (!form.personal_email || !form.full_name || !form.position || !form.start_date || !form.salary) {
      toast.error('Preencha ao menos e-mail, nome, cargo, salário e data de início.');
      return;
    }
    try {
      setIsSaving(true);
      await admissionService.createPreAdmission(form);
      toast.success('Pré-admissão criada.');
      setForm(emptyForm);
      setShowForm(false);
      load();
    } catch (error: any) {
      const detail = error.response?.data?.personal_email?.[0] || 'Não foi possível criar a pré-admissão.';
      toast.error(detail);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateAccount = async (id: number) => {
    try {
      const result = await admissionService.createEmployeeAccount(id);
      setCredentials(result);
      toast.success(result.message);
      load();
    } catch {
      toast.error('Não foi possível criar a conta do funcionário.');
    }
  };

  const handleResendEmail = async (id: number) => {
    try {
      await admissionService.resendAdmissionEmail(id);
      toast.success('E-mail reenviado.');
      load();
    } catch {
      toast.error('Não foi possível reenviar o e-mail.');
    }
  };

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="font-display text-[23px] font-semibold text-ink">Admissão</h2>
          <p className="mt-[5px] text-sm text-muted">Crie o pré-cadastro e gere o acesso do novo funcionário.</p>
        </div>
        <Button onClick={() => setShowForm((prev) => !prev)}>
          <PlusIcon className="h-4 w-4" />
          Nova pré-admissão
        </Button>
      </div>

      {credentials && (
        <Card className="mb-5 border-cyan/30">
          <div className="flex items-start gap-3">
            <KeyIcon className="h-6 w-6 flex-none text-cyan-700" />
            <div>
              <p className="font-semibold text-ink">Conta criada. Compartilhe o acesso com o novo funcionário.</p>
              <p className="mt-1 text-sm text-muted">
                E-mail: <span className="font-mono text-ink">{credentials.login_email}</span>
              </p>
              {credentials.temporary_password && (
                <p className="text-sm text-muted">
                  Senha temporária: <span className="font-mono text-ink">{credentials.temporary_password}</span>
                </p>
              )}
              <p className="mt-1 text-xs text-muted">
                {credentials.email_sent ? 'Um e-mail com essas informações já foi enviado.' : 'O envio automático de e-mail falhou; compartilhe os dados manualmente.'}
              </p>
            </div>
          </div>
        </Card>
      )}

      {showForm && (
        <Card title="Nova pré-admissão" className="mb-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Nome completo" value={form.full_name} onChange={(e) => update('full_name', e.target.value)} />
            <Input
              label="E-mail pessoal"
              type="email"
              value={form.personal_email}
              onChange={(e) => update('personal_email', e.target.value)}
            />
            <Input label="Cargo" value={form.position} onChange={(e) => update('position', e.target.value)} />
            <Input label="Departamento" value={form.department} onChange={(e) => update('department', e.target.value)} />
            <Input label="Gestor direto" value={form.direct_manager} onChange={(e) => update('direct_manager', e.target.value)} />
            <Input label="Data de início" type="date" value={form.start_date} onChange={(e) => update('start_date', e.target.value)} />
            <Select label="Tipo de contrato" value={form.contract_type} onChange={(e) => update('contract_type', e.target.value)}>
              {CONTRACT_TYPES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
            <Select label="Jornada semanal" value={form.weekly_workload} onChange={(e) => update('weekly_workload', e.target.value)}>
              {WORKLOAD_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
            <Input label="Salário" type="number" step="0.01" value={form.salary} onChange={(e) => update('salary', e.target.value)} />
            <Input label="Horário de trabalho" value={form.work_schedule} onChange={(e) => update('work_schedule', e.target.value)} />
            <Input
              label="Descrição das atividades"
              className="sm:col-span-2"
              value={form.job_description}
              onChange={(e) => update('job_description', e.target.value)}
            />
            <Input
              label="Benefícios"
              className="sm:col-span-2"
              value={form.benefits}
              onChange={(e) => update('benefits', e.target.value)}
            />
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowForm(false)} disabled={isSaving}>
              Cancelar
            </Button>
            <Button onClick={handleCreate} isLoading={isSaving}>
              Criar pré-admissão
            </Button>
          </div>
        </Card>
      )}

      <Card bodyClassName="p-0">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner size="lg" />
          </div>
        ) : preAdmissions.length === 0 ? (
          <div className="px-[18px] py-16 text-center text-sm text-muted">Nenhuma pré-admissão criada ainda.</div>
        ) : (
          <TableContainer>
            <thead>
              <tr>
                <Th>Nome</Th>
                <Th>Cargo</Th>
                <Th>Início</Th>
                <Th>Status</Th>
                <Th></Th>
              </tr>
            </thead>
            <tbody>
              {preAdmissions.map((item) => (
                <Tr key={item.id}>
                  <Td>
                    {item.full_name}
                    <div className="text-[11.5px] text-muted">{item.personal_email}</div>
                  </Td>
                  <Td>{item.position}</Td>
                  <Td className="font-mono">{formatDate(item.start_date)}</Td>
                  <Td>
                    {item.employee_user_created ? (
                      <StatusPill variant="ok" label="Conta criada" />
                    ) : (
                      <StatusPill variant="pend" label="Aguardando conta" />
                    )}
                  </Td>
                  <Td>
                    {!item.employee_user_created ? (
                      <Button variant="secondary" className="!px-3 !py-1.5 text-xs" onClick={() => handleCreateAccount(item.id)}>
                        Criar conta
                      </Button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleResendEmail(item.id)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-700 hover:underline"
                      >
                        <PaperAirplaneIcon className="h-3.5 w-3.5" />
                        Reenviar e-mail
                      </button>
                    )}
                  </Td>
                </Tr>
              ))}
            </tbody>
          </TableContainer>
        )}
      </Card>
    </div>
  );
}
