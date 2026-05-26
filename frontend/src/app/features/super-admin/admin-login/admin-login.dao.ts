import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable,of,delay } from 'rxjs';
// import { User } from '../models/User.model';

import { environment } from '../../../env/evironment';
import { User } from '../../../models/User.model';
import { Wallet } from '../../../models/Wallet.model';


@Injectable({ providedIn: 'root' })
export class VendorDao {
  private readonly API_URL = `${environment.apiUrl}/user`;

  constructor(private http: HttpClient) {}

  // Find user by Email (Vendor/Admin)
  getVendorByEmail(email: string): Observable<User[]> {
    const params = new HttpParams().set('email', email);
    return this.http.get<User[]>(this.API_URL, { params });
  }

  // Vendor Registration
  registerVendor(vendorData: User): Observable<User> {
    return this.http.post<User>(this.API_URL, vendorData);
  }


  requestOtp(phone: string): Observable<{ success: boolean; message: string }> {
    console.log(`[MOCK API] Simulating SMS sent to ${phone}`);

    // return this.http.post<{success: boolean}>(`${this.API_URL}/request-otp`, { phone });
    return of({ success: true, message: 'OTP sent successfully' }).pipe(delay(1000));
  }

  // Find user by Phone (For Customer)
  getUserByPhone(phone: string): Observable<User[]> {
    const params = new HttpParams().set('phone', phone);
    return this.http.get<User[]>(this.API_URL, { params });
  }

  // new Customer
  registerCustomer(customerData: User): Observable<User>{
    return this.http.post<User>(this.API_URL, customerData);
  }

  // Update the subscription flag
  updateSubscription(userId: string, status: boolean): Observable<User> {
    return this.http.patch<User>(`${this.API_URL}/${userId}`, {
      hasPaidSubscription: status
    });
  }

  updateVendorPassword(userId: string, newPasswordHash: string): Observable<User> {
    return this.http.patch<User>(`${this.API_URL}/${userId}`, {
      password_hash: newPasswordHash
    });
  }

  createWallet(walletData: any): Observable<Wallet> {
  // Assuming your environment.apiUrl points to localhost:3000
  return this.http.post<Wallet>(`${environment.apiUrl}/wallet`, walletData);
}


}