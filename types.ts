export interface SensorDataPoint {
  timestamp: number;
  dateStr: string;
  ambientTemp: number;
  pressure: number;
  humidity: number;
  surfaceTemp: number;
  acoustics: number;
  battery: number;
  velX: number;
  velY: number;
  velZ: number;
}

export interface DataSummary {
  totalPoints: number;
  startTime: string;
  endTime: string;
  maxVelocity: number;
  avgTemp: number;
  anomalies: number;
}

export enum ViewMode {
  UPLOAD = 'UPLOAD',
  DASHBOARD = 'DASHBOARD'
}
