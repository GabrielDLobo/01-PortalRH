import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import { admissionService } from '../../services/admissionService';
import {
  ACCOUNT_TYPE_OPTIONS,
  EDUCATION_LEVEL_OPTIONS,
  EmployeeAdmissionDocument,
  EmployeeAdmissionProfile,
  EmployeeAdmissionWriteRequest,
  MARITAL_STATUS_OPTIONS,
  REQUIRED_DOCUMENT_TYPES,
} from '../../types/admission';
import { Button, Card, Input, Select, CEPInput, StatusPill } from '../../components/ui';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const STEPS = ['Dados pessoais', 'Endereço', 'Bancário e CLT', 'Documentos'];

const emptyForm: EmployeeAdmissionWriteRequest = {
  full_name: '',
  cpf: '',
  rg: '',
  birth_date: '',
  marital_status: '',
  phone: '',
  education_level: '',
  street_address: '',
  address_number: '',
  address_complement: '',
  neighborhood: '',
  city: '',
  state: '',
  zip_code: '',
  pis_pasep: '',
  work_card_number: '',
  work_card_series: '',
  bank_name: '',
  bank_code: '',
  agency_number: '',
  account_number: '',
  account_type: 'checking',
};

function isFilled(value?: string | null): boolean {
  return !!value && value.trim().length > 0;
}

export default function SelfServiceWizard() {
  const [isLoading, setIsLoading] = useState(true);
  const [employee, setEmployee] = useState<EmployeeAdmissionProfile | null>(null);
  const [form, setForm] = useState<EmployeeAdmissionWriteRequest>(emptyForm);
  const [step, setStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [documents, setDocuments] = useState<EmployeeAdmissionDocument[]>([]);
  const [uploadingType, setUploadingType] = useState<string | null>(null);

  useEffect(() => {
    admissionService
      .getMyProfile()
      .then((data) => {
        setEmployee(data);
        const sanitized = Object.fromEntries(
          Object.keys(emptyForm).map((key) => [key, (data as any)[key] ?? ''])
        ) as EmployeeAdmissionWriteRequest;
        setForm(sanitized);
        setDocuments(data.documents);
      })
      .catch(() => setEmployee(null))
      .finally(() => setIsLoading(false));
  }, []);

  const update = (field: keyof EmployeeAdmissionWriteRequest, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const validateStep = (index: number): boolean => {
    if (index === 0) {
      return ['full_name', 'cpf', 'rg', 'birth_date', 'marital_status', 'phone', 'education_level'].every((key) =>
        isFilled(form[key as keyof EmployeeAdmissionWriteRequest])
      );
    }
    if (index === 1) {
      return ['street_address', 'address_number', 'neighborhood', 'city', 'state', 'zip_code'].every((key) =>
        isFilled(form[key as keyof EmployeeAdmissionWriteRequest])
      );
    }
    if (index === 2) {
      return ['work_card_number', 'work_card_series', 'pis_pasep', 'bank_name', 'bank_code', 'agency_number', 'account_number'].every(
        (key) => isFilled(form[key as keyof EmployeeAdmissionWriteRequest])
      );
    }
    return true;
  };

  const persist = async () => {
    try {
      setIsSaving(true);
      if (employee) {
        const updated = await admissionService.updateProfile(employee.id, form);
        setEmployee(updated);
      } else {
        const created = await admissionService.createProfile(form);
        setEmployee(created);
        setDocuments(created.documents);
      }
      return true;
    } catch (error: any) {
      const detail = error.response?.data?.detail || 'Não foi possível salvar. Confira os campos e tente novamente.';
      toast.error(typeof detail === 'string' ? detail : 'Não foi possível salvar os dados.');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const goNext = async () => {
    if (!validateStep(step)) {
      toast.error('Preencha todos os campos obrigatórios desta etapa.');
      return;
    }
    const saved = await persist();
    if (saved) setStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  };

  const handleDocumentUpload = async (documentType: string, file: File, required: boolean) => {
    if (!employee) {
      toast.error('Salve seus dados pessoais antes de enviar documentos.');
      return;
    }
    try {
      setUploadingType(documentType);
      const uploaded = await admissionService.uploadDocument(employee.id, {
        document_type: documentType,
        document_name: file.name,
        file,
        is_required: required,
      });
      setDocuments((prev) => [uploaded, ...prev.filter((doc) => doc.document_type !== documentType)]);
      toast.success('Documento enviado.');
    } catch {
      toast.error('Não foi possível enviar o documento.');
    } finally {
      setUploadingType(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (employee?.admission_completed) {
    return (
      <Card title="Admissão concluída">
        <div className="flex items-start gap-3 rounded-xl bg-success/10 p-4">
          <CheckCircleIcon className="h-6 w-6 flex-none text-success" />
          <div>
            <p className="font-semibold text-ink">Seu cadastro está completo.</p>
            <p className="mt-1 text-sm text-muted">
              Seus dados pessoais, endereço, informações bancárias e documentos já foram enviados e aprovados pelo RH.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  const requiredDocsMissing = REQUIRED_DOCUMENT_TYPES.filter(
    (docType) => docType.required && !documents.some((doc) => doc.document_type === docType.value)
  );

  return (
    <div>
      <Card title="Complete sua admissão" subtitle={`Etapa ${step + 1} de ${STEPS.length}`}>
        <div className="mb-6 flex gap-2">
          {STEPS.map((label, index) => (
            <div key={label} className="flex-1">
              <div className={`h-1.5 rounded-full ${index <= step ? 'bg-cyan' : 'bg-line-2'}`} />
              <span className={`mt-1.5 block text-[11px] font-medium ${index === step ? 'text-cyan-700' : 'text-muted'}`}>
                {label}
              </span>
            </div>
          ))}
        </div>

        {step === 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Nome completo" value={form.full_name} onChange={(e) => update('full_name', e.target.value)} />
            <Input label="Telefone" value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="(11) 91234-5678" />
            <Input label="CPF" value={form.cpf} onChange={(e) => update('cpf', e.target.value)} placeholder="000.000.000-00" />
            <Input label="RG" value={form.rg} onChange={(e) => update('rg', e.target.value)} />
            <Input label="Data de nascimento" type="date" value={form.birth_date} onChange={(e) => update('birth_date', e.target.value)} />
            <Select label="Estado civil" value={form.marital_status} onChange={(e) => update('marital_status', e.target.value)}>
              <option value="">Selecione</option>
              {MARITAL_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
            <Select
              label="Escolaridade"
              className="sm:col-span-2"
              value={form.education_level}
              onChange={(e) => update('education_level', e.target.value)}
            >
              <option value="">Selecione</option>
              {EDUCATION_LEVEL_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
        )}

        {step === 1 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <CEPInput
                value={form.zip_code || ''}
                onChange={(value) => update('zip_code', value)}
                onAddressFound={(address) =>
                  setForm((prev) => ({
                    ...prev,
                    zip_code: address.zip_code,
                    street_address: address.street_address,
                    neighborhood: address.neighborhood,
                    city: address.city,
                    state: address.state,
                    address_complement: address.complement || prev.address_complement,
                  }))
                }
              />
            </div>
            <Input label="Endereço" value={form.street_address} onChange={(e) => update('street_address', e.target.value)} />
            <Input label="Número" value={form.address_number} onChange={(e) => update('address_number', e.target.value)} />
            <Input
              label="Complemento"
              value={form.address_complement}
              onChange={(e) => update('address_complement', e.target.value)}
            />
            <Input label="Bairro" value={form.neighborhood} onChange={(e) => update('neighborhood', e.target.value)} />
            <Input label="Cidade" value={form.city} onChange={(e) => update('city', e.target.value)} />
            <Input label="Estado" value={form.state} maxLength={2} onChange={(e) => update('state', e.target.value.toUpperCase())} />
          </div>
        )}

        {step === 2 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="PIS/PASEP" value={form.pis_pasep} onChange={(e) => update('pis_pasep', e.target.value)} />
            <div />
            <Input
              label="Número da CTPS"
              value={form.work_card_number}
              onChange={(e) => update('work_card_number', e.target.value)}
            />
            <Input
              label="Série da CTPS"
              value={form.work_card_series}
              onChange={(e) => update('work_card_series', e.target.value)}
            />
            <Input label="Banco" value={form.bank_name} onChange={(e) => update('bank_name', e.target.value)} />
            <Input label="Código do banco" value={form.bank_code} onChange={(e) => update('bank_code', e.target.value)} />
            <Input label="Agência" value={form.agency_number} onChange={(e) => update('agency_number', e.target.value)} />
            <Input label="Conta" value={form.account_number} onChange={(e) => update('account_number', e.target.value)} />
            <Select label="Tipo de conta" value={form.account_type} onChange={(e) => update('account_type', e.target.value)}>
              {ACCOUNT_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
        )}

        {step === 3 && (
          <div>
            <p className="mb-4 text-sm text-muted">
              Envie os documentos abaixo. Os marcados como obrigatórios precisam estar presentes antes da análise do RH.
            </p>
            <div className="flex flex-col gap-3">
              {REQUIRED_DOCUMENT_TYPES.map((docType) => {
                const uploaded = documents.find((doc) => doc.document_type === docType.value);
                return (
                  <div
                    key={docType.value}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line p-3.5"
                  >
                    <div>
                      <p className="text-sm font-medium text-ink">
                        {docType.label}
                        {docType.required && <span className="ml-1.5 text-danger">*</span>}
                      </p>
                      {uploaded && <p className="text-xs text-muted">{uploaded.document_name}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      {uploaded ? (
                        <StatusPill variant="ok" label="Enviado" />
                      ) : (
                        <StatusPill variant={docType.required ? 'rej' : 'pend'} label="Pendente" />
                      )}
                      <label className="cursor-pointer rounded-[10px] bg-surface-2 px-3 py-2 text-xs font-semibold text-ink hover:bg-line-2">
                        {uploadingType === docType.value ? 'Enviando...' : uploaded ? 'Substituir' : 'Enviar'}
                        <input
                          type="file"
                          className="hidden"
                          disabled={uploadingType === docType.value}
                          onChange={(event) => {
                            const file = event.target.files?.[0];
                            if (file) handleDocumentUpload(docType.value, file, docType.required);
                            event.target.value = '';
                          }}
                        />
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>

            {requiredDocsMissing.length === 0 ? (
              <div className="mt-5 flex items-center gap-2 rounded-xl bg-success/10 p-4 text-sm text-[#047857]">
                <CheckCircleIcon className="h-5 w-5" />
                Todos os documentos obrigatórios foram enviados. Seu cadastro está com o RH para análise.
              </div>
            ) : (
              <div className="mt-5 flex items-center gap-2 rounded-xl bg-warning/10 p-4 text-sm text-[#B45309]">
                <ClockIcon className="h-5 w-5" />
                Faltam {requiredDocsMissing.length} documento{requiredDocsMissing.length === 1 ? '' : 's'} obrigatório
                {requiredDocsMissing.length === 1 ? '' : 's'}.
              </div>
            )}
          </div>
        )}

        <div className="mt-6 flex justify-between">
          <Button variant="secondary" disabled={step === 0 || isSaving} onClick={() => setStep((prev) => prev - 1)}>
            Voltar
          </Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={goNext} isLoading={isSaving}>
              Salvar e continuar
            </Button>
          ) : (
            <Button onClick={persist} isLoading={isSaving}>
              Salvar
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
