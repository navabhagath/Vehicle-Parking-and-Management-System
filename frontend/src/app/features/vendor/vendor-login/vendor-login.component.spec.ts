import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { VendorLoginComponent } from './vendor-login.component';
import { AuthService } from '../../../core/services/auth.service';

describe('VendorLoginComponent', () => {
  let component: VendorLoginComponent;
  let fixture: ComponentFixture<VendorLoginComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthService', ['login']);

    await TestBed.configureTestingModule({
      imports: [VendorLoginComponent, RouterTestingModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(VendorLoginComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize login form with email and password fields', () => {
    expect(component.loginForm).toBeDefined();
    expect(component.loginForm.get('email')).toBeTruthy();
    expect(component.loginForm.get('password')).toBeTruthy();
  });

  it('should mark form as invalid when empty', () => {
    expect(component.loginForm.valid).toBeFalse();
  });

  it('should mark email as invalid for incorrect email format', () => {
    component.loginForm.get('email')?.setValue('invalid');
    expect(component.loginForm.get('email')?.hasError('email')).toBeTrue();
  });

  it('should mark password as invalid if less than 8 characters', () => {
    component.loginForm.get('password')?.setValue('short');
    expect(
      component.loginForm.get('password')?.hasError('minlength'),
    ).toBeTrue();
  });

  it('should mark form as valid with correct inputs', () => {
    component.loginForm.get('email')?.setValue('test@example.com');
    component.loginForm.get('password')?.setValue('password123');
    expect(component.loginForm.valid).toBeTrue();
  });

  it('should not call authService.login if form is invalid', () => {
    component.onSubmit();
    expect(authService.login).not.toHaveBeenCalled();
  });

  it('should call authService.login on valid form submission', () => {
    authService.login.and.returnValue(of({ role: 'VENDOR' } as any));
    component.loginForm.get('email')?.setValue('vendor@test.com');
    component.loginForm.get('password')?.setValue('password123');
    component.onSubmit();
    expect(authService.login).toHaveBeenCalledWith({
      email: 'vendor@test.com',
      password: 'password123',
      expectedRole: 'VENDOR',
    });
  });

  it('should navigate to /vendor/dashboard on successful VENDOR login', () => {
    spyOn(router, 'navigate');
    authService.login.and.returnValue(of({ role: 'VENDOR' } as any));
    component.loginForm.get('email')?.setValue('vendor@test.com');
    component.loginForm.get('password')?.setValue('password123');
    component.onSubmit();
    expect(router.navigate).toHaveBeenCalledWith(['/vendor/dashboard']);
  });

  it('should show error message if user role is not VENDOR', () => {
    authService.login.and.returnValue(of({ role: 'CUSTOMER' } as any));
    component.loginForm.get('email')?.setValue('vendor@test.com');
    component.loginForm.get('password')?.setValue('password123');
    component.onSubmit();
    expect(component.errorMessage).toBe('Unauthorized access.');
  });

  it('should show error message on login failure', () => {
    authService.login.and.returnValue(
      throwError(() => ({ message: 'Invalid credentials' })),
    );
    component.loginForm.get('email')?.setValue('vendor@test.com');
    component.loginForm.get('password')?.setValue('password123');
    component.onSubmit();
    expect(component.errorMessage).toBe('Invalid credentials');
    expect(component.isLoading).toBeFalse();
  });

  it('should set isLoading to true during submission', () => {
    authService.login.and.returnValue(of({ role: 'VENDOR' } as any));
    component.loginForm.get('email')?.setValue('vendor@test.com');
    component.loginForm.get('password')?.setValue('password123');
    component.onSubmit();
    expect(component.isLoading).toBeFalse(); // after completion
  });
});
