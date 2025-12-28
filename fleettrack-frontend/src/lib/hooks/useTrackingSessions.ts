'use client';

import { useState, useEffect, useCallback } from 'react';

export interface TrackingSession {
  vehicleId: string;
  vehicleName?: string;
  startedAt: string;
  lastUpdate: string;
  positionsCount: number;
  isActive: boolean;
}

const STORAGE_KEY = 'fleettrack_tracking_sessions';

export const useTrackingSessions = () => {
  const [sessions, setSessions] = useState<Map<string, TrackingSession>>(new Map());

  // Load sessions from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as TrackingSession[];
        const sessionsMap = new Map<string, TrackingSession>();
        parsed.forEach((session) => {
          // Mark as inactive initially - will be updated when data comes in
          sessionsMap.set(session.vehicleId, { ...session, isActive: false });
        });
        setSessions(sessionsMap);
      }
    } catch (e) {
      console.error('Failed to load tracking sessions:', e);
    }
  }, []);

  // Save sessions to localStorage whenever they change
  const saveSessions = useCallback((sessionsMap: Map<string, TrackingSession>) => {
    if (typeof window === 'undefined') return;

    try {
      const sessionsArray = Array.from(sessionsMap.values());
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionsArray));
    } catch (e) {
      console.error('Failed to save tracking sessions:', e);
    }
  }, []);

  // Update or create a session when position is received
  const updateSession = useCallback((vehicleId: string, vehicleName?: string) => {
    setSessions((prev) => {
      const newSessions = new Map(prev);
      const existing = newSessions.get(vehicleId);
      const now = new Date().toISOString();

      if (existing) {
        newSessions.set(vehicleId, {
          ...existing,
          vehicleName: vehicleName || existing.vehicleName,
          lastUpdate: now,
          positionsCount: existing.positionsCount + 1,
          isActive: true,
        });
      } else {
        newSessions.set(vehicleId, {
          vehicleId,
          vehicleName,
          startedAt: now,
          lastUpdate: now,
          positionsCount: 1,
          isActive: true,
        });
      }

      saveSessions(newSessions);
      return newSessions;
    });
  }, [saveSessions]);

  // Mark session as inactive (when no updates for a while)
  const markInactive = useCallback((vehicleId: string) => {
    setSessions((prev) => {
      const newSessions = new Map(prev);
      const existing = newSessions.get(vehicleId);

      if (existing) {
        newSessions.set(vehicleId, {
          ...existing,
          isActive: false,
        });
        saveSessions(newSessions);
      }

      return newSessions;
    });
  }, [saveSessions]);

  // Remove a session completely
  const removeSession = useCallback((vehicleId: string) => {
    setSessions((prev) => {
      const newSessions = new Map(prev);
      newSessions.delete(vehicleId);
      saveSessions(newSessions);
      return newSessions;
    });
  }, [saveSessions]);

  // Clear all sessions
  const clearAllSessions = useCallback(() => {
    setSessions(new Map());
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  // Get session by vehicleId
  const getSession = useCallback((vehicleId: string) => {
    return sessions.get(vehicleId);
  }, [sessions]);

  // Get all active sessions
  const getActiveSessions = useCallback(() => {
    return Array.from(sessions.values()).filter((s) => s.isActive);
  }, [sessions]);

  // Get all sessions sorted by last update
  const getAllSessions = useCallback(() => {
    return Array.from(sessions.values()).sort(
      (a, b) => new Date(b.lastUpdate).getTime() - new Date(a.lastUpdate).getTime()
    );
  }, [sessions]);

  return {
    sessions,
    updateSession,
    markInactive,
    removeSession,
    clearAllSessions,
    getSession,
    getActiveSessions,
    getAllSessions,
  };
};
