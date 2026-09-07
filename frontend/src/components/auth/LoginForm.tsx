import { Suspense, lazy, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { CheckIcon } from '@heroicons/react/24/solid';
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

const FEATURES = [
  'Fluxo completo de admissão e onboarding',
  'Férias e avaliações com aprovação em um clique',
  'Relatórios prontos para exportar',
];

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
    <div className="fixed inset-0 overflow-y-auto overflow-x-hidden bg-dark">
      <Suspense fallback={null}>
        <LoginHero />
      </Suspense>
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(55% 45% at 50% 42%, rgba(34,211,238,.14), transparent 70%)' }}
      />

      <div className="relative mx-auto grid min-h-full max-w-[1120px] items-center gap-12 px-6 py-12 lg:grid-cols-[1.05fr_.95fr] lg:gap-12 lg:px-12">
        <div className="hidden text-[#DCE7ED] lg:block">
          <div className="mb-[34px] flex items-center gap-3">
            <span className="grid h-[42px] w-[42px] flex-none place-items-center rounded-xl bg-gradient-to-br from-cyan to-violet shadow-[0_0_24px_rgba(34,211,238,.5)]">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="#04070D"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-[23px] w-[23px]"
                aria-hidden="true"
              >
                <path d="M4 20v-1a5 5 0 0 1 5-5h1" />
                <circle cx="10.5" cy="7.5" r="3.5" />
                <path d="M15 12l2.2 2.2L21 10.4" />
              </svg>
            </span>
            <span className="font-display text-[23px] font-bold tracking-[-.02em] text-white">
              Portal<span className="text-cyan">RH</span>
            </span>
          </div>
          <h1 className="font-display text-[42px] font-bold leading-[1.07] text-white">
            Gestão de pessoas,{' '}
            <span className="bg-gradient-to-r from-cyan-600 to-violet bg-clip-text text-transparent">
              do jeito moderno.
            </span>
          </h1>
          <p className="mt-[18px] max-w-[410px] text-[15px] leading-relaxed text-[#93A6B3]">
            Admissão, férias, avaliações e desligamentos em um só lugar, com a segurança e a
            experiência que a sua equipe merece.
          </p>
          <div className="mt-7 flex flex-col gap-[13px]">
            {FEATURES.map((feature) => (
              <div key={feature} className="flex items-center gap-[11px] text-[13.5px] text-[#B9C8D2]">
                <span className="grid h-[22px] w-[22px] flex-none place-items-center rounded-[7px] bg-cyan/[0.14]">
                  <CheckIcon className="h-[13px] w-[13px] text-cyan" />
                </span>
                {feature}
              </div>
            ))}
          </div>
        </div>

        <div className="w-full max-w-[400px] justify-self-center rounded-[22px] border border-cyan/[0.22] bg-[rgba(9,14,26,.55)] p-8 text-[#EAF2F6] shadow-[0_30px_80px_rgba(0,0,0,.55)] backdrop-blur-[16px] lg:justify-self-end">
          <div className="text-[11px] font-semibold uppercase tracking-[.12em] text-cyan">
            Bem-vindo de volta
          </div>
          <h2 className="mb-1 mt-2 text-2xl font-semibold text-white">Entrar no sistema</h2>
          <p className="mb-[22px] text-[13px] text-[#8CA0AD]">
            Use suas credenciais para acessar o portal.
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
            <div className="grid grid-cols-2 gap-[9px]">
              {DEMO_ACCOUNTS.map((account, index) => (
                <button
                  key={account.email}
                  type="button"
                  disabled={isLoading}
                  onClick={() => quickAccess(account.email)}
                  className="flex w-full min-w-0 flex-col gap-0.5 rounded-[11px] border border-[rgba(140,160,173,.2)] bg-[rgba(4,7,13,.5)] px-3 py-[11px] text-left text-[13px] text-[#DCE7ED] transition hover:border-cyan hover:bg-cyan/[0.08] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="truncate font-semibold">
                    {index === 0 ? 'Entrar como RH' : 'Como Funcionário'}
                  </span>
                  <span className="truncate font-mono text-[10px] text-[#7F93A0]">{account.email}</span>
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
