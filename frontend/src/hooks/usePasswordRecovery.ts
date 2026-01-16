import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { postForgotPassword } from '../api/post/post-forgot-password';
import { postResetPassword } from '../api/post/post-reset-password';

interface ForgotPasswordData {
  email: string;
}

interface ResetPasswordData {
  token: string;
  password: string;
}

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: postForgotPassword,
  });
};

export const useResetPassword = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: postResetPassword,
    onSuccess: () => {
      navigate('/login');
    },
  });
};
