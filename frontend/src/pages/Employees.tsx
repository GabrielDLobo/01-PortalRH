import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MagnifyingGlassIcon, UserPlusIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { staffService } from '../services/staffService';
import { Department, EmployeeStatus, StaffEmployeeListItem } from '../types/staff';
import {
  Avatar,
  Button,
  Card,
  Input,
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

const PAGE_SIZE = 20;

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

const Employees: React.FC = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<StaffEmployeeListItem[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [setor, setSetor] = useState('');
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    staffService
      .getDepartments()
      .then((res) => setDepartments(res.results))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setHasError(false);

    const timeout = setTimeout(() => {
      staffService
        .getEmployees({
          page,
          search: search || undefined,
          setor: setor || undefined,
          status: status || undefined,
          ordering: 'nome',
        })
        .then((res) => {
          if (!active) return;
          setEmployees(res.results);
          setTotalItems(res.count);
        })
        .catch((error) => {
          if (!active) return;
          setHasError(true);
          toast.error('Não foi possível carregar os funcionários.');
          console.error('Falha ao carregar funcionários', error);
        })
        .finally(() => {
          if (active) setIsLoading(false);
        });
    }, 300);

    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [page, search, setor, status]);

  const pageCount = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));

  return (
    <div>
      <div className="mb-[18px] flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-[23px] font-semibold text-ink">Funcionários</h2>
          <p className="mt-[5px] text-sm text-muted">
            {totalItems} funcionário{totalItems === 1 ? '' : 's'} cadastrado{totalItems === 1 ? '' : 's'}.
          </p>
        </div>
        <Button onClick={() => navigate('/admission')}>
          <UserPlusIcon className="h-4 w-4" />
          Nova admissão
        </Button>
      </div>

      <Card
        bodyClassName="p-0"
        className="mb-5"
      >
        <div className="grid grid-cols-1 gap-3 p-[18px] sm:grid-cols-[1fr_200px_160px]">
          <Input
            icon={<MagnifyingGlassIcon />}
            placeholder="Buscar por nome, CPF, cargo ou e-mail"
            value={search}
            onChange={(event) => {
              setPage(1);
              setSearch(event.target.value);
            }}
          />
          <Select
            value={setor}
            onChange={(event) => {
              setPage(1);
              setSetor(event.target.value);
            }}
          >
            <option value="">Todos os setores</option>
            {departments.map((department) => (
              <option key={department.id} value={department.nome}>
                {department.nome}
              </option>
            ))}
          </Select>
          <Select
            value={status}
            onChange={(event) => {
              setPage(1);
              setStatus(event.target.value);
            }}
          >
            <option value="">Todos os status</option>
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <LoadingSpinner size="lg" />
          </div>
        ) : hasError ? (
          <div className="px-[18px] py-16 text-center text-sm text-muted">
            Não foi possível carregar os funcionários. Tente novamente em instantes.
          </div>
        ) : employees.length === 0 ? (
          <div className="px-[18px] py-16 text-center text-sm text-muted">
            Nenhum funcionário encontrado com esses filtros.
          </div>
        ) : (
          <>
            <TableContainer>
              <thead>
                <tr>
                  <Th>Funcionário</Th>
                  <Th>Setor</Th>
                  <Th>Admissão</Th>
                  <Th>Tempo de casa</Th>
                  <Th>Status</Th>
                </tr>
              </thead>
              <tbody>
                {employees.map((employee) => (
                  <Tr key={employee.id}>
                    <Td className="cursor-pointer" onClick={() => navigate(`/employees/${employee.id}`)}>
                      <div className="flex items-center gap-2.5">
                        <Avatar name={employee.nome} />
                        <div>
                          {employee.nome}
                          <div className="text-[11.5px] text-muted">{employee.cargo}</div>
                        </div>
                      </div>
                    </Td>
                    <Td>{employee.setor}</Td>
                    <Td className="font-mono">
                      {new Date(employee.data_admissao).toLocaleDateString('pt-BR')}
                    </Td>
                    <Td className="font-mono">
                      {employee.years_of_service} ano{employee.years_of_service === 1 ? '' : 's'}
                    </Td>
                    <Td>
                      <StatusPill variant={STATUS_PILL[employee.status]} label={employee.status_display} />
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </TableContainer>
            <Pagination page={page} pageCount={pageCount} totalItems={totalItems} pageSize={PAGE_SIZE} onPageChange={setPage} />
          </>
        )}
      </Card>
    </div>
  );
};

export default Employees;
