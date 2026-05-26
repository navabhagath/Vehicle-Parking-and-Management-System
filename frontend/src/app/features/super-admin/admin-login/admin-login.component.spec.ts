import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AdminLoginComponent } from './admin-login.component';

describe('AdminLoginComponent', () => {
  let component: AdminLoginComponent;
  let fixture: ComponentFixture<AdminLoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminLoginComponent, RouterTestingModule],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize loginForm with empty email and password', () => {
    expect(component.loginForm).toBeTruthy();
    expect(component.loginForm.get('email')?.value).toBe('');
    expect(component.loginForm.get('password')?.value).toBe('');
  });

  it('should have invalid form when empty', () => {
    expect(component.loginForm.valid).toBeFalse();
  });

  it('should have valid form with proper values', () => {
    component.loginForm.setValue({
      email: 'admin@test.com',
      password: '123456',
    });
    expect(component.loginForm.valid).toBeTrue();
  });

  it('should reject invalid email', () => {
    component.loginForm.patchValue({ email: 'invalid', password: '123456' });
    expect(component.loginForm.get('email')?.errors?.['email']).toBeTruthy();
  });

  it('should reject short password', () => {
    component.loginForm.patchValue({ email: 'a@b.com', password: '123' });
    expect(
      component.loginForm.get('password')?.errors?.['minlength'],
    ).toBeTruthy();
  });

  it('should have isLoading false initially', () => {
    expect(component.isLoading).toBeFalse();
  });

  it('should have empty errorMessage initially', () => {
    expect(component.errorMessage).toBe('');
  });
});
