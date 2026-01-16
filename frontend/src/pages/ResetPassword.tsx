import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useResetPassword } from '../hooks/usePasswordRecovery';
import { getErrorMessage } from '../types/api';
import { Input, Button } from '../components/ui';
import { useToast } from '../providers/ToastProvider';
import { useEffect } from 'react';

interface ResetPasswordForm {
  password: string;
  confirmPassword: string;
}

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordForm>();

  const password = watch('password');
  const resetPasswordMutation = useResetPassword();
  const { addToast } = useToast();

  useEffect(() => {
    if (!token) {
      addToast('Token inválido ou ausente', 'error');
      navigate('/forgot-password');
    }
  }, [token, navigate, addToast]);

  const onSubmit = (data: ResetPasswordForm) => {
    if (!token) {
      addToast('Token inválido', 'error');
      return;
    }

    resetPasswordMutation.mutate(
      {
        token,
        password: data.password,
      },
      {
        onSuccess: () => {
          addToast('Senha redefinida com sucesso!', 'success');
        },
      },
    );
  };

  useEffect(() => {
    if (resetPasswordMutation.isError) {
      addToast(
        getErrorMessage(resetPasswordMutation.error) ||
          'Erro ao redefinir senha',
        'error',
      );
    }
  }, [
    resetPasswordMutation.isError,
    resetPasswordMutation.error,
    addToast,
  ]);

  if (!token) {
    return null;
  }

  return (
    <div className="min-h-screen flex bg-white">
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24 bg-white z-10 w-full lg:w-[480px] xl:w-[550px]">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="mb-10">
            <div className="w-12 h-12 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-200 text-white transform -rotate-3">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                />
              </svg>
            </div>
            <h2 className="text-3xl font-product-sans font-extrabold text-gray-900 tracking-tight">
              Redefinir senha
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Digite sua nova senha abaixo.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              id="password"
              type="password"
              label="Nova senha"
              placeholder="No mínimo 6 caracteres"
              error={errors.password?.message}
              className="bg-gray-50 border-gray-200 focus:bg-white transition-colors py-3"
              {...register('password', {
                required: 'Senha é obrigatória',
                minLength: {
                  value: 6,
                  message: 'Senha deve ter no mínimo 6 caracteres',
                },
              })}
            />

            <Input
              id="confirmPassword"
              type="password"
              label="Confirmar nova senha"
              placeholder="Digite novamente"
              error={errors.confirmPassword?.message}
              className="bg-gray-50 border-gray-200 focus:bg-white transition-colors py-3"
              {...register('confirmPassword', {
                required: 'Confirmação de senha é obrigatória',
                validate: (value) =>
                  value === password || 'As senhas não coincidem',
              })}
            />

            <Button
              type="submit"
              isLoading={resetPasswordMutation.isPending}
              className="w-full py-4 text-lg font-bold rounded-xl shadow-indigo-200 hover:shadow-indigo-300 transition-all duration-300 mt-2"
            >
              Redefinir senha
            </Button>

            <div className="text-center">
              <Link
                to="/login"
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
              >
                Voltar para o login
              </Link>
            </div>
          </form>
        </div>
      </div>

      <div className="hidden lg:block relative flex-1 bg-gray-900">
        <div className="absolute inset-0 bg-indigo-900/40 mix-blend-multiply z-10" />
        <img
          className="absolute inset-0 h-full w-full object-cover"
          src="https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
          alt="Paisagem"
        />
      </div>
    </div>
  );
};

export default ResetPassword;
