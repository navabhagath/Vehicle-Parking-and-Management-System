export interface Capacity {
  twoWheeler: number;
  fourWheeler: number;
}

export interface OperationalHours {
  start: string;
  end: string;
}

export interface ParkingLocation {
  id: string;
  vendorId: string;
  locationName: string;
  locationId: string;
  isActive: boolean;
  operationalHours: OperationalHours;
  capacity: Capacity;
  basePrice: number;
  approvalStatus: string;
  twoWheeler : number;
  fourWheeler : number;

}

export interface Booking {
  id: string;
  customerId: string;
  vehicleId: string;
  locationId: string;
  scheduledStartTime: string;
  scheduledEndTime: string;
  actualCheckIn: string | null;
  actualCheckOut: string | null;
  status: string;
  plateNumber : string;
  type : string;
  customerName : string;
}


export interface SlotSummary {
  total: number;
  occupied: number;
  free: number;
}

export interface RecentParkingEntry {
  plateNumber: string;
  customerName: string;
  vehicleType: string;
  checkInTime: string;
}

export interface OverviewResponse {
  location: ParkingLocation;
  slotSummary: SlotSummary;
  recentParking: RecentParkingEntry[];
}