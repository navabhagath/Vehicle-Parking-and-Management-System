export interface Transaction {
  id: string;
  walletId: string;
  bookingId: string | null;
  type: 'RECHARGE' | 'SENT' | 'RECEIVE' | 'DEDUCT' | 'WITHDRAWAL';
  amount: number;
  status: 'SUCCESS' | 'FAILED'; 
  timestamp: string;  
}