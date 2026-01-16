import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../hooks/useUser';
import { useDeleteAccount } from '../hooks/useProfile';
import EditProfileModal from '../components/EditProfileModal';
import ChangePasswordModal from '../components/ChangePasswordModal';
import { getErrorMessage } from '../types/api';
import {
  Header,
  Button,
  Loading,
  Card,
  ConfirmationDialog,
} from '../components/ui';
import { useToast } from '../providers/ToastProvider';

const Profile = () => {
  const navigate = useNavigate();
  const { data: user, isLoading } = useUser();
  const deleteAccountMutation = useDeleteAccount();
  const { addToast } = useToast();

  const [showEditModal, setShowEditModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return 'Data não disponível';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Data não disponível';
    return date.toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteAccountMutation.mutateAsync();
      addToast('Conta excluída com sucesso', 'success');
      navigate('/login');
    } catch (error) {
      addToast(
        getErrorMessage(error) || 'Erro ao excluir conta',
        'error',
      );
      setShowDeleteConfirm(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loading text="Carregando perfil..." />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        title="Meu Perfil"
        showBackButton
        onBack={() => navigate('/albums')}
      />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Card de Informações do Perfil */}
          <Card className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">
                  Informações do Perfil
                </h2>
                <p className="text-slate-500 text-sm">
                  Gerencie suas informações pessoais
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowEditModal(true)}
                className="flex items-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Editar
              </Button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4 pb-4 border-b border-slate-200">
                {user.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt={user.name}
                    className="w-16 h-16 rounded-full object-cover shadow-lg"
                  />
                ) : (
                  <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-semibold text-slate-800">
                    {user.name}
                  </h3>
                  <p className="text-slate-500 text-sm">{user.email}</p>
                  {user.provider === 'google' && (
                    <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      Conta Google
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">
                    Nome
                  </label>
                  <p className="text-slate-800">{user.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">
                    E-mail
                  </label>
                  <p className="text-slate-800">{user.email}</p>
                </div>
                {user.createdAt && (
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">
                      Membro desde
                    </label>
                    <p className="text-slate-800">
                      {formatDate(user.createdAt)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Card de Segurança */}
          <Card className="p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-2">
                Segurança
              </h2>
              <p className="text-slate-500 text-sm">
                Gerencie sua senha e segurança da conta
              </p>
            </div>

            <div className="space-y-4">
              {user.provider === 'google' ? (
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div>
                    <h3 className="font-medium text-slate-800 mb-1">
                      Conta Google
                    </h3>
                    <p className="text-sm text-slate-500">
                      Você fez login com Google. A senha é gerenciada pela sua conta Google.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-blue-600">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-slate-800 mb-1">
                      Senha da Conta
                    </h3>
                    <p className="text-sm text-slate-500">
                      Última alteração: Recente
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setShowChangePasswordModal(true)}
                  >
                    Alterar Senha
                  </Button>
                </div>
              )}
            </div>
          </Card>

          {/* Card de Zona de Perigo */}
          <Card className="p-6 border-2 border-red-200 bg-red-50">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-red-800 mb-2">
                Zona de Perigo
              </h2>
              <p className="text-red-600 text-sm">
                Ações irreversíveis que afetam sua conta
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-red-200">
                <div>
                  <h3 className="font-medium text-red-800 mb-1">
                    Excluir Conta
                  </h3>
                  <p className="text-sm text-red-600">
                    Esta ação não pode ser desfeita. Todos os seus dados serão
                    permanentemente excluídos.
                  </p>
                </div>
                <Button
                  variant="danger"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  Excluir Conta
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </main>

      {/* Modais */}
      <EditProfileModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
      />

      <ChangePasswordModal
        isOpen={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
      />

      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteAccount}
        title="Excluir Conta"
        message="Tem certeza que deseja excluir sua conta? Esta ação é permanente e não pode ser desfeita. Todos os seus álbuns e fotos serão perdidos."
        confirmLabel="Sim, excluir conta"
        cancelLabel="Cancelar"
        variant="danger"
      />
    </div>
  );
};

export default Profile;
