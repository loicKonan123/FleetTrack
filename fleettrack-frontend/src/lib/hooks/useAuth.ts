'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/lib/api/auth';
import { LoginRequest, RegisterRequest } from '@/types/auth';
import { useRouter } from 'next/navigation';
import { clearTokens, hasToken } from '@/lib/api/client';
import { useClientReady } from './useClientReady';

export const useAuth = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isReady = useClientReady();

  const { data: user, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: authApi.getCurrentUser,
    retry: false,
    staleTime: 5 * 60 * 1000,
    enabled: isReady && hasToken(),
  });

  // Auth is ready when we've checked for token and either have a user or confirmed no token
  const isAuthReady = isReady && (!!user || !hasToken() || !isLoading);

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
    isAuthReady,
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    isLoginLoading: loginMutation.isPending,
    isRegisterLoading: registerMutation.isPending,
  };
};
