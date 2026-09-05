import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { UserCircleIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { authService } from '../services/authService';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { formatName, getInitials } from '../utils/formatters';
import toast from 'react-hot-toast';

interface ProfileFormData {
  first_name: string;
  last_name: string;
  email: string;
}

interface PasswordFormData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { t } = useLanguage();
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');

  // Profile form validation
  const profileValidationSchema = yup.object().shape({
    first_name: yup.string().required(t('validation.required')),
    last_name: yup.string().required(t('validation.required')),
    email: yup.string().email(t('validation.email')).required(t('validation.required')),
  });

  // Password form validation
  const passwordValidationSchema = yup.object().shape({
    current_password: yup.string().required(t('validation.required')),
    new_password: yup
      .string()
      .min(8, t('validation.minLength', { count: 8 }))
      .required(t('validation.required')),
    confirm_password: yup
      .string()
      .oneOf([yup.ref('new_password')], t('validation.passwordMismatch'))
      .required(t('validation.required')),
  });

  const profileForm = useForm<ProfileFormData>({
    resolver: yupResolver(profileValidationSchema),
    defaultValues: {
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      email: user?.email || '',
    },
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: yupResolver(passwordValidationSchema),
    defaultValues: {
      current_password: '',
      new_password: '',
      confirm_password: '',
    },
  });

  const onUpdateProfile = async (data: ProfileFormData) => {
    try {
      setIsUpdatingProfile(true);
      const updatedUser = await authService.updateProfile(data);
      updateUser(updatedUser);
      toast.success(t('profile.profileUpdated'));
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update profile';
      toast.error(message);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const onChangePassword = async (data: PasswordFormData) => {
    try {
      setIsChangingPassword(true);
      await authService.changePassword(data.current_password, data.new_password);
      toast.success('Password changed successfully');
      passwordForm.reset();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to change password';
      toast.error(message);
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">{t('profile.title')}</h1>
        <p className="text-neutral-600 mt-1">
          Manage your personal information and account settings
        </p>
      </div>

      {/* Profile Header */}
      <div className="bg-white rounded-xl shadow-soft p-8">
        <div className="flex items-center space-x-6">
          <div className="relative">
            {user?.avatar ? (
              <img
                className="h-24 w-24 rounded-full object-cover"
                src={user.avatar}
                alt=""
              />
            ) : (
              <div className="h-24 w-24 rounded-full bg-primary-500 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {user ? getInitials(user.first_name, user.last_name) : 'U'}
                </span>
              </div>
            )}
            <button className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-md border border-neutral-200 hover:bg-neutral-50">
              <UserCircleIcon className="h-5 w-5 text-neutral-600" />
            </button>
          </div>
          
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-neutral-900">
              {user ? formatName(user.first_name, user.last_name) : 'User Name'}
            </h2>
            <p className="text-neutral-600 mt-1">{user?.email}</p>
            <div className="mt-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                {user?.role}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-soft">
        <div className="border-b border-neutral-200 px-6">
          <nav className="-mb-px flex space-x-8">
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'profile'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
              }`}
              onClick={() => setActiveTab('profile')}
            >
              {t('profile.personalInformation')}
            </button>
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'password'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
              }`}
              onClick={() => setActiveTab('password')}
            >
              {t('profile.changePassword')}
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'profile' && (
            <form onSubmit={profileForm.handleSubmit(onUpdateProfile)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  {...profileForm.register('first_name')}
                  label={t('employees.firstName')}
                  error={profileForm.formState.errors.first_name?.message}
                  required
                />

                <Input
                  {...profileForm.register('last_name')}
                  label={t('employees.lastName')}
                  error={profileForm.formState.errors.last_name?.message}
                  required
                />
              </div>

              <Input
                {...profileForm.register('email')}
                type="email"
                label={t('auth.email')}
                error={profileForm.formState.errors.email?.message}
                required
              />

              <div className="flex justify-end">
                <Button
                  type="submit"
                  isLoading={isUpdatingProfile}
                  disabled={isUpdatingProfile}
                >
                  {t('profile.updateProfile')}
                </Button>
              </div>
            </form>
          )}

          {activeTab === 'password' && (
            <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="space-y-6">
              <Input
                {...passwordForm.register('current_password')}
                type="password"
                label={t('profile.currentPassword')}
                icon={<LockClosedIcon />}
                error={passwordForm.formState.errors.current_password?.message}
                required
              />

              <Input
                {...passwordForm.register('new_password')}
                type="password"
                label={t('profile.newPassword')}
                icon={<LockClosedIcon />}
                error={passwordForm.formState.errors.new_password?.message}
                helperText="Password must be at least 8 characters long"
                required
              />

              <Input
                {...passwordForm.register('confirm_password')}
                type="password"
                label={t('profile.confirmPassword')}
                icon={<LockClosedIcon />}
                error={passwordForm.formState.errors.confirm_password?.message}
                required
              />

              <div className="flex justify-end">
                <Button
                  type="submit"
                  isLoading={isChangingPassword}
                  disabled={isChangingPassword}
                >
                  {t('profile.changePassword')}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;