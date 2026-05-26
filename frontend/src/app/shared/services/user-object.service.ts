// src/app/customer/services/user-object.service.ts
import { inject, Injectable } from '@angular/core';
import { AuthService } from '../../core/services/auth.service'; 

import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { User } from '../../models/User.model';


@Injectable({
  providedIn: 'root'
})
export class UserObjectService {
  private auth = inject(AuthService);

  get user$(): Observable<User> {
    return this.auth.currentUser$.pipe(
      map(user => this.mapToUser(user))
    );
  }

  getUser(): User {
    return this.mapToUser(this.auth.currentUserValue);
  }

  private mapToUser(data: any): User {
    return {
      id: data?.id || '',
      name: data?.name || 'Guest',
      email: data?.email || null,
      role: (data?.role as any) || 'CUSTOMER',
      phone: data?.phone || '',
      password_hash: data?.password_hash || null,
      accountStatus: (data?.accountStatus as any) || 'ACTIVE',
      isVerified: data?.isVerified || false,
      hasPaidSubscription: data?.hasPaidSubscription || false,
      createdAt: data?.createdAt || new Date().toISOString(),
      permissions:[]
    };
  }
}