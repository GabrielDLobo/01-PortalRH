import { useState } from 'react';
import toast from 'react-hot-toast';
import { ShieldExclamationIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';
import { Button, Card, Input, PageHero, PageBody } from '../components/ui';
import { formatDate } from '../utils/formatters';

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
      <PageHero crumb="Meu perfil" eyebrow="Conta" title="Meu perfil" subtitle="Seus dados cadastrais e de acesso ao sistema." />
      <PageBody>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[320px_1fr]">
        <div className="rounded-2xl border border-line bg-surface p-6 text-center shadow-sm">
          <div className="mx-auto mb-3.5 grid h-[84px] w-[84px] place-items-center rounded-[22px] bg-gradient-to-br from-cyan-600 to-violet font-display text-3xl font-bold text-dark shadow-[0_10px_30px_rgba(34,211,238,.35)]">
            {(user.full_name || user.email).slice(0, 2).toUpperCase()}
          </div>
          <h3 className="text-lg font-semibold text-ink">{user.full_name}</h3>
          <div className="mt-1 text-[12.5px] font-semibold text-cyan-700">{user.role_display}</div>
          <div className="mt-4 flex flex-col gap-2.5 text-left">
            <div className="flex justify-between border-t border-line-2 pt-2.5 text-[12.5px]">
              <span className="text-muted">Perfil de acesso</span>
              <b className="font-semibold text-ink">{user.role_display}</b>
            </div>
            <div className="flex justify-between border-t border-line-2 pt-2.5 text-[12.5px]">
              <span className="text-muted">Membro desde</span>
              <b className="font-mono font-semibold text-ink">{formatDate(user.created_at, 'MM/yyyy')}</b>
            </div>
            <div className="flex justify-between border-t border-line-2 pt-2.5 text-[12.5px]">
              <span className="text-muted">Situação</span>
              <b className="font-semibold text-ink">{user.is_active ? 'Ativo' : 'Inativo'}</b>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
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
      </PageBody>
    </div>
  );
};

export default Profile;
