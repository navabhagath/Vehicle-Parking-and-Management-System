
export interface RevenueStat {
  label: string;
  value: number;
  icon: string;
  color: string;
  bg: string;
}

export interface RevenueStatsResponse {
  today: number;
  month: number;
  year: number;
  total: number;
}

export type VehiclePeriod = 'today' | 'last7' | 'last15' | 'last30';

export interface VehiclePieData {
  twoWheelerRev: number;
  fourWheelerRev: number;
  twoWheelerCount: number;
  fourWheelerCount: number;
}

export type BarRange = 'week' | 'month' | 'year';

export interface BarChartData {
  labels: string[];
  data: number[];
}
