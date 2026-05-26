import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import {
  HttpClient,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

describe('authInterceptor', () => {
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('AuthService', [
      'getToken',
      'forceLogout',
    ]);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    });

    httpMock = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should add Authorization header for /api/ requests when token exists', () => {
    authServiceSpy.getToken.and.returnValue('my-token');

    httpClient.get('/api/users').subscribe();

    const req = httpMock.expectOne('/api/users');
    expect(req.request.headers.get('Authorization')).toBe('Bearer my-token');
    req.flush({});
  });

  it('should NOT add Authorization header for auth endpoints (no /api/)', () => {
    authServiceSpy.getToken.and.returnValue('my-token');

    httpClient.post('/auth/login', {}).subscribe();

    const req = httpMock.expectOne('/auth/login');
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush({});
  });

  it('should NOT add Authorization header when no token', () => {
    authServiceSpy.getToken.and.returnValue(null);

    httpClient.get('/api/data').subscribe();

    const req = httpMock.expectOne('/api/data');
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush({});
  });

  it('should call forceLogout on 401 from protected endpoint', () => {
    authServiceSpy.getToken.and.returnValue('expired-token');

    httpClient.get('/api/protected').subscribe({ error: () => {} });

    const req = httpMock.expectOne('/api/protected');
    req.flush(
      { message: 'Unauthorized' },
      { status: 401, statusText: 'Unauthorized' },
    );

    expect(authServiceSpy.forceLogout).toHaveBeenCalled();
  });

  it('should NOT call forceLogout on 401 from auth endpoint', () => {
    authServiceSpy.getToken.and.returnValue(null);

    httpClient.post('/auth/login', {}).subscribe({ error: () => {} });

    const req = httpMock.expectOne('/auth/login');
    req.flush(
      { message: 'Bad credentials' },
      { status: 401, statusText: 'Unauthorized' },
    );

    expect(authServiceSpy.forceLogout).not.toHaveBeenCalled();
  });

  it('should call forceLogout on 403 ACCOUNT_SUSPENDED from protected endpoint', () => {
    authServiceSpy.getToken.and.returnValue('some-token');

    httpClient.get('/api/dashboard').subscribe({ error: () => {} });

    const req = httpMock.expectOne('/api/dashboard');
    req.flush(
      { code: 'ACCOUNT_SUSPENDED' },
      { status: 403, statusText: 'Forbidden' },
    );

    expect(authServiceSpy.forceLogout).toHaveBeenCalled();
  });

  it('should NOT call forceLogout on 403 without ACCOUNT_SUSPENDED code', () => {
    authServiceSpy.getToken.and.returnValue('some-token');

    httpClient.get('/api/resource').subscribe({ error: () => {} });

    const req = httpMock.expectOne('/api/resource');
    req.flush({ code: 'FORBIDDEN' }, { status: 403, statusText: 'Forbidden' });

    expect(authServiceSpy.forceLogout).not.toHaveBeenCalled();
  });
});
