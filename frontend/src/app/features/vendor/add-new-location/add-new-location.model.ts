export interface Geo {
  type: string;
  coordinates: [number, number];  // [longitude, latitude]
}

export interface OperationalHours {
  start: string;
  end: string;
}

export interface Capacity {
  twoWheeler: number;
  fourWheeler: number;
}

export interface Documents {
  gstDocument: string;
}

export interface NewLocation {
  locationName: string;
  geo: Geo;
  operationalDays: string[];
  operationalHours: OperationalHours;
  capacity: Capacity;
  bikePrice: number;
  carPrice: number;
  amenities: string[];
  vendorId: string;
  documents: Documents;
}
export interface LocationResponse extends NewLocation {
  id: string;
  isActive: boolean;
  approvalStatus: string;
}

export interface UploadGstResponse {
  message: string;
  url: string;
  filename: string;
}

export interface CreateLocationResponse {
  message: string;
  data: LocationResponse;
}