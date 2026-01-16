import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useRegister } from '../hooks/useAuth';
import { getErrorMessage } from '../types/api';
import { Input, Button } from '../components/ui';
import { useToast } from '../providers/ToastProvider';
import { useEffect } from 'react';

interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const Register = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>();

  const password = watch('password');
  const registerMutation = useRegister();
  const { addToast } = useToast();

  const onSubmit = (data: RegisterForm) => {
    registerMutation.mutate({
      name: data.name,
      email: data.email,
      password: data.password,
    });
  };

  useEffect(() => {
    if (registerMutation.isError) {
      addToast(getErrorMessage(registerMutation.error) || 'Erro ao criar conta', 'error');
    }
  }, [registerMutation.isError, registerMutation.error, addToast]);

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Side - Register Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24 bg-white z-10 w-full lg:w-[480px] xl:w-[550px]">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-200 text-white transform rotate-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h2 className="text-3xl font-product-sans font-extrabold text-gray-900 tracking-tight">
              Crie sua conta
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Já tem uma conta?{' '}
              <Link
                to="/login"
                className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
              >
                Fazer login
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              id="name"
              type="text"
              label="Nome completo"
              placeholder="Seu nome"
              error={errors.name?.message}
              className="bg-gray-50 border-gray-200 focus:bg-white transition-colors py-3"
              {...register('name', {
                required: 'Nome é obrigatório',
                minLength: {
                  value: 2,
                  message: 'Nome deve ter no mínimo 2 caracteres',
                },
              })}
            />

            <Input
              id="email"
              type="email"
              label="Seu melhor e-mail"
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

            <Input
              id="password"
              type="password"
              label="Crie uma senha segura"
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
              label="Confirme sua senha"
              placeholder="Digite novamente"
              error={errors.confirmPassword?.message}
              className="bg-gray-50 border-gray-200 focus:bg-white transition-colors py-3"
              {...register('confirmPassword', {
                required: 'Confirmação de senha é obrigatória',
                validate: (value) =>
                  value === password || 'As senhas não coincidem',
              })}
            />

            <div className="pt-2">
              <Button
                type="submit"
                isLoading={registerMutation.isPending}
                className="w-full py-4 text-lg font-bold rounded-xl shadow-indigo-200 hover:shadow-indigo-300 transition-all duration-300 mt-2"
              >
                Começar agora
              </Button>
              <p className="text-xs text-gray-400 text-center mt-4">
                Ao se cadastrar, você concorda com nossos <br /> Termos de Serviço e Política de Privacidade.
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* Right Side - Marketing Visual */}
      <div className="hidden lg:block relative flex-1 bg-gray-900">
        <div className="absolute inset-0 bg-purple-900/40 mix-blend-multiply z-10" />
        <img
          className="absolute inset-0 h-full w-full object-cover"
          src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
          alt="Amigos tirando fotos"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent z-20 flex flex-col justify-end p-12 xl:p-24 text-white">
          <div className="max-w-xl">
            <span className="inline-flex items-center px-3 py-1 rounded-full border border-purple-300/30 bg-purple-500/20 text-purple-200 text-xs font-bold tracking-wide uppercase mb-6 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mr-2 animate-pulse"></span>
              Armazenamento Ilimitado
            </span>
            <h3 className="text-4xl font-bold leading-tight mb-4 text-white">
              Guarde suas memórias com a segurança que elas merecem.
            </h3>
            <p className="text-lg text-gray-300 mb-8">
              Junte-se a milhares de pessoas que já organizaram seus momentos mais importantes com a MyGallery.
            </p>

            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <img
                  key={i}
                  className="inline-block h-10 w-10 rounded-full ring-2 ring-gray-900 object-cover"
                  src={`https://randomuser.me/api/portraits/thumb/men/${20 + i}.jpg`}
                  alt=""
                />
              ))}
              <div className="h-10 w-10 rounded-full ring-2 ring-gray-900 bg-gray-700 flex items-center justify-center text-xs font-medium text-white">
                +2k
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
