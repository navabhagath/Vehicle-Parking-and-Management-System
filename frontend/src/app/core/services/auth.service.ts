import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {
  BehaviorSubject,
  Observable,
  map,
  tap,
  throwError,
  catchError,
} from 'rxjs';
import { User } from '../../models/User.model';
import { environment } from '../../env/evironment';
 
// Shape of the standard backend response envelope.
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
 
interface LoginPayload {
  token: string;
  user: User;
  isNewUser?: boolean;
}
 
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly AUTH_URL = `${environment.authUrl}`;
 
  // ---- Session state ----
  private currentUserSubject = new BehaviorSubject<User | null>(
    this.loadUserFromStorage(),
  );
  public currentUser$ = this.currentUserSubject.asObservable();

  private resetToken: string | null = null;
  public tempEmail = '';
  private tempRole: string | null = null;
 
  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  get isLoggedIn(): boolean {
    return !!this.getToken() && !!this.currentUserSubject.value;
  }
 
  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }
 
  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  requestOtp(phone: string): Observable<any> {
    const fullPhone = phone.startsWith('+91') ? phone : '+91' + phone;
    return this.http.post(`${this.AUTH_URL}/customer/request-otp`, {
      phone: fullPhone,
    });
  }
 
  login(credentials: {
    email?: string;
    password?: string;
    phone?: string;
    otp?: string;
    expectedRole?: string;
  }): Observable<User> {
    // Vendor / Admin path
    if (credentials.email && credentials.password) {
      const endpoint =
        credentials.expectedRole === 'SUPER_ADMIN'
          ? `${this.AUTH_URL}/super_admin/login`
          : `${this.AUTH_URL}/vendor/login`;
 
      return this.http
        .post<ApiResponse<LoginPayload>>(endpoint, {
          email: credentials.email.toLowerCase(),
          password: credentials.password,
        })
        .pipe(
          map((res) => res.data),
          tap((data) => this.finalizeLogin(data.user, data.token)),
          map((data) => data.user),
          catchError(this.handleHttpError),
        );
    }
 
    // Customer path
    if (credentials.phone && credentials.otp) {
      const fullPhone = credentials.phone.startsWith('+91')
        ? credentials.phone
        : '+91' + credentials.phone;
 
      return this.http
        .post<ApiResponse<LoginPayload>>(`${this.AUTH_URL}/customer/verify-otp`, {
          phone: fullPhone,
          otp: credentials.otp,
        })
        .pipe(
          map((res) => res.data),
          tap((data) => this.finalizeLogin(data.user, data.token)),
          map((data) => data.user),
          catchError(this.handleHttpError),
        );
    }
 
    return throwError(() => new Error('Invalid login credentials shape.'));
  }
 // for vendors and super admin

  requestPasswordResetOtp(
    email: string,
    expectedRole: string,
  ): Observable<any> {
    this.tempEmail = email.toLowerCase();
    this.tempRole = expectedRole;
    return this.http
      .post(`${this.AUTH_URL}/forgot-password`, {
        email: this.tempEmail,
        role: expectedRole,
      })
      .pipe(catchError(this.handleHttpError));
  }
 
  verifyPasswordResetOtp(otpCode: string): Observable<boolean> {
    return this.http
      .post<{ success: boolean; resetToken: string; message: string }>(
        `${this.AUTH_URL}/verify-reset-otp`,
        {
          email: this.tempEmail,
          otp: otpCode,
          role: this.tempRole,
        },
      )
      .pipe(
        tap((res) => {
          this.resetToken = res.resetToken;
        }),
        map((res) => res.success),
        catchError(() => {
          // Match old API: emit false instead of throwing on invalid OTP.
          return [false];
        }),
      );
  }
 
  resetUserPassword(_email: string, newPassword: string): Observable<any> {
    if (!this.resetToken) {
      return throwError(
        () => new Error('Reset session expired. Please request a new OTP.'),
      );
    }
    return this.http
      .post(`${this.AUTH_URL}/reset-password`, {
        resetToken: this.resetToken,
        newPassword,
      })
      .pipe(
        tap(() => {
          this.resetToken = null;
          this.tempEmail = '';
          this.tempRole = null;
        }),
        catchError(this.handleHttpError),
      );
  }
 
  hasPermission(permission: string): boolean {
  const user = this.currentUserValue;
  if (!user) return false;
  if (user.role === 'SUPER_ADMIN') return true;
  return (user.permissions || []).includes(permission);
  }
 
  // for customer when they are renaming
  public updateCurrentUser(user: User): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }
 
  public forceLogout(): void {
    this.clearSession();
    this.router.navigate(['/']);
  }
 
  logout(): void {
    const role = this.currentUserValue?.role;
    this.clearSession();
    if (role === 'SUPER_ADMIN') {
      this.router.navigate(['/super_admin/login']);
    } else if(role === 'VENDOR'){
      this.router.navigate(['/vendor/login']);
    }else{
      this.router.navigate(['/customer/login']);
    }
  }
 
  private finalizeLogin(user: User, token: string): void {
    localStorage.setItem('authToken', token);
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSubject.next(user);
    this.resetToken = null;
    this.tempEmail = '';
    this.tempRole = null;
  }
 
  private clearSession(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.resetToken = null;
    this.tempEmail = '';
    this.tempRole = null;
  }
 
  private loadUserFromStorage(): User | null {
    try {
      const raw = localStorage.getItem('currentUser');
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  }
 
  refreshCurrentUser(): Observable<User> {
  return this.http
    .get<User>(`${environment.apiUrl}/auth/users/me`)
    .pipe(
      tap((user) => this.updateCurrentUser(user)),
      catchError((error) => {
        // 401/403 means our session is dead; the interceptor will handle
        // the redirect. For any other failure, keep whatever's in cache.
        return throwError(() => error);
      }),
    );
}

  private handleHttpError = (error: any): Observable<never> => {
    const message =
      error?.error?.message ||
      error?.message ||
      'Something went wrong. Please try again.';
    return throwError(() => new Error(message));
  };
} 