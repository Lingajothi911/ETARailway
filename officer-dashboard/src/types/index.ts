export interface TrainRow {
  id: number;
  train_number: string;
  train_name: string;
  train_type: string;
  route: string;
  current_location: string;
  next_station: string;
  current_delay_minutes: number;
  speed_kmph: number;
  scheduled_eta: string;
  traditional_eta: string;
  ai_predicted_eta: string;
  ai_predicted_etd: string;
  predicted_delay_minutes: number;
  delay_recovery_minutes: number;
  confidence_score: number;
  platform: string;
  status: string;
  priority: string;
  risk_level: 'Normal' | 'At Risk' | 'Critical' | 'Monitored';
  progress_percentage: number;
  lat: number;
  lng: number;
}

export interface PlatformConflict {
  id: number;
  station_code: string;
  station_name: string;
  platform_number: string;
  train1_number: string;
  train1_name: string;
  train1_eta: string;
  train2_number: string;
  train2_name: string;
  train2_eta: string;
  overlap_minutes: number;
  suggested_platform: string;
  recommendation_reason: string;
  is_resolved: boolean;
  created_at: string;
}

export interface CongestionSection {
  id: number;
  from_station_code: string;
  from_station_name: string;
  to_station_code: string;
  to_station_name: string;
  distance_km: number;
  max_speed_kmph: number;
  current_congestion: 'Normal' | 'Moderate' | 'Heavy';
  congestion_delay_factor: number;
}

export interface AlertItem {
  id: number;
  train_number?: string;
  station_code?: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  title: string;
  description: string;
  recommended_action?: string;
  is_acknowledged: boolean;
  timestamp: string;
}

export interface OfficerKPIs {
  active_trains: number;
  delayed_trains: number;
  at_risk_trains: number;
  critical_delays: number;
  platform_conflicts: number;
  predictions_updated_count: number;
  avg_delay_reduction_minutes: number;
  system_mae_ml: number;
  system_mae_traditional: number;
}

export interface OfficerDashboardData {
  kpis: OfficerKPIs;
  trains: TrainRow[];
  conflicts: PlatformConflict[];
  congestion: CongestionSection[];
  alerts: AlertItem[];
}

export interface EvaluationRecord {
  train_number: string;
  section: string;
  station: string;
  scheduled: string;
  actual: string;
  ai_predicted: string;
  traditional: string;
  ai_error_min: number;
  traditional_error_min: number;
  error_reduction: number;
}

export interface AnalyticsData {
  disclaimer: string;
  summary: {
    total_samples: number;
    mae_ml_minutes: number;
    mae_traditional_minutes: number;
    rmse_ml_minutes: number;
    rmse_traditional_minutes: number;
    accuracy_improvement_pct: number;
  };
  feature_importance: Array<{
    feature: string;
    importance: number;
    description: string;
  }>;
  evaluations: EvaluationRecord[];
}
