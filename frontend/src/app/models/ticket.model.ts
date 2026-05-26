export interface Ticket {
  id: string;
  creatorId: string;
  handlerId: string;
  bookingId: string | null;
  subject: string;
  description: string;
  category: 'CLAIM_MONEY' | 'SUPPORT' | 'DISPUTE';
  status: 'OPEN' | 'IN_PROGRESS' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  emailId:string;
}