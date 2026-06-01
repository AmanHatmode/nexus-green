// Shared types used across dashboard components

export interface VisionResult {
  success: boolean;
  labels?: string[];
  heatRiskEstimate?: number;
  isSafe?: boolean;
  warning?: string;
  error?: string;
}

export interface ForecastEntry {
  label: string;
  industrial_zone: number;
  urban_core: number;
  green_belt: number;
  risk_score: number;
}

export interface DispatchEntry {
  id: string;
  zone: string;
  units: number;
  status: 'pending' | 'active' | 'complete';
  time: string;
  type: string;
}
