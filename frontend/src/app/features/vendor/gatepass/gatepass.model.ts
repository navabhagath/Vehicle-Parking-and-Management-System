export interface ParkingLocation {
  id: string;
  vendorId: string;
  locationName: string;
  isActive: boolean;
  geo: {
    type: string;
    coordinates: [number, number];
  };
  operationalDays: string[];
  operationalHours: {
    start: string;
    end: string;
  };
  capacity: {
    twoWheeler: number;
    fourWheeler: number;
  };
  bikePrice: number;
  carPrice: number;
  amenities: string[];
  documents: Record<string, string>;
  approvalStatus: string;
}

export interface Booking {
  id?: string;
  customerId: string;
  vehicleId: string;
  locationId: string;
  plateNumber: string;
  customerName: string;
  type: string;
  scheduledStartTime: string;
  scheduledEndTime: string;
  actualCheckIn: string | null;
  actualCheckOut: string | null;
  finalDeductedAmount: number;
  status: 'CONFIRMED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  qrData?: string;
}