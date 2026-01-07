'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { alertsApi, AlertFilters } from '@/lib/api/alerts';
import { CreateAlertRequest, AcknowledgeAlertRequest, ResolveAlertRequest } from '@/types/alert';
import { hasToken } from '@/lib/api/client';
import { useClientReady } from './useClientReady';

export const useAlerts = (page = 1, pageSize = 10, filters?: AlertFilters) => {
  const queryClient = useQueryClient();
  const isReady = useClientReady();

  const alertsQuery = useQuery({
    queryKey: ['alerts', page, pageSize, filters],
    queryFn: () => alertsApi.getAll(page, pageSize, filters),
    refetchOnMount: 'always',
    enabled: isReady && hasToken(),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateAlertRequest) => alertsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });

  const acknowledgeMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: AcknowledgeAlertRequest }) =>
      alertsApi.acknowledge(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });

  const resolveMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ResolveAlertRequest }) =>
      alertsApi.resolve(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => alertsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });

  return {
    alerts: alertsQuery.data,
    isLoading: alertsQuery.isLoading,
    error: alertsQuery.error,
    createAlert: createMutation.mutateAsync,
    acknowledgeAlert: acknowledgeMutation.mutateAsync,
    resolveAlert: resolveMutation.mutateAsync,
    deleteAlert: deleteMutation.mutateAsync,
  };
};

export const useAlertById = (id: string) => {
  const isReady = useClientReady();

  return useQuery({
    queryKey: ['alert', id],
    queryFn: () => alertsApi.getById(id),
    enabled: !!id && isReady && hasToken(),
  });
};

export const useUnacknowledgedAlerts = () => {
  const isReady = useClientReady();

  return useQuery({
    queryKey: ['alerts', 'unacknowledged'],
    queryFn: () => alertsApi.getUnacknowledged(),
    enabled: isReady && hasToken(),
  });
};

export const useUnresolvedAlerts = () => {
  const isReady = useClientReady();

  return useQuery({
    queryKey: ['alerts', 'unresolved'],
    queryFn: () => alertsApi.getUnresolved(),
    enabled: isReady && hasToken(),
  });
};

export const useUnacknowledgedCount = () => {
  const isReady = useClientReady();

  return useQuery({
    queryKey: ['alerts', 'unacknowledged', 'count'],
    queryFn: () => alertsApi.getUnacknowledgedCount(),
    refetchInterval: 30000,
    enabled: isReady && hasToken(),
  });
};
