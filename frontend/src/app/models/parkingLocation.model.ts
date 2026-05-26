export interface ParkingLocation {
  id: string;
  vendorId: string;
  locationName: string;
  isActive: boolean;
  geo: {
    type: string;
    coordinates: number[];
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
  bikePrice:number;
  carPrice:number;
  amenities: string[];
  documents: Record<string, string>;
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
}