
export interface Capacity {
  twoWheeler: number;
  fourWheeler: number;
}

export interface OperationalHours {
  start: string;
  end: string;
}

export type ApprovalStatus = 'APPROVED' | 'PENDING' | 'REJECTED';

export interface ParkingLocation {
  id: string;
  vendorId: string;
  locationName: string;
  isActive: boolean;
  operationalHours: OperationalHours;
  capacity: Capacity;
  bikePrice : number;
  carPrice : number;
  approvalStatus: ApprovalStatus;
  twoWheeler : number;
  fourWheeler : number;
}

export interface Booking {
  id: string;
  locationId: string;
  status: string;
}

export interface DashboardResponse {
  locations: ParkingLocation[];
  occupancyMap: { [key: string]: number };
  activeCount: number;
  totalSlots: number;
  totalOccupied: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface SubscriptionStatus {
  daysLeft: number;
  isExpired: boolean;
  showWarning: boolean;
}