import { CompressorTelemetry, ConnectionStatus } from '../types';

type DataCallback = (data: CompressorTelemetry) => void;
type StatusCallback = (status: ConnectionStatus) => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private url: string = '';
  private reconnectTimeout: number | null = null;
  private onDataCallbacks: DataCallback[] = [];
  private onStatusCallbacks: StatusCallback[] = [];
  private isIntentionalClose: boolean = false;

  constructor() {}

  public connect(url: string) {
    // If already connected to the same URL, do nothing
    if (this.ws && this.url === url && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.disconnect();
    this.url = url;
    this.isIntentionalClose = false;
    this.notifyStatus('CONNECTING');

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        this.notifyStatus('CONNECTED');
        console.log(`Connected to ${this.url}`);
      };

      this.ws.onmessage = (event) => {
        try {
          const parsedData = JSON.parse(event.data);
          // Enhance data with local timestamp if not present or stale
          const processedData: CompressorTelemetry = {
            ...parsedData,
            timestamp: parsedData.timestamp || Date.now()
          };
          this.notifyData(processedData);
        } catch (error) {
          console.error('Error parsing WebSocket data:', error);
        }
      };

      this.ws.onclose = () => {
        if (!this.isIntentionalClose) {
          this.notifyStatus('DISCONNECTED');
          console.log('Connection closed. Reconnecting in 3s...');
          this.scheduleReconnect();
        } else {
          this.notifyStatus('DISCONNECTED');
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.notifyStatus('ERROR');
        // onclose will trigger usually after onerror
      };

    } catch (e) {
      console.error('Connection failed synchronously:', e);
      this.notifyStatus('ERROR');
      this.scheduleReconnect();
    }
  }

  public disconnect() {
    this.isIntentionalClose = true;
    if (this.reconnectTimeout) {
      window.clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimeout) return;
    this.reconnectTimeout = window.setTimeout(() => {
      this.reconnectTimeout = null;
      this.connect(this.url);
    }, 3000);
  }

  public subscribeData(callback: DataCallback) {
    this.onDataCallbacks.push(callback);
    return () => {
      this.onDataCallbacks = this.onDataCallbacks.filter(cb => cb !== callback);
    };
  }

  public subscribeStatus(callback: StatusCallback) {
    this.onStatusCallbacks.push(callback);
    return () => {
      this.onStatusCallbacks = this.onStatusCallbacks.filter(cb => cb !== callback);
    };
  }

  private notifyData(data: CompressorTelemetry) {
    this.onDataCallbacks.forEach(cb => cb(data));
  }

  private notifyStatus(status: ConnectionStatus) {
    this.onStatusCallbacks.forEach(cb => cb(status));
  }
}

export const dataService = new WebSocketService();