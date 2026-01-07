'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { maintenanceApi, MaintenanceFilters } from '@/lib/api/maintenance';
import { CreateMaintenanceRequest, UpdateMaintenanceRequest, CompleteMaintenanceRequest } from '@/types/maintenance';
import { hasToken } from '@/lib/api/client';
import { useClientReady } from './useClientReady';

export const useMaintenance = (page = 1, pageSize = 10, filters?: MaintenanceFilters) => {
  const queryClient = useQueryClient();
  const isReady = useClientReady();

  const maintenanceQuery = useQuery({
    queryKey: ['maintenance', page, pageSize, filters],
    queryFn: () => maintenanceApi.getAll(page, pageSize, filters),
    refetchOnMount: 'always',
    enabled: isReady && hasToken(),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateMaintenanceRequest) => maintenanceApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMaintenanceRequest }) =>
      maintenanceApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
    },
  });

  const completeMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CompleteMaintenanceRequest }) =>
      maintenanceApi.complete(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => maintenanceApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
    },
  });

  return {
    maintenance: maintenanceQuery.data,
    isLoading: maintenanceQuery.isLoading,
    error: maintenanceQuery.error,
    createMaintenance: createMutation.mutateAsync,
    updateMaintenance: updateMutation.mutateAsync,
    completeMaintenance: completeMutation.mutateAsync,
    deleteMaintenance: deleteMutation.mutateAsync,
  };
};

export const useMaintenanceById = (id: string) => {
  const isReady = useClientReady();

  return useQuery({
    queryKey: ['maintenance', id],
    queryFn: () => maintenanceApi.getById(id),
    enabled: !!id && isReady && hasToken(),
  });
};

export const useUpcomingMaintenance = (days = 30) => {
  const isReady = useClientReady();

  return useQuery({
    queryKey: ['maintenance', 'upcoming', days],
    queryFn: () => maintenanceApi.getUpcoming(days),
    enabled: isReady && hasToken(),
  });
};

export const useOverdueMaintenance = () => {
  const isReady = useClientReady();

  return useQuery({
    queryKey: ['maintenance', 'overdue'],
    queryFn: () => maintenanceApi.getOverdue(),
    enabled: isReady && hasToken(),
  });
};
