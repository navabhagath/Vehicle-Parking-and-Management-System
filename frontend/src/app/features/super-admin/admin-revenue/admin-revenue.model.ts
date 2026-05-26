export interface RevenueRecord {
  vendorId: string;
  vendorName: string;
  vendorEmail: string | null; 
  locationName: string;
  amount: number;
  paymentDate: Date;          
  expiryDate: Date;           
  status: 'Active' | 'Expiring Soon' | 'Overdue'; 
}