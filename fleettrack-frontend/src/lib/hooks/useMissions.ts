'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { missionsApi } from '@/lib/api/missions';
import { CreateMissionRequest, MissionStatus } from '@/types/mission';

export const useMissions = (page = 1, pageSize = 10, filters?: Record<string, string>) => {
  const queryClient = useQueryClient();

  const missionsQuery = useQuery({
    queryKey: ['missions', page, pageSize, filters],
    queryFn: () => missionsApi.getAll(page, pageSize, filters),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateMissionRequest) => missionsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['missions'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateMissionRequest }) =>
      missionsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['missions'] });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: MissionStatus }) =>
      missionsApi.updateStatus(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['missions'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => missionsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['missions'] });
    },
  });

  return {
    missions: missionsQuery.data,
    isLoading: missionsQuery.isLoading,
    error: missionsQuery.error,
    createMission: createMutation.mutateAsync,
    updateMission: updateMutation.mutateAsync,
    updateMissionStatus: updateStatusMutation.mutateAsync,
    deleteMission: deleteMutation.mutateAsync,
  };
};

export const useMission = (id: string) => {
  return useQuery({
    queryKey: ['mission', id],
    queryFn: () => missionsApi.getById(id),
    enabled: !!id,
  });
};
