import React, { useState, useEffect, useCallback } from 'react';
import { CompressorTelemetry, METRIC_LIMITS, ConnectionStatus } from './types';
import { dataService } from './services/dataService';
import MetricCard from './components/MetricCard';
import HistoryChart from './components/HistoryChart';
import CompressorVisual from './components/CompressorVisual';
import SettingsModal from './components/SettingsModal';

// Icons
const IconThermometer = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;
const IconZap = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
const IconGauge = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const IconWind = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const IconGear = () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;

const MAX_HISTORY_POINTS = 50;
const DEFAULT_WS_URL = 'ws://localhost:1880/ws/compressor';

// Initial Empty State
const INITIAL_DATA: CompressorTelemetry = {
  timestamp: Date.now(),
  pressure: undefined,
  flow: undefined,
  temperature: undefined,
  power: undefined,
  voltage: undefined,
  current: undefined,
  status: undefined,
  totalHours: undefined
};

function App() {
  const [data, setData] = useState<CompressorTelemetry>(INITIAL_DATA);
  const [history, setHistory] = useState<CompressorTelemetry[]>([]);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [isKioskActive, setIsKioskActive] = useState(true);
  
  // Settings & Connection State
  const [showSettings, setShowSettings] = useState(false);
  const [wsUrl, setWsUrl] = useState<string>(() => localStorage.getItem('compressor_ws_url') || DEFAULT_WS_URL);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('DISCONNECTED');
  const [lastDataReceivedTime, setLastDataReceivedTime] = useState<number>(0);

  // Clock Update
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleString('pl-PL', { 
        weekday: 'short', 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit', 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
      }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // WebSocket Connection Logic
  useEffect(() => {
    if (!isKioskActive) {
      dataService.disconnect();
      return;
    }

    const unsubscribeStatus = dataService.subscribeStatus((status) => {
      setConnectionStatus(status);
    });

    const unsubscribeData = dataService.subscribeData((partialData) => {
      setLastDataReceivedTime(Date.now());
      
      // MERGE LOGIC:
      // We take the previous state and overwrite ONLY the keys that came in the new packet.
      // This allows the PLC to send { pressure: 7.0 } without resetting temperature.
      setData(prevData => {
        const mergedData = {
          ...prevData,
          ...partialData,
          timestamp: partialData.timestamp || Date.now() // Ensure timestamp is fresh
        };
        
        // Update history with the merged snapshot
        setHistory(prevHistory => {
          const newHistory = [...prevHistory, mergedData];
          if (newHistory.length > MAX_HISTORY_POINTS) {
            return newHistory.slice(newHistory.length - MAX_HISTORY_POINTS);
          }
          return newHistory;
        });

        return mergedData;
      });
    });

    dataService.connect(wsUrl);

    return () => {
      unsubscribeStatus();
      unsubscribeData();
      dataService.disconnect();
    };
  }, [isKioskActive, wsUrl]);

  const handleExit = useCallback(() => {
    if (confirm('Czy na pewno chcesz zamknąć wizualizację i przejść do systemu?')) {
      setIsKioskActive(false);
      try {
        window.close();
      } catch (e) {
        console.log("Window close blocked by browser security.");
      }
    }
  }, []);

  const handleRestart = () => {
    setIsKioskActive(true);
    setHistory([]);
  };

  const handleSaveSettings = (newUrl: string) => {
    setWsUrl(newUrl);
    localStorage.setItem('compressor_ws_url', newUrl);
  };

  const getConnectionColor = () => {
    switch(connectionStatus) {
      case 'CONNECTED': return 'bg-industrial-success shadow-[0_0_10px_#22c55e]';
      case 'CONNECTING': return 'bg-industrial-warning animate-pulse';
      case 'ERROR': return 'bg-industrial-danger';
      default: return 'bg-gray-500';
    }
  };

  const getConnectionText = () => {
    switch(connectionStatus) {
      case 'CONNECTED': return 'ONLINE';
      case 'CONNECTING': return 'ŁĄCZENIE...';
      case 'ERROR': return 'BŁĄD';
      default: return 'OFFLINE';
    }
  };

  // Determine if we have at least SOME valid data to display
  const hasAnyData = lastDataReceivedTime > 0;

  if (!isKioskActive) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-gray-400 p-8 text-center">
        <h1 className="text-4xl font-bold mb-4 text-white">System Zatrzymany</h1>
        <p className="mb-8 max-w-md">Wizualizacja została zamknięta. Możesz teraz korzystać z systemu operacyjnego Raspberry Pi (Raspbian).</p>
        
        <div className="flex gap-4">
          <button 
            onClick={handleRestart}
            className="px-6 py-3 bg-industrial-700 hover:bg-industrial-600 text-white rounded font-bold transition-colors"
          >
            Uruchom ponownie wizualizację
          </button>
          <button 
             onClick={() => window.location.reload()}
             className="px-6 py-3 bg-industrial-danger hover:bg-red-600 text-white rounded font-bold transition-colors"
          >
             Przeładuj stronę
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-6 lg:p-8 gap-6 max-w-[1920px] mx-auto">
      
      <SettingsModal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
        currentUrl={wsUrl}
        onSave={handleSaveSettings}
      />

      {/* Header */}
      <header className="flex justify-between items-center bg-industrial-800 p-4 rounded-lg border border-industrial-700 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-3 h-12 bg-industrial-accent rounded-full"></div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">MONITORING KOMPRESORA</h1>
            <div className="flex items-center gap-2 mt-1">
              <div className={`w-2 h-2 rounded-full ${getConnectionColor()}`}></div>
              <p className="text-xs text-gray-400 font-mono">{getConnectionText()} ({wsUrl})</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right hidden sm:block">
            <div className="text-2xl font-mono font-bold text-industrial-accent">{currentTime}</div>
            <div className="text-xs text-gray-500 uppercase tracking-widest">System Czasu Rzeczywistego</div>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={() => setShowSettings(true)}
              className="bg-industrial-700 hover:bg-industrial-600 text-white p-3 rounded-lg transition-colors border border-industrial-600"
              title="Ustawienia"
            >
              <IconGear />
            </button>

            <button 
              onClick={handleExit}
              className="bg-industrial-700 hover:bg-industrial-danger text-white p-3 rounded-lg transition-colors border border-industrial-600"
              title="Zamknij Wizualizację"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        
        {/* Left Column: Visual & Status */}
        <div className="lg:col-span-1 xl:col-span-1 flex flex-col gap-6">
          {/* Always render visual, even if status is undefined */}
          <CompressorVisual status={data.status} />
          
          <div className="bg-industrial-800 p-4 rounded-lg border border-industrial-700 flex-1">
            <h3 className="text-gray-400 text-sm font-semibold uppercase mb-4">Statystyki Pracy</h3>
            <div className="space-y-4">
                <div className="flex justify-between border-b border-industrial-700 pb-2">
                    <span className="text-gray-300">Całkowity czas:</span>
                    <span className="font-mono text-industrial-accent">
                      {data.totalHours !== undefined ? `${data.totalHours.toFixed(1)} h` : '---'}
                    </span>
                </div>
                <div className="flex justify-between border-b border-industrial-700 pb-2">
                    <span className="text-gray-300">Serwis za:</span>
                    <span className="font-mono text-industrial-warning">450 h</span>
                </div>
                <div className="mt-4 p-3 bg-industrial-900 rounded border border-industrial-700">
                  <span className="text-xs text-gray-500 block mb-1">Ostatni Komunikat</span>
                  <span className="text-sm text-white">
                    {!hasAnyData ? 'Oczekiwanie na dane PLC...' : 
                     data.status === 'ALARM' ? 'WYKRYTO BŁĄD!' :
                     data.status === 'RUNNING' ? 'System pracuje poprawnie.' : 'System w stanie spoczynku.'}
                  </span>
                </div>
            </div>
          </div>
        </div>

        {/* Center/Right: Metrics Grid */}
        <div className="lg:col-span-2 xl:col-span-3 flex flex-col gap-6">
            
            {/* Primary Gauges Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <MetricCard 
                label={METRIC_LIMITS.pressure.label}
                value={data.pressure}
                unit={METRIC_LIMITS.pressure.unit}
                min={METRIC_LIMITS.pressure.min}
                max={METRIC_LIMITS.pressure.max}
                icon={<IconGauge />}
                warning={data.pressure !== undefined && data.pressure > 13}
              />
              <MetricCard 
                label={METRIC_LIMITS.temperature.label}
                value={data.temperature}
                unit={METRIC_LIMITS.temperature.unit}
                min={METRIC_LIMITS.temperature.min}
                max={METRIC_LIMITS.temperature.max}
                icon={<IconThermometer />}
                warning={data.temperature !== undefined && data.temperature > 100}
              />
              <MetricCard 
                label={METRIC_LIMITS.flow.label}
                value={data.flow}
                unit={METRIC_LIMITS.flow.unit}
                min={METRIC_LIMITS.flow.min}
                max={METRIC_LIMITS.flow.max}
                icon={<IconWind />}
              />
            </div>

            {/* Electrical Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <MetricCard 
                  label={METRIC_LIMITS.power.label}
                  value={data.power}
                  unit={METRIC_LIMITS.power.unit}
                  min={METRIC_LIMITS.power.min}
                  max={METRIC_LIMITS.power.max}
                  icon={<IconZap />}
                />
                <MetricCard 
                  label={METRIC_LIMITS.voltage.label}
                  value={data.voltage}
                  unit={METRIC_LIMITS.voltage.unit}
                  min={METRIC_LIMITS.voltage.min}
                  max={METRIC_LIMITS.voltage.max}
                />
                <MetricCard 
                  label={METRIC_LIMITS.current.label}
                  value={data.current}
                  unit={METRIC_LIMITS.current.unit}
                  min={METRIC_LIMITS.current.min}
                  max={METRIC_LIMITS.current.max}
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 flex-1 min-h-[250px]">
                <HistoryChart 
                  data={history} 
                  dataKey="pressure" 
                  color="#0ea5e9" 
                  unit="bar"
                  title="Historia Ciśnienia"
                />
                <HistoryChart 
                  data={history} 
                  dataKey="power" 
                  color="#f59e0b" 
                  unit="kW"
                  title="Zużycie Energii"
                />
            </div>

        </div>
      </main>
    </div>
  );
}

export default App;
