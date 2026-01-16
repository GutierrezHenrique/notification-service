import { useQuery } from '@tanstack/react-query';
import { getUserMe } from '../api/get/get-user-me';

export const useUser = () => {
  return useQuery({
    queryKey: ['user', 'me'],
    queryFn: getUserMe,
    retry: false,
  });
};
