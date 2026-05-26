

export interface RawUser {
  id: string;
  name: string;
  role: 'SUPER_ADMIN' | 'VENDOR' | 'CUSTOMER';
  email: string | null;
  phone: string;
  accountStatus: string;
  [key: string]: any; 
}

export interface RawRevenue {
  vendor_id : string;
  rev_id: string;
  amount: string | number;
  credited_on: string;
}

export interface MonthlyAnalysis {
  month: string;
  amount: number;
}

export interface DashboardStats {
  totalVendors: number;
  totalRevenue: number;
  monthlyAnalysis: MonthlyAnalysis[];
}