export interface Booking {
  id: string;
  customerId: string;
  vehicleId: string;
  locationId: string;
  customerName:string;
  plateNumber:string;
  type:'2-WHEELER'|'4-WHEELER'
  scheduledStartTime: string;
  scheduledEndTime: string;
  actualCheckIn: string | null;
  actualCheckOut: string | null;
  finalDeductedAmount: number;
  status: 'CONFIRMED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  qrData: string;
}