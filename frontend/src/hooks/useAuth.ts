import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { postLogin } from '../api/post/post-login';
import { postRegister } from '../api/post/post-register';

export const useLogin = () => {
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: postLogin,
    onSuccess: (data) => {
      setAuth(data.user, data.access_token);
      navigate('/albums');
    },
  });
};

export const useRegister = () => {
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: postRegister,
    onSuccess: (data) => {
      setAuth(data.user, data.access_token);
      navigate('/albums');
    },
  });
};
