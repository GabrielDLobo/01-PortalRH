import React, { useState } from 'react';
import { EyeIcon, EyeSlashIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import Button from '../common/Button';
import Input from '../common/Input';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

interface FirstLoginPasswordChangeProps {
  onSuccess: () => void;
}

const FirstLoginPasswordChange: React.FC<FirstLoginPasswordChangeProps> = ({ onSuccess }) => {
  const { user, handleFirstLoginPasswordChange } = useAuth();
  const [formData, setFormData] = useState({
    new_password: '',
    new_password_confirm: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.new_password !== formData.new_password_confirm) {
      toast.error('As senhas não coincidem');
      return;
    }

    if (formData.new_password.length < 8) {
      toast.error('A senha deve ter pelo menos 8 caracteres');
      return;
    }

    try {
      setIsLoading(true);
      
      await handleFirstLoginPasswordChange(formData.new_password, formData.new_password_confirm);
      
      toast.success('Senha alterada com sucesso!');
      onSuccess();
      
    } catch (error: any) {
      console.error('Error changing password:', error);
      toast.error(error.response?.data?.message || 'Erro ao alterar senha');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-primary-500 rounded-full flex items-center justify-center">
            <LockClosedIcon className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-neutral-900">
            🔐 Primeiro Acesso
          </h2>
          <p className="mt-2 text-sm text-neutral-600">
            Olá, <strong>{user?.first_name || user?.username}</strong>! 
            Para sua segurança, você deve alterar sua senha no primeiro acesso.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-soft p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Nova Senha *
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.new_password}
                  onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
                  placeholder="Digite sua nova senha"
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-neutral-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-neutral-400" />
                  )}
                </button>
              </div>
              <p className="mt-2 text-sm text-neutral-500">
                Mínimo de 8 caracteres
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Confirmar Nova Senha *
              </label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.new_password_confirm}
                  onChange={(e) => setFormData({ ...formData, new_password_confirm: e.target.value })}
                  placeholder="Confirme sua nova senha"
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-neutral-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-neutral-400" />
                  )}
                </button>
              </div>
            </div>

            <div className="bg-info-50 border border-info-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-info-900 mb-2">
                Requisitos da senha:
              </h4>
              <ul className="text-sm text-info-800 space-y-1">
                <li className="flex items-center">
                  <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                    formData.new_password.length >= 8 ? 'bg-success-500' : 'bg-neutral-300'
                  }`} />
                  Pelo menos 8 caracteres
                </li>
                <li className="flex items-center">
                  <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                    formData.new_password === formData.new_password_confirm && formData.new_password 
                      ? 'bg-success-500' : 'bg-neutral-300'
                  }`} />
                  Senhas devem coincidir
                </li>
              </ul>
            </div>

            <Button
              type="submit"
              isLoading={isLoading}
              disabled={
                !formData.new_password || 
                !formData.new_password_confirm || 
                formData.new_password !== formData.new_password_confirm ||
                formData.new_password.length < 8
              }
              className="w-full"
            >
              {isLoading ? 'Alterando Senha...' : 'Alterar Senha e Continuar'}
            </Button>
          </form>
        </div>

        <div className="text-center">
          <p className="text-sm text-neutral-500">
            Após alterar sua senha, você poderá acessar o sistema normalmente
          </p>
        </div>
      </div>
    </div>
  );
};

export default FirstLoginPasswordChange;