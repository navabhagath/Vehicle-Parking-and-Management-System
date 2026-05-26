import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { VendorRegistrationComponent } from './vendor-registration.component';
import { UserDao } from '../vendor-login/user.dao';
import { ModalService } from '../../../shared/modal/modal.service';

describe('VendorRegistrationComponent', () => {
  let component: VendorRegistrationComponent;
  let fixture: ComponentFixture<VendorRegistrationComponent>;
  let userDao: jasmine.SpyObj<UserDao>;
  let modalService: jasmine.SpyObj<ModalService>;
  let router: Router;

  beforeEach(async () => {
    const userDaoSpy = jasmine.createSpyObj('UserDao', [
      'registerVendor',
      'checkEmailAvailability',
      'checkPhoneAvailability',
    ]);
    const modalSpy = jasmine.createSpyObj('ModalService', ['confirm']);
    userDaoSpy.checkEmailAvailability.and.returnValue(of({ available: true }));
    userDaoSpy.checkPhoneAvailability.and.returnValue(of({ available: true }));
    modalSpy.confirm.and.returnValue(Promise.resolve(true));

    await TestBed.configureTestingModule({
      imports: [VendorRegistrationComponent, RouterTestingModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: UserDao, useValue: userDaoSpy },
        { provide: ModalService, useValue: modalSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(VendorRegistrationComponent);
    component = fixture.componentInstance;
    userDao = TestBed.inject(UserDao) as jasmine.SpyObj<UserDao>;
    modalService = TestBed.inject(ModalService) as jasmine.SpyObj<ModalService>;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize registrationForm with required fields', () => {
    expect(component.registrationForm).toBeDefined();
    expect(component.registrationForm.get('name')).toBeTruthy();
    expect(component.registrationForm.get('email')).toBeTruthy();
    expect(component.registrationForm.get('phone')).toBeTruthy();
    expect(component.registrationForm.get('password_hash')).toBeTruthy();
    expect(component.registrationForm.get('confirmPassword')).toBeTruthy();
  });

  it('should mark form invalid when empty', () => {
    expect(component.registrationForm.valid).toBeFalse();
  });

  it('should validate name does not contain numbers', () => {
    component.registrationForm.get('name')?.setValue('Vendor123');
    expect(
      component.registrationForm.get('name')?.hasError('hasNumbers'),
    ).toBeTrue();
  });

  it('should validate name minimum length', () => {
    component.registrationForm.get('name')?.setValue('Ab');
    expect(
      component.registrationForm.get('name')?.hasError('minlength'),
    ).toBeTrue();
  });

  it('should validate phone pattern (Indian mobile)', () => {
    component.registrationForm.get('phone')?.setValue('1234567890');
    expect(
      component.registrationForm.get('phone')?.hasError('pattern'),
    ).toBeTrue();
  });

  it('should accept valid phone number', () => {
    const phoneCtrl = component.registrationForm.get('phone');
    phoneCtrl?.setValue('9876543210');
    // Only sync validators
    expect(phoneCtrl?.hasError('pattern')).toBeFalse();
    expect(phoneCtrl?.hasError('required')).toBeFalse();
  });

  it('should detect password mismatch', () => {
    component.registrationForm.get('password_hash')?.setValue('Test@123');
    component.registrationForm.get('confirmPassword')?.setValue('Different@1');
    component.registrationForm.updateValueAndValidity();
    expect(component.registrationForm.hasError('mismatch')).toBeTrue();
  });

  it('should not have mismatch error when passwords match', () => {
    component.registrationForm.get('password_hash')?.setValue('Test@123');
    component.registrationForm.get('confirmPassword')?.setValue('Test@123');
    component.registrationForm.updateValueAndValidity();
    expect(component.registrationForm.hasError('mismatch')).toBeFalse();
  });

  it('should not submit if form is invalid', () => {
    component.onSubmit();
    expect(userDao.registerVendor).not.toHaveBeenCalled();
  });

  it('should call registerVendor on valid form submission', () => {
    userDao.registerVendor.and.returnValue(of({}));
    component.registrationForm.get('name')?.setValue('Vendor Name');
    component.registrationForm.get('email')?.setValue('vendor@test.com');
    component.registrationForm.get('phone')?.setValue('9876543210');
    component.registrationForm.get('password_hash')?.setValue('Test@123');
    component.registrationForm.get('confirmPassword')?.setValue('Test@123');
    // Mark as valid by clearing async validators for test
    component.registrationForm.get('email')?.clearAsyncValidators();
    component.registrationForm.get('phone')?.clearAsyncValidators();
    component.registrationForm.get('email')?.updateValueAndValidity();
    component.registrationForm.get('phone')?.updateValueAndValidity();
    component.onSubmit();
    expect(userDao.registerVendor).toHaveBeenCalled();
  });

  it('should show error message on registration failure', () => {
    userDao.registerVendor.and.returnValue(
      throwError(() => ({ error: { message: 'Email already exists' } })),
    );
    component.registrationForm.get('name')?.setValue('Vendor Name');
    component.registrationForm.get('email')?.setValue('vendor@test.com');
    component.registrationForm.get('phone')?.setValue('9876543210');
    component.registrationForm.get('password_hash')?.setValue('Test@123');
    component.registrationForm.get('confirmPassword')?.setValue('Test@123');
    component.registrationForm.get('email')?.clearAsyncValidators();
    component.registrationForm.get('phone')?.clearAsyncValidators();
    component.registrationForm.get('email')?.updateValueAndValidity();
    component.registrationForm.get('phone')?.updateValueAndValidity();
    component.onSubmit();
    expect(component.errorMessage).toBe('Email already exists');
    expect(component.isLoading).toBeFalse();
  });
});
