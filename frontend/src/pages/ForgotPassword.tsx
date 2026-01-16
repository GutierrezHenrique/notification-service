import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useForgotPassword } from '../hooks/usePasswordRecovery';
import { getErrorMessage } from '../types/api';
import { Input, Button } from '../components/ui';
import { useToast } from '../providers/ToastProvider';
import { useEffect, useState } from 'react';

interface ForgotPasswordForm {
  email: string;
}

const ForgotPassword = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordForm>();

  const forgotPasswordMutation = useForgotPassword();
  const { addToast } = useToast();
  const [emailSent, setEmailSent] = useState(false);

  const onSubmit = (data: ForgotPasswordForm) => {
    forgotPasswordMutation.mutate(data, {
      onSuccess: () => {
        setEmailSent(true);
      },
    });
  };

  useEffect(() => {
    if (forgotPasswordMutation.isError) {
      addToast(
        getErrorMessage(forgotPasswordMutation.error) ||
          'Erro ao enviar email de recuperação',
        'error',
      );
    }
  }, [
    forgotPasswordMutation.isError,
    forgotPasswordMutation.error,
    addToast,
  ]);

  if (emailSent) {
    return (
      <div className="min-h-screen flex bg-white">
        <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24 bg-white z-10 w-full lg:w-[480px] xl:w-[550px]">
          <div className="mx-auto w-full max-w-sm lg:w-96">
            <div className="mb-10">
              <div className="w-12 h-12 bg-gradient-to-tr from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-green-200 text-white transform -rotate-3">
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
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-3xl font-product-sans font-extrabold text-gray-900 tracking-tight">
                Email enviado!
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Verifique sua caixa de entrada. Enviamos um link para redefinir
                sua senha.
              </p>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                Não recebeu o email? Verifique sua pasta de spam ou tente
                novamente.
              </p>

              <div className="pt-4">
                <Link to="/login">
                  <Button
                    variant="outline"
                    className="w-full py-3 text-base font-semibold rounded-xl"
                  >
                    Voltar para o login
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="hidden lg:block relative flex-1 bg-gray-900">
          <div className="absolute inset-0 bg-green-900/40 mix-blend-multiply z-10" />
          <img
            className="absolute inset-0 h-full w-full object-cover"
            src="https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
            alt="Paisagem"
          />
        </div>
      </div>
    );
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
              Recuperar senha
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Digite seu email e enviaremos um link para redefinir sua senha.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              id="email"
              type="email"
              label="E-mail"
              placeholder="seu@email.com"
              error={errors.email?.message}
              className="bg-gray-50 border-gray-200 focus:bg-white transition-colors py-3"
              {...register('email', {
                required: 'E-mail é obrigatório',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'E-mail inválido',
                },
              })}
            />

            <Button
              type="submit"
              isLoading={forgotPasswordMutation.isPending}
              className="w-full py-4 text-lg font-bold rounded-xl shadow-indigo-200 hover:shadow-indigo-300 transition-all duration-300 mt-2"
            >
              Enviar link de recuperação
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

export default ForgotPassword;
