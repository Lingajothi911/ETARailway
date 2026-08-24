import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { SimulatorControls } from './components/SimulatorControls';
import { KPICards } from './components/KPICards';
import { LiveFleetTable } from './components/LiveFleetTable';
import { OperationalRailMap } from './components/OperationalRailMap';
import { PlatformConflictPanel } from './components/PlatformConflictPanel';
import { CongestionMonitor } from './components/CongestionMonitor';
import { AlertStream } from './components/AlertStream';
import { PredictionAnalytics } from './components/PredictionAnalytics';
import { InjectDelayModal } from './components/InjectDelayModal';
import { TrainDetailDrawer } from './components/TrainDetailDrawer';
import { LoginModal } from './components/LoginModal';
import { OfficerDashboardData, TrainRow } from './types';
import {
  fetchDashboardData,
  startSimulation,
  pauseSimulation,
  resetSimulation,
  setSimulationSpeed,
  injectDelay,
  resolveConflict,
  acknowledgeAlert
} from './services/api';

export function App() {
  const [data, setData] = useState<OfficerDashboardData | null>(null);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [selectedTrain, setSelectedTrain] = useState<TrainRow | null>(null);
  const [isInjectModalOpen, setIsInjectModalOpen] = useState<boolean>(false);
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(5);
  const [simulatedTime, setSimulatedTime] = useState<string>('22:10:00');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true); // Pre-authenticated for seamless hackathon review
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);

  const wsRef = useRef<WebSocket | null>(null);

  // Initial Data Fetch
  const loadData = async () => {
    try {
      const res = await fetchDashboardData();
      setData(res);
      if (!selectedTrain && res.trains.length > 0) {
        setSelectedTrain(res.trains[0]);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 4000);
    return () => clearInterval(interval);
  }, []);

  // WebSocket Live Stream Connection
  useEffect(() => {
    const connectWS = () => {
      const ws = new WebSocket('ws://localhost:8000/ws/live');
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'SIMULATION_TICK') {
            setSimulatedTime(msg.simulated_time);
            setSpeedMultiplier(msg.speed_multiplier);
            loadData(); // Sync live data
          }
        } catch (e) {
          // ignore
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        setTimeout(connectWS, 3000);
      };

      ws.onerror = () => {
        setIsConnected(false);
      };
    };

    connectWS();
    return () => {
      wsRef.current?.close();
    };
  }, []);

  // Simulation Handlers
  const handlePlay = async () => {
    await startSimulation(speedMultiplier);
    setIsRunning(true);
  };

  const handlePause = async () => {
    await pauseSimulation();
    setIsRunning(false);
  };

  const handleReset = async () => {
    await resetSimulation();
    loadData();
  };

  const handleSpeedChange = async (speed: number) => {
    setSpeedMultiplier(speed);
    await setSimulationSpeed(speed);
  };

  const handleInjectDelay = async (trainNumber: string, addedMinutes: number) => {
    await injectDelay(trainNumber, addedMinutes);
    loadData();
  };

  const handleResolveConflict = async (conflictId: number) => {
    await resolveConflict(conflictId);
    loadData();
  };

  const handleAckAlert = async (alertId: number) => {
    await acknowledgeAlert(alertId);
    loadData();
  };

  if (!data) {
    return (
      <div className="min-h-screen bg-[#070b14] flex items-center justify-center text-cyan-400 font-mono text-sm">
        <div className="flex items-center space-x-3">
          <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          <span>INITIALIZING RAILPREDICT DISPATCH CONTROL ROOM...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      {/* Header Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        simulatedTime={simulatedTime}
        isConnected={isConnected}
        conflictCount={data.conflicts.filter((c) => !c.is_resolved).length}
        alertCount={data.alerts.filter((a) => !a.is_acknowledged).length}
        onLogout={() => setShowLoginModal(true)}
      />

      {/* Main Container */}
      <main className="flex-1 p-4 max-w-7xl mx-auto w-full space-y-4">
        {/* Simulator Control Toolbar */}
        <SimulatorControls
          isRunning={isRunning}
          speedMultiplier={speedMultiplier}
          onPlay={handlePlay}
          onPause={handlePause}
          onReset={handleReset}
          onSpeedChange={handleSpeedChange}
          onOpenInjectDelay={() => setIsInjectModalOpen(true)}
        />

        {/* Top KPI Summary Cards */}
        <KPICards kpis={data.kpis} onSelectMetric={(m) => setActiveTab(m)} />

        {/* Tab 1: Overview (Matrix + Map + Platform Alert) */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Live Operational Rail Map */}
            <OperationalRailMap
              trains={data.trains}
              selectedTrain={selectedTrain}
              onSelectTrain={(t) => setSelectedTrain(t)}
            />

            {/* Platform Conflict Alert Banner if conflicts exist */}
            {data.conflicts.some((c) => !c.is_resolved) && (
              <PlatformConflictPanel
                conflicts={data.conflicts}
                onResolveConflict={handleResolveConflict}
              />
            )}

            {/* Dense Live Fleet Table */}
            <LiveFleetTable
              trains={data.trains}
              onSelectTrain={(t) => setSelectedTrain(t)}
              selectedTrainId={selectedTrain?.id}
            />
          </div>
        )}

        {/* Tab 2: Fleet & Live Route Map */}
        {activeTab === 'fleet' && (
          <div className="space-y-4">
            <OperationalRailMap
              trains={data.trains}
              selectedTrain={selectedTrain}
              onSelectTrain={(t) => setSelectedTrain(t)}
            />
            <LiveFleetTable
              trains={data.trains}
              onSelectTrain={(t) => setSelectedTrain(t)}
              selectedTrainId={selectedTrain?.id}
            />
          </div>
        )}

        {/* Tab 3: Platform Management & Overlap Conflict Detection */}
        {activeTab === 'platforms' && (
          <PlatformConflictPanel
            conflicts={data.conflicts}
            onResolveConflict={handleResolveConflict}
          />
        )}

        {/* Tab 4: Section Congestion Monitor */}
        {activeTab === 'congestion' && <CongestionMonitor sections={data.congestion} />}

        {/* Tab 5: AI Prediction Analytics */}
        {activeTab === 'analytics' && <PredictionAnalytics />}

        {/* Tab 6: Operational Alerts */}
        {activeTab === 'alerts' && (
          <AlertStream alerts={data.alerts} onAcknowledgeAlert={handleAckAlert} />
        )}
      </main>

      {/* Train Detail Inspection Drawer */}
      <TrainDetailDrawer
        train={selectedTrain}
        onClose={() => setSelectedTrain(null)}
      />

      {/* Live Delay Injection Modal */}
      <InjectDelayModal
        isOpen={isInjectModalOpen}
        onClose={() => setIsInjectModalOpen(false)}
        trains={data.trains}
        onInject={handleInjectDelay}
      />

      {/* Officer Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onLoginSuccess={() => setShowLoginModal(false)}
      />
    </div>
  );
}

export default App;
