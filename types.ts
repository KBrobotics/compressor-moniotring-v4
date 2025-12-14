export interface CompressorTelemetry {
  timestamp: number;
  pressure?: number;    // bar (opcjonalne)
  flow?: number;        // m3/min (opcjonalne)
  temperature?: number; // Celsius (opcjonalne)
  power?: number;       // kW (opcjonalne)
  voltage?: number;     // V (opcjonalne)
  current?: number;     // A (opcjonalne)
  status?: 'RUNNING' | 'STOPPED' | 'ALARM' | 'IDLE'; // (opcjonalne)
  totalHours?: number;  // (opcjonalne)
}

export type ConnectionStatus = 'CONNECTED' | 'DISCONNECTED' | 'CONNECTING' | 'ERROR';

export interface MetricLimit {
  min: number;
  max: number;
  unit: string;
  label: string;
}

// Helper type to ensure keys match, but values are MetricLimit
export const METRIC_LIMITS: Record<string, MetricLimit> = {
  pressure: { min: 0, max: 15, unit: 'bar', label: 'Ciśnienie' },
  flow: { min: 0, max: 20, unit: 'm³/min', label: 'Przepływ' },
  temperature: { min: 0, max: 120, unit: '°C', label: 'Temperatura' },
  power: { min: 0, max: 100, unit: 'kW', label: 'Moc' },
  voltage: { min: 380, max: 420, unit: 'V', label: 'Napięcie' },
  current: { min: 0, max: 200, unit: 'A', label: 'Prąd' },
};
