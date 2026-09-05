import { Suspense, lazy, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

const LoginHero = lazy(() => import('../three/LoginHero'));

interface LoginFormData {
  email: string;
  password: string;
}

interface DemoAccount {
  role: string;
  email: string;
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  { role: 'RH', email: 'rh.demo@portalrh.com.br' },
  { role: 'Funcionário', email: 'demo@portalrh.com.br' },
];
const DEMO_PASSWORD = 'demo1234';

const darkInputClass =
  'w-full rounded-[11px] border border-[rgba(140,160,173,.25)] bg-[rgba(4,7,13,.6)] px-3.5 py-[11px] text-sm text-[#EAF2F6] ' +
  'focus:border-cyan focus:outline-none focus:ring-[3px] focus:ring-cyan/[0.16]';

const LoginForm: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    defaultValues: { email: 'rh.demo@portalrh.com.br', password: DEMO_PASSWORD },
  });

  const doLogin = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      await login(email, password);
      navigate('/');
    } catch (error: any) {
      const message = error.response?.data?.detail || 'E-mail ou senha inválidos.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = (data: LoginFormData) => doLogin(data.email, data.password);

  const quickAccess = (email: string) => {
    setValue('email', email);
    setValue('password', DEMO_PASSWORD);
    doLogin(email, DEMO_PASSWORD);
  };

  return (
    <div className="fixed inset-0 overflow-hidden bg-dark">
      <Suspense fallback={null}>
        <LoginHero />
      </Suspense>
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(60% 50% at 50% 42%, rgba(34,211,238,.16), transparent 70%)' }}
      />

      <div className="relative flex h-full items-center justify-center p-6">
        <div className="w-full max-w-[410px] rounded-[20px] border border-cyan/[0.22] bg-[rgba(10,15,26,.62)] p-8 text-[#EAF2F6] shadow-[0_24px_70px_rgba(0,0,0,.55)] backdrop-blur-[14px]">
          <div className="mb-1 flex items-center gap-[11px]">
            <span className="grid h-[34px] w-[34px] flex-none place-items-center rounded-[9px] bg-gradient-to-br from-cyan to-violet shadow-[0_0_18px_rgba(34,211,238,.5)]">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="#04070D"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-[19px] w-[19px]"
                aria-hidden="true"
              >
                <path d="M4 20v-1a5 5 0 0 1 5-5h1" />
                <circle cx="10.5" cy="7.5" r="3.5" />
                <path d="M15 12l2.2 2.2L21 10.4" />
              </svg>
            </span>
            <span className="font-display text-xl font-bold tracking-[-.02em]">
              Portal<b className="text-cyan">RH</b>
            </span>
          </div>
          <p className="mb-[26px] mt-0.5 text-[13px] text-[#8CA0AD]">
            Gestão de pessoas, admissão, férias e avaliações.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="mb-3.5">
              <label
                htmlFor="login-email"
                className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[.09em] text-[#7F93A0]"
              >
                E-mail
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="username"
                className={darkInputClass}
                {...register('email', { required: 'Informe o e-mail.' })}
              />
              {errors.email && <p className="mt-1.5 text-xs text-[#FF9E7A]">{errors.email.message}</p>}
            </div>

            <div className="mb-3.5">
              <label
                htmlFor="login-password"
                className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[.09em] text-[#7F93A0]"
              >
                Senha
              </label>
              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                className={darkInputClass}
                {...register('password', { required: 'Informe a senha.' })}
              />
              {errors.password && <p className="mt-1.5 text-xs text-[#FF9E7A]">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-1.5 w-full rounded-[11px] bg-gradient-to-br from-cyan to-cyan-600 py-3 text-sm font-semibold text-dark shadow-[0_8px_22px_rgba(34,211,238,.28)] transition hover:-translate-y-px hover:shadow-[0_10px_28px_rgba(34,211,238,.4)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? 'Entrando...' : 'Entrar no sistema'}
            </button>
          </form>

          <div className="mt-[22px] rounded-[13px] border border-dashed border-cyan/30 bg-cyan/5 p-[15px]">
            <span className="mb-[9px] inline-flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[.08em] text-cyan">
              <i
                className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan shadow-[0_0_8px_#22D3EE]"
                aria-hidden="true"
              />
              Ambiente de demonstração
            </span>
            <p className="mb-3 text-xs leading-relaxed text-[#9DB1BD]">
              Dados fictícios, reiniciados periodicamente. Escolha um perfil para explorar:
            </p>
            <div className="flex flex-col gap-2">
              {DEMO_ACCOUNTS.map((account) => (
                <button
                  key={account.email}
                  type="button"
                  disabled={isLoading}
                  onClick={() => quickAccess(account.email)}
                  className="flex items-center justify-between gap-2.5 rounded-[10px] border border-[rgba(140,160,173,.2)] bg-[rgba(4,7,13,.5)] px-3 py-[9px] text-left text-[13px] text-[#DCE7ED] transition hover:border-cyan hover:bg-cyan/[0.08] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="whitespace-nowrap font-semibold">Entrar como {account.role}</span>
                  <span className="whitespace-nowrap font-mono text-[11px] text-[#7F93A0]">{account.email}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
