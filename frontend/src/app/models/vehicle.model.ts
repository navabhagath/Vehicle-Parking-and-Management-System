export interface Vehicle {
  id: string;
  userId: string;
  plateNumber: string;
  model: string;
  type: '2-WHEELER' | '4-WHEELER';
  isPrimary: boolean;
  name:string;
}