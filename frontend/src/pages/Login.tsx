import { Link, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useLogin } from '../hooks/useAuth';
import { getErrorMessage } from '../types/api';
import { Input, Button } from '../components/ui';
import { useToast } from '../providers/ToastProvider';
import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';

interface LoginForm {
  email: string;
  password: string;
}

const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  const loginMutation = useLogin();
  const { addToast } = useToast();
  const { isAuthenticated, _hasHydrated } = useAuthStore();

  // Redirecionar se já estiver autenticado
  if (_hasHydrated && isAuthenticated) {
    return <Navigate to="/albums" replace />;
  }

  const onSubmit = (data: LoginForm) => {
    loginMutation.mutate(data);
  };

  useEffect(() => {
    if (loginMutation.isError) {
      addToast(getErrorMessage(loginMutation.error) || 'Erro ao fazer login', 'error');
    }
  }, [loginMutation.isError, loginMutation.error, addToast]);

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Side - Login Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24 bg-white z-10 w-full lg:w-[480px] xl:w-[550px]">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="mb-10">
            <div className="w-12 h-12 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-200 text-white transform -rotate-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-3xl font-product-sans font-extrabold text-gray-900 tracking-tight">
              Bem-vindo de volta
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Não tem uma conta?{' '}
              <Link
                to="/register"
                className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
              >
                Crie sua galeria grátis
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-5">
              <Input
                id="email"
                type="email"
                label="E-mail corporativo ou pessoal"
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

              <div>
                <div className="relative">
                  <Input
                    id="password"
                    type="password"
                    label="Senha"
                    placeholder="••••••••"
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
                </div>
                <div className="text-right mt-2">
                  <Link
                    to="/forgot-password"
                    className="text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
                  >
                    Esqueceu a senha?
                  </Link>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              isLoading={loginMutation.isPending}
              className="w-full py-4 text-lg font-bold rounded-xl shadow-indigo-200 hover:shadow-indigo-300 transition-all duration-300 mt-2"
            >
              Entrar na plataforma
            </Button>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-400 font-medium">
                  Ou continue com
                </span>
              </div>
            </div>

            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => {
                  // O API Gateway redireciona para o auth-service
                  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
                  window.location.href = `${apiUrl}/api/auth/google`;
                }}
                className="flex items-center justify-center px-6 py-3 border border-gray-200 rounded-xl shadow-sm bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors w-full"
                title="Google"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                <span className="ml-2">Continuar com Google</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Right Side - Marketing Visual */}
      <div className="hidden lg:block relative flex-1 bg-gray-900">
        <div className="absolute inset-0 bg-indigo-900/40 mix-blend-multiply z-10" />
        <img
          className="absolute inset-0 h-full w-full object-cover"
          src="https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
          alt="Paisagem de montanha inspiradora"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent z-20 flex flex-col justify-end p-12 xl:p-24 text-white">
          <blockquote className="max-w-xl">
            <span className="text-indigo-400 font-bold tracking-wider uppercase text-xs mb-4 block">
              Depoimento
            </span>
            <p className="text-3xl font-medium leading-normal mb-8 text-white/95">
              "Finalmente uma galeria que entende como eu quero reviver meus
              momentos. A organização é intuitiva e o visual é simplesmente
              impecável."
            </p>
            <footer className="flex items-center gap-4">
              <img
                className="w-12 h-12 rounded-full border-2 border-white/20"
                src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                alt="Sarah Jenkins"
              />
              <div>
                <div className="font-bold text-white">Sarah Jenkins</div>
                <div className="text-indigo-200 text-sm font-medium">
                  Fotógrafa de Natureza
                </div>
              </div>
            </footer>
          </blockquote>

          <div className="mt-12 flex gap-2">
            <div className="h-1 w-12 bg-white rounded-full transition-all"></div>
            <div className="h-1 w-2 bg-white/30 rounded-full hover:bg-white/50 transition-all cursor-pointer"></div>
            <div className="h-1 w-2 bg-white/30 rounded-full hover:bg-white/50 transition-all cursor-pointer"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
