import { OfficerDashboardData, AnalyticsData, PlatformConflict } from '../types';

const API_BASE = 'http://localhost:8000/api';

export const fetchDashboardData = async (): Promise<OfficerDashboardData> => {
  const res = await fetch(`${API_BASE}/officer/dashboard`);
  if (!res.ok) throw new Error('Failed to fetch officer dashboard');
  return res.json();
};

export const fetchAnalyticsData = async (): Promise<AnalyticsData> => {
  const res = await fetch(`${API_BASE}/officer/analytics`);
  if (!res.ok) throw new Error('Failed to fetch analytics');
  return res.json();
};

export const resolveConflict = async (conflictId: number): Promise<any> => {
  const res = await fetch(`${API_BASE}/officer/conflicts/${conflictId}/resolve`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Failed to resolve conflict');
  return res.json();
};

export const acknowledgeAlert = async (alertId: number): Promise<any> => {
  const res = await fetch(`${API_BASE}/officer/alerts/${alertId}/ack`, {
    method: 'POST'
  });
  return res.json();
};

export const startSimulation = async (speed: number = 5): Promise<any> => {
  const res = await fetch(`${API_BASE}/simulation/start?speed=${speed}`, {
    method: 'POST'
  });
  return res.json();
};

export const pauseSimulation = async (): Promise<any> => {
  const res = await fetch(`${API_BASE}/simulation/pause`, {
    method: 'POST'
  });
  return res.json();
};

export const resetSimulation = async (): Promise<any> => {
  const res = await fetch(`${API_BASE}/simulation/reset`, {
    method: 'POST'
  });
  return res.json();
};

export const setSimulationSpeed = async (speed: number): Promise<any> => {
  const res = await fetch(`${API_BASE}/simulation/speed?speed=${speed}`, {
    method: 'POST'
  });
  return res.json();
};

export const injectDelay = async (trainNumber: string, addedDelay: number): Promise<any> => {
  const res = await fetch(`${API_BASE}/simulation/inject_delay`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'inject_delay',
      train_number: trainNumber,
      added_delay_minutes: addedDelay
    })
  });
  return res.json();
};
