import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ResetPasswordComponent } from './reset-password.component';
import { AuthService } from '../core/services/auth.service';
import { ModalService } from '../shared/modal/modal.service';

describe('ResetPasswordComponent', () => {
  let component: ResetPasswordComponent;
  let fixture: ComponentFixture<ResetPasswordComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let modalServiceSpy: jasmine.SpyObj<ModalService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', [
      'requestPasswordResetOtp',
      'verifyPasswordResetOtp',
      'resetUserPassword',
    ]);
    modalServiceSpy = jasmine.createSpyObj('ModalService', ['confirm']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate'], {
      url: '/vendor/reset-password',
    });

    await TestBed.configureTestingModule({
      imports: [ResetPasswordComponent, ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: ModalService, useValue: modalServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ResetPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize at step 1', () => {
    expect(component.step).toBe(1);
  });

  it('should set role to VENDOR when route contains /vendor', () => {
    expect(component.role).toBe('VENDOR');
  });

  it('should have invalid emailForm initially', () => {
    expect(component.emailForm.valid).toBeFalse();
  });

  it('should validate email format', () => {
    component.emailForm.get('email')?.setValue('invalid');
    expect(component.emailForm.valid).toBeFalse();

    component.emailForm.get('email')?.setValue('test@example.com');
    expect(component.emailForm.valid).toBeTrue();
  });

  it('should not call service if emailForm is invalid on onRequestOtp', () => {
    component.onRequestOtp();
    expect(authServiceSpy.requestPasswordResetOtp).not.toHaveBeenCalled();
  });

  it('should move to step 2 on successful OTP request', () => {
    authServiceSpy.requestPasswordResetOtp.and.returnValue(
      of({ success: true }),
    );
    component.emailForm.get('email')?.setValue('test@example.com');

    component.onRequestOtp();

    expect(component.step).toBe(2);
    expect(component.isLoading).toBeFalse();
  });

  it('should show error on failed OTP request', () => {
    authServiceSpy.requestPasswordResetOtp.and.returnValue(
      throwError(() => new Error('Server error')),
    );
    component.emailForm.get('email')?.setValue('test@example.com');

    component.onRequestOtp();

    expect(component.step).toBe(1);
    expect(component.errorMessage).toBe('Server error');
  });

  it('should move to step 3 on valid OTP verification', () => {
    component.step = 2;
    component.otpForm.get('otpCode')?.setValue('1234');
    authServiceSpy.verifyPasswordResetOtp.and.returnValue(of(true));

    component.onVerifyOtp();

    expect(component.step).toBe(3 as any);
  });

  it('should show error on invalid OTP verification', () => {
    component.step = 2;
    component.otpForm.get('otpCode')?.setValue('1234');
    authServiceSpy.verifyPasswordResetOtp.and.returnValue(of(false));

    component.onVerifyOtp();

    expect(component.step).toBe(2);
    expect(component.errorMessage).toBe('Invalid OTP code. Please try again.');
  });

  it('should validate password match', () => {
    component.passwordForm.get('newPassword')?.setValue('Test@123');
    component.passwordForm.get('confirmPassword')?.setValue('Different1');
    expect(component.passwordForm.hasError('mismatch')).toBeTrue();

    component.passwordForm.get('confirmPassword')?.setValue('Test@123');
    expect(component.passwordForm.hasError('mismatch')).toBeFalse();
  });

  it('should navigate back to vendor login on onClickBack', () => {
    component.onClickBack();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/vendor/login']);
  });
});
