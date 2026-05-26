import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError, BehaviorSubject } from 'rxjs';
import { CustomerLoginComponent } from './customer-login.component';
import { AuthService } from '../../../core/services/auth.service';
import { OtpTimerService } from '../../../core/services/otp-timer.service';
import { ModalService } from '../../../shared/modal/modal.service';

describe('CustomerLoginComponent', () => {
  let component: CustomerLoginComponent;
  let fixture: ComponentFixture<CustomerLoginComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let otpTimerSpy: jasmine.SpyObj<OtpTimerService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let modalSpy: jasmine.SpyObj<ModalService>;
  let currentUser$: BehaviorSubject<any>;

  beforeEach(async () => {
    currentUser$ = new BehaviorSubject<any>(null);
    authServiceSpy = jasmine.createSpyObj(
      'AuthService',
      ['requestOtp', 'login'],
      {
        currentUser$: currentUser$.asObservable(),
      },
    );
    otpTimerSpy = jasmine.createSpyObj(
      'OtpTimerService',
      ['startTimer', 'stopTimer'],
      {
        timeLeft$: of(0),
      },
    );
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    modalSpy = jasmine.createSpyObj('ModalService', ['confirm']);

    await TestBed.configureTestingModule({
      imports: [CustomerLoginComponent, ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: OtpTimerService, useValue: otpTimerSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ModalService, useValue: modalSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomerLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have invalid phone initially', () => {
    expect(component.loginForm.get('phone')?.valid).toBeFalse();
  });

  it('should validate phone pattern (starts with 6-9, 10 digits)', () => {
    component.loginForm.get('phone')?.setValue('9876543210');
    expect(component.loginForm.get('phone')?.valid).toBeTrue();

    component.loginForm.get('phone')?.setValue('1234567890');
    expect(component.loginForm.get('phone')?.valid).toBeFalse();
  });

  it('should send OTP on first submit', () => {
    authServiceSpy.requestOtp.and.returnValue(of({ success: true }));
    component.loginForm.get('phone')?.setValue('9876543210');

    component.onSubmit();

    expect(authServiceSpy.requestOtp).toHaveBeenCalledWith('9876543210');
    expect(component.isOtpSent).toBeTrue();
    expect(otpTimerSpy.startTimer).toHaveBeenCalledWith(30);
  });

  it('should show error when OTP send fails', () => {
    authServiceSpy.requestOtp.and.returnValue(
      throwError(() => new Error('fail')),
    );
    component.loginForm.get('phone')?.setValue('9876543210');

    component.onSubmit();

    expect(component.errorMessage).toBe(
      'Failed to send OTP. Please try again.',
    );
  });

  it('should call login on second submit (OTP already sent)', () => {
    component.isOtpSent = true;
    component.loginForm.get('phone')?.setValue('9876543210');
    component.loginForm.get('otp')?.setValue('1234');
    component.loginForm.get('otp')?.setValidators([]);
    component.loginForm.get('otp')?.updateValueAndValidity();
    authServiceSpy.login.and.returnValue(
      of({ name: 'User', role: 'CUSTOMER' } as any),
    );

    component.onSubmit();

    expect(authServiceSpy.login).toHaveBeenCalled();
  });

  it('should reset OTP state on toggleNumberChange', () => {
    component.isOtpSent = true;
    component.toggleNumberChange();

    expect(component.isOtpSent).toBeFalse();
    expect(otpTimerSpy.stopTimer).toHaveBeenCalled();
  });

  it('should navigate to dashboard when customer user emits', fakeAsync(() => {
    currentUser$.next({ name: 'Existing User', role: 'CUSTOMER' });
    tick();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/customer/dashboard']);
  }));

  it('should navigate to welcome for new customer', fakeAsync(() => {
    currentUser$.next({ name: 'New Customer', role: 'CUSTOMER' });
    tick();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/customer/welcome']);
  }));

  it('should stop timer on destroy', () => {
    component.ngOnDestroy();
    expect(otpTimerSpy.stopTimer).toHaveBeenCalled();
  });
});
