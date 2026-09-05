import { useState } from 'react';
import toast from 'react-hot-toast';
import { ShieldExclamationIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';
import { Avatar, Button, Card, Input } from '../components/ui';

const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();

  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordBlocked, setPasswordBlocked] = useState(false);

  if (!user) return null;

  const handleSaveProfile = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      toast.error('Preencha nome e sobrenome.');
      return;
    }
    try {
      setIsSavingProfile(true);
      await authService.updateProfile(user.id, { first_name: firstName, last_name: lastName });
      // A resposta do update usa um serializer mais enxuto (sem full_name,
      // role_display etc.); buscamos o perfil completo de novo em vez de
      // arriscar sobrescrever o usuário no contexto com um objeto truncado.
      const refreshed = await authService.getCurrentUser();
      updateUser(refreshed);
      toast.success('Dados atualizados.');
    } catch {
      toast.error('Não foi possível salvar as alterações.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Preencha todos os campos.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('As senhas não coincidem.');
      return;
    }
    try {
      setIsChangingPassword(true);
      await authService.changePassword(currentPassword, newPassword);
      toast.success('Senha alterada com sucesso.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      if (error.response?.status === 403 && error.response?.data?.detail) {
        setPasswordBlocked(true);
      } else {
        const detail = error.response?.data?.old_password?.[0] || 'Não foi possível alterar a senha.';
        toast.error(detail);
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div>
      <div className="mb-5 flex items-center gap-4">
        <Avatar name={user.full_name || user.email} size="md" />
        <div>
          <h2 className="font-display text-[21px] font-semibold text-ink">{user.full_name}</h2>
          <p className="text-sm text-muted">
            {user.email} · {user.role_display}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card title="Dados pessoais">
          <div className="flex flex-col gap-4">
            <Input label="Nome" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            <Input label="Sobrenome" value={lastName} onChange={(e) => setLastName(e.target.value)} />
            <Input label="E-mail" value={user.email} disabled />
            <div className="flex justify-end">
              <Button onClick={handleSaveProfile} isLoading={isSavingProfile}>
                Salvar alterações
              </Button>
            </div>
          </div>
        </Card>

        <Card title="Segurança">
          {passwordBlocked ? (
            <div className="flex items-start gap-3 rounded-xl bg-warning/10 p-4">
              <ShieldExclamationIcon className="h-6 w-6 flex-none text-[#B45309]" />
              <div>
                <p className="font-semibold text-ink">Troca de senha desabilitada nesta demonstração.</p>
                <p className="mt-1 text-sm text-muted">
                  Este é um ambiente público de demonstração e a troca de senha das contas fica bloqueada para que
                  todos possam continuar acessando com as credenciais mostradas na tela de login.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <Input
                label="Senha atual"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
              <Input
                label="Nova senha"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <Input
                label="Confirmar nova senha"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <div className="flex justify-end">
                <Button onClick={handleChangePassword} isLoading={isChangingPassword}>
                  Alterar senha
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Profile;
