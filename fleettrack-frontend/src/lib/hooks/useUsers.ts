'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@/lib/api/users';
import { CreateUserRequest, UpdateUserRequest, ResetPasswordRequest } from '@/types/user';
import { hasToken } from '@/lib/api/client';
import { useClientReady } from './useClientReady';

export const useUsers = (page = 1, pageSize = 10) => {
  const queryClient = useQueryClient();
  const isReady = useClientReady();

  const usersQuery = useQuery({
    queryKey: ['users', page, pageSize],
    queryFn: () => usersApi.getAll(page, pageSize),
    refetchOnMount: 'always',
    enabled: isReady && hasToken(),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateUserRequest) => usersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserRequest }) =>
      usersApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', variables.id] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => usersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ResetPasswordRequest }) =>
      usersApi.resetPassword(id, data),
  });

  const activateMutation = useMutation({
    mutationFn: (id: string) => usersApi.activate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => usersApi.deactivate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  return {
    users: usersQuery.data,
    isLoading: usersQuery.isLoading,
    error: usersQuery.error,
    createUser: createMutation.mutateAsync,
    updateUser: updateMutation.mutateAsync,
    deleteUser: deleteMutation.mutateAsync,
    resetPassword: resetPasswordMutation.mutateAsync,
    activateUser: activateMutation.mutateAsync,
    deactivateUser: deactivateMutation.mutateAsync,
  };
};

export const useUser = (id: string) => {
  const isReady = useClientReady();

  return useQuery({
    queryKey: ['user', id],
    queryFn: () => usersApi.getById(id),
    enabled: !!id && isReady && hasToken(),
  });
};

export const useRoles = () => {
  const isReady = useClientReady();

  return useQuery({
    queryKey: ['roles'],
    queryFn: () => usersApi.getRoles(),
    enabled: isReady && hasToken(),
  });
};
