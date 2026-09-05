import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { EnvelopeIcon, LockClosedIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import Input from '../common/Input';
import Button from '../common/Button';
import LanguageToggle from '../common/LanguageToggle';
import toast from 'react-hot-toast';

interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

const LoginForm: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      await login(data.email, data.password);
      toast.success(t('auth.loginSuccess'));
      navigate('/');
    } catch (error: any) {
      const message = error.response?.data?.message || t('auth.invalidCredentials');
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex bg-neutral-50">
      {/* Left side - Login Form */}
      <div className="flex-1 flex flex-col justify-start pt-8 pb-12 px-4 sm:px-6 lg:px-20 xl:px-24 bg-white">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mb-6">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-soft-lg">
                <span className="text-2xl font-bold text-white">HR</span>
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gradient-primary">PortalRH</h2>
            <p className="mt-3 text-lg text-neutral-600">{t('auth.welcomeBack')}</p>
            <p className="text-sm text-neutral-500">{t('auth.pleaseSignIn')}</p>
          </div>

          {/* Language Toggle */}
          <div className="mb-8 flex justify-center">
            <LanguageToggle />
          </div>

          {/* Login Form */}
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-5">
              <div className="group">
                <Input
                  {...register('email', { 
                    required: t('validation.required'),
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: t('validation.email')
                    }
                  })}
                  type="email"
                  label={t('auth.email')}
                  placeholder={t('auth.enterEmail')}
                  icon={<EnvelopeIcon />}
                  error={errors.email?.message}
                  required
                  autoComplete="email"
                />
              </div>

              <div className="group relative">
                <Input
                  {...register('password', { required: t('validation.required') })}
                  type={showPassword ? 'text' : 'password'}
                  label={t('auth.password')}
                  placeholder={t('auth.enterPassword')}
                  icon={<LockClosedIcon />}
                  error={errors.password?.message}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-primary-600 transition-colors duration-200 focus:outline-none z-10"
                  onClick={togglePasswordVisibility}
                  style={{ top: 'calc(50% + 12px)' }}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  {...register('rememberMe')}
                  id="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded transition-colors"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-neutral-700 font-medium">
                  {t('auth.rememberMe')}
                </label>
              </div>

              <div className="text-sm">
                <a
                  href="/forgot-password"
                  className="font-semibold text-primary-600 hover:text-primary-700 transition-colors duration-200"
                >
                  {t('auth.forgotPassword')}
                </a>
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                fullWidth
                isLoading={isLoading}
                disabled={isLoading}
                className="btn-gradient-primary py-3 text-base font-semibold"
              >
                {isLoading ? t('auth.signingIn') : t('auth.login')}
              </Button>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-neutral-500">
              {t('auth.terms')}
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Enhanced Branding */}
      <div className="hidden lg:block relative w-0 flex-1">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 flex items-center justify-center overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-white rounded-full translate-x-1/3 translate-y-1/3"></div>
            <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-white rounded-full"></div>
          </div>
          
          <div className="relative text-center text-white z-10 max-w-lg px-8">
            <div className="mb-8">
              <h1 className="text-5xl font-bold mb-6 text-shadow-lg leading-tight">
                {t('auth.welcomeTo')}
                <span className="block text-primary-200">PortalRH</span>
              </h1>
              <p className="text-xl text-primary-100 font-medium leading-relaxed">
                {t('auth.completeSolution')}
              </p>
            </div>
            
            {/* Feature Grid */}
            <div className="grid grid-cols-2 gap-6 mt-12">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 group">
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">👥</div>
                <h3 className="font-semibold mb-2">{t('auth.employeeManagement')}</h3>
                <p className="text-sm text-primary-200">{t('auth.employeeManagementDesc')}</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 group">
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">📊</div>
                <h3 className="font-semibold mb-2">{t('auth.analyticsDashboard')}</h3>
                <p className="text-sm text-primary-200">{t('auth.analyticsDashboardDesc')}</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 group">
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">📅</div>
                <h3 className="font-semibold mb-2">{t('auth.leaveManagement')}</h3>
                <p className="text-sm text-primary-200">{t('auth.leaveManagementDesc')}</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 group">
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">⭐</div>
                <h3 className="font-semibold mb-2">{t('auth.performanceReviews')}</h3>
                <p className="text-sm text-primary-200">{t('auth.performanceReviewsDesc')}</p>
              </div>
            </div>
            
            {/* Stats */}
            <div className="mt-12 flex justify-center space-x-8 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-200">500+</div>
                <div className="text-primary-300">{t('auth.companies')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-200">50K+</div>
                <div className="text-primary-300">{t('auth.employees')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-200">99.9%</div>
                <div className="text-primary-300">{t('auth.uptime')}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;