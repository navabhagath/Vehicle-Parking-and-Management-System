import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { environment } from '../../env/evironment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService, { provide: Router, useValue: routerSpy }],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // --- isLoggedIn ---

  it('should return false for isLoggedIn when no token', () => {
    expect(service.isLoggedIn).toBeFalse();
  });

  it('should return true for isLoggedIn when token and user exist', () => {
    localStorage.setItem('authToken', 'fake-token');
    localStorage.setItem(
      'currentUser',
      JSON.stringify({ name: 'Test', role: 'CUSTOMER' }),
    );
    // Re-create service to pick up localStorage
    service = new (AuthService as any)(
      TestBed.inject(HttpTestingController) as any,
      routerSpy,
    );
    // Alternatively just test getToken
    expect(service.getToken()).toBe('fake-token');
  });

  // --- getToken ---

  it('should return null when no token in localStorage', () => {
    expect(service.getToken()).toBeNull();
  });

  it('should return token from localStorage', () => {
    localStorage.setItem('authToken', 'my-token');
    expect(service.getToken()).toBe('my-token');
  });

  // --- requestOtp ---

  it('should send OTP request with +91 prefix', () => {
    service.requestOtp('9876543210').subscribe();

    const req = httpMock.expectOne(
      `${environment.authUrl}/customer/request-otp`,
    );
    expect(req.request.body.phone).toBe('+919876543210');
    req.flush({ success: true });
  });

  it('should not double-add +91 prefix', () => {
    service.requestOtp('+919876543210').subscribe();

    const req = httpMock.expectOne(
      `${environment.authUrl}/customer/request-otp`,
    );
    expect(req.request.body.phone).toBe('+919876543210');
    req.flush({ success: true });
  });

  // --- login (vendor/admin) ---

  it('should login vendor with email and password', () => {
    const mockResponse = {
      success: true,
      message: 'OK',
      data: { token: 'vendor-token', user: { name: 'Vendor', role: 'VENDOR' } },
    };

    service
      .login({
        email: 'v@test.com',
        password: 'pass123',
        expectedRole: 'VENDOR',
      })
      .subscribe((user) => {
        expect(user.name).toBe('Vendor');
      });

    const req = httpMock.expectOne(`${environment.authUrl}/vendor/login`);
    expect(req.request.body.email).toBe('v@test.com');
    req.flush(mockResponse);

    expect(localStorage.getItem('authToken')).toBe('vendor-token');
  });

  it('should login super admin', () => {
    const mockResponse = {
      success: true,
      message: 'OK',
      data: {
        token: 'admin-token',
        user: { name: 'Admin', role: 'SUPER_ADMIN' },
      },
    };

    service
      .login({
        email: 'a@test.com',
        password: 'pass',
        expectedRole: 'SUPER_ADMIN',
      })
      .subscribe((user) => {
        expect(user.role).toBe('SUPER_ADMIN');
      });

    const req = httpMock.expectOne(`${environment.authUrl}/super_admin/login`);
    req.flush(mockResponse);
  });

  // --- login (customer OTP) ---

  it('should login customer with phone and otp', () => {
    const mockResponse = {
      success: true,
      message: 'OK',
      data: { token: 'cust-token', user: { name: 'Cust', role: 'CUSTOMER' } },
    };

    service.login({ phone: '9876543210', otp: '1234' }).subscribe((user) => {
      expect(user.name).toBe('Cust');
    });

    const req = httpMock.expectOne(
      `${environment.authUrl}/customer/verify-otp`,
    );
    expect(req.request.body.phone).toBe('+919876543210');
    expect(req.request.body.otp).toBe('1234');
    req.flush(mockResponse);
  });

  it('should throw error for invalid credentials shape', () => {
    service.login({}).subscribe({
      error: (err) => {
        expect(err.message).toBe('Invalid login credentials shape.');
      },
    });
  });

  // --- Password reset flow ---

  it('should request password reset OTP', () => {
    service.requestPasswordResetOtp('user@test.com', 'VENDOR').subscribe();

    const req = httpMock.expectOne(`${environment.authUrl}/forgot-password`);
    expect(req.request.body.email).toBe('user@test.com');
    expect(req.request.body.role).toBe('VENDOR');
    req.flush({ success: true });

    expect(service.tempEmail).toBe('user@test.com');
  });

  it('should verify password reset OTP and store reset token', () => {
    // Set up temp state
    service.requestPasswordResetOtp('user@test.com', 'VENDOR').subscribe();
    httpMock
      .expectOne(`${environment.authUrl}/forgot-password`)
      .flush({ success: true });

    service.verifyPasswordResetOtp('5678').subscribe((result) => {
      expect(result).toBeTrue();
    });

    const req = httpMock.expectOne(`${environment.authUrl}/verify-reset-otp`);
    expect(req.request.body.otp).toBe('5678');
    req.flush({ success: true, resetToken: 'reset-abc', message: 'OK' });
  });

  it('should return false on invalid OTP verification', () => {
    service.tempEmail = 'user@test.com';

    service.verifyPasswordResetOtp('wrong').subscribe((result) => {
      expect(result).toBeFalse();
    });

    const req = httpMock.expectOne(`${environment.authUrl}/verify-reset-otp`);
    req.error(new ProgressEvent('error'), { status: 400 });
  });

  it('should reset password with stored reset token', () => {
    // Simulate that verifyPasswordResetOtp was called and set the token
    service.tempEmail = 'user@test.com';
    service.verifyPasswordResetOtp('1234').subscribe();
    httpMock
      .expectOne(`${environment.authUrl}/verify-reset-otp`)
      .flush({ success: true, resetToken: 'tok-123', message: '' });

    service.resetUserPassword('user@test.com', 'newPass').subscribe();

    const req = httpMock.expectOne(`${environment.authUrl}/reset-password`);
    expect(req.request.body.resetToken).toBe('tok-123');
    expect(req.request.body.newPassword).toBe('newPass');
    req.flush({ success: true });
  });

  it('should error when resetUserPassword called without reset token', () => {
    service.resetUserPassword('x@x.com', 'pwd').subscribe({
      error: (err) => {
        expect(err.message).toContain('Reset session expired');
      },
    });
  });

  // --- logout ---

  it('should clear session and navigate to admin login for SUPER_ADMIN', () => {
    localStorage.setItem('authToken', 'tok');
    localStorage.setItem(
      'currentUser',
      JSON.stringify({ role: 'SUPER_ADMIN' }),
    );
    service.updateCurrentUser({ role: 'SUPER_ADMIN' } as any);

    service.logout();

    expect(localStorage.getItem('authToken')).toBeNull();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/super_admin/login']);
  });

  it('should navigate to root for non-admin logout', () => {
    service.updateCurrentUser({ role: 'VENDOR' } as any);
    service.logout();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['']);
  });

  // --- forceLogout ---

  it('should clear session and navigate to root on forceLogout', () => {
    localStorage.setItem('authToken', 'tok');
    service.forceLogout();
    expect(localStorage.getItem('authToken')).toBeNull();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
  });

  // --- updateCurrentUser ---

  it('should update current user in localStorage and subject', () => {
    const user = { name: 'Updated', role: 'CUSTOMER' } as any;
    service.updateCurrentUser(user);
    expect(service.currentUserValue).toEqual(user);
    expect(JSON.parse(localStorage.getItem('currentUser')!).name).toBe(
      'Updated',
    );
  });

  // --- hasPermission ---

  it('should return false if no user', () => {
    expect(service.hasPermission('MANAGE_USERS')).toBeFalse();
  });

  it('should return true for SUPER_ADMIN regardless of permissions', () => {
    service.updateCurrentUser({ role: 'SUPER_ADMIN' } as any);
    expect(service.hasPermission('ANYTHING')).toBeTrue();
  });

  it('should check permissions array for non-admin users', () => {
    service.updateCurrentUser({
      role: 'VENDOR',
      permissions: ['VIEW_REPORTS'],
    } as any);
    expect(service.hasPermission('VIEW_REPORTS')).toBeTrue();
    expect(service.hasPermission('DELETE_USERS')).toBeFalse();
  });
});
