'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/lib/api/auth';
import { LoginRequest, RegisterRequest } from '@/types/auth';
import { useRouter } from 'next/navigation';
import { clearTokens } from '@/lib/api/client';

export const useAuth = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: authApi.getCurrentUser,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (data) => {
      queryClient.setQueryData(['currentUser'], data.user);
      router.push('/dashboard');
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: RegisterRequest) => authApi.register(data),
    onSuccess: (data) => {
      queryClient.setQueryData(['currentUser'], data.user);
      router.push('/dashboard');
    },
  });

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      clearTokens();
      queryClient.clear();
      router.push('/login');
    },
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    isLoginLoading: loginMutation.isPending,
    isRegisterLoading: registerMutation.isPending,
  };
};
