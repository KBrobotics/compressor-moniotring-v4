export interface CompressorTelemetry {
  timestamp: number;
  pressure: number;    // bar
  flow: number;        // m3/min
  temperature: number; // Celsius
  power: number;       // kW
  voltage: number;     // V
  current: number;     // A
  status: 'RUNNING' | 'STOPPED' | 'ALARM' | 'IDLE';
  totalHours: number;
}

export type ConnectionStatus = 'CONNECTED' | 'DISCONNECTED' | 'CONNECTING' | 'ERROR';

export interface MetricLimit {
  min: number;
  max: number;
  unit: string;
  label: string;
}

export const METRIC_LIMITS: Record<keyof Omit<CompressorTelemetry, 'timestamp' | 'status' | 'totalHours'>, MetricLimit> = {
  pressure: { min: 0, max: 15, unit: 'bar', label: 'Ciśnienie' },
  flow: { min: 0, max: 20, unit: 'm³/min', label: 'Przepływ' },
  temperature: { min: 0, max: 120, unit: '°C', label: 'Temperatura' },
  power: { min: 0, max: 100, unit: 'kW', label: 'Moc' },
  voltage: { min: 380, max: 420, unit: 'V', label: 'Napięcie' },
  current: { min: 0, max: 200, unit: 'A', label: 'Prąd' },
};