'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { driversApi } from '@/lib/api/drivers';
import { CreateDriverRequest, UpdateDriverRequest } from '@/types/driver';
import { hasToken } from '@/lib/api/client';
import { useClientReady } from './useClientReady';

export const useDrivers = (page = 1, pageSize = 10) => {
  const queryClient = useQueryClient();
  const isReady = useClientReady();

  const driversQuery = useQuery({
    queryKey: ['drivers', page, pageSize],
    queryFn: () => driversApi.getAll(page, pageSize),
    refetchOnMount: 'always',
    enabled: isReady && hasToken(),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateDriverRequest) => driversApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDriverRequest }) =>
      driversApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      queryClient.invalidateQueries({ queryKey: ['driver', variables.id] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => driversApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
    },
  });

  return {
    drivers: driversQuery.data,
    isLoading: driversQuery.isLoading,
    error: driversQuery.error,
    createDriver: createMutation.mutateAsync,
    updateDriver: updateMutation.mutateAsync,
    deleteDriver: deleteMutation.mutateAsync,
  };
};

export const useDriver = (id: string) => {
  const isReady = useClientReady();

  return useQuery({
    queryKey: ['driver', id],
    queryFn: () => driversApi.getById(id),
    enabled: !!id && isReady && hasToken(),
  });
};
