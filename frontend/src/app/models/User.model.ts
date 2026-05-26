export type userRole = 'CUSTOMER' | 'VENDOR' | 'SUPER_ADMIN';

export interface User {
  id: string;
  name: string;
  role: userRole;
  email: string | null;
  phone: string;
  password_hash: string | null;
  accountStatus: 'ACTIVE' | 'SUSPENDED' | 'QUIT';
  isVerified: boolean;
  hasPaidSubscription: boolean;
  permissions: string[];
  createdAt: string;
}
