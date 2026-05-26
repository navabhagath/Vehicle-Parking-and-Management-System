import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../../../models/User.model';
import { environment } from '../../../env/evironment';

/**
 * Thin wrapper around user-related HTTP endpoints that are NOT part of the
 * core authentication flow. Login, OTP verification, and password reset all
 * live in AuthService because they have side effects on the session.
 */
@Injectable({ providedIn: 'root' })
export class UserDao {
  private readonly AUTH_URL = `${environment.authUrl}`;
  private readonly USER_URL = `${environment.apiUrl}/auth/users`;

  constructor(private http: HttpClient) {}

  // Vendor self-service registration. Backend creates user + wallet + revenue row.
  registerVendor(vendorData: {
    name: string;
    email: string;
    phone: string;
    password: string;
  }): Observable<any> {
    return this.http.post(`${this.AUTH_URL}/vendor/register`, vendorData);
  }

  // Live availability check for registration form async validators.
  checkEmailAvailability(email: string): Observable<{ available: boolean }> {
    const params = new HttpParams().set('email', email);
    return this.http.get<{ available: boolean }>(
      `${this.AUTH_URL}/check-email`,
      { params },
    );
  }

  checkPhoneAvailability(phone: string): Observable<{ available: boolean }> {
    const params = new HttpParams().set('phone', phone);
    return this.http.get<{ available: boolean }>(
      `${this.AUTH_URL}/check-phone`,
      { params },
    );
  }

  // Flip hasPaidSubscription on the current user. Token attached by interceptor.
  updateSubscription(userId: string, status: boolean): Observable<User> {
    return this.http.patch<User>(`${this.USER_URL}/${userId}`, {
      hasPaidSubscription: status,
    });
  }

  // Customer renames themselves after first-time login.
  updateUserName(name: string): Observable<{ success: boolean; message: string; user: User }> {
  return this.http.put<{ success: boolean; message: string; user: User }>(
    `${this.USER_URL}/update-name`,
    { name }
  );
}
}