export interface Capacity {
  twoWheeler: number;
  fourWheeler: number;
}

export interface OperationalHours {
  start: string;
  end: string;
}

export interface VendorDocuments {
  gstDocument: string;
}

export interface LocationDetail {
  locationId: string;                   
  locationName: string;
  approvalStatus: string;
  bikePrice: number;
  carPrice: number;
  capacity: Capacity;
  amenities: string[];
  operationalHours: OperationalHours;
  documents: VendorDocuments;
  isActive: boolean;
}

export interface Vendor {
  vendorId : string;
  name: string;
  email: string;
  phone: string;
  isVerified: boolean;
  createdAt: Date; 
  status: string;
  locationDetails: LocationDetail[];
}

