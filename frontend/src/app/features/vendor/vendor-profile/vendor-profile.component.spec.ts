import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { VendorProfileComponent } from './vendor-profile.component';
import { VendorProfileService } from './vendor-profile.service';
import { AuthService } from '../../../core/services/auth.service';

describe('VendorProfileComponent', () => {
  let component: VendorProfileComponent;
  let fixture: ComponentFixture<VendorProfileComponent>;

  const mockVendorData = {
    name: 'Test Vendor',
    email: 'vendor@test.com',
    phone: '9876543210',
    createdAt: '2024-01-15T00:00:00.000Z',
  };

  beforeEach(async () => {
    const daoSpy = jasmine.createSpyObj('VendorProfileDao', [
      'getVendorProfileData',
    ]);
    const authSpy = jasmine.createSpyObj('AuthService', [], {
      currentUserValue: { id: 'vendor1' },
    });
    daoSpy.getVendorProfileData.and.returnValue(of(mockVendorData));

    await TestBed.configureTestingModule({
      imports: [VendorProfileComponent, RouterTestingModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: VendorProfileService, useValue: daoSpy },
        { provide: AuthService, useValue: authSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(VendorProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load vendor data on init', () => {
    expect(component.vendorData).toEqual(mockVendorData as any);
  });

  it('should set vendorId from authService', () => {
    expect(component.vendorId).toBe('vendor1');
  });

  it('should format date correctly', () => {
    const formatted = component.getFormattedDate();
    expect(formatted).toContain('Jan');
    expect(formatted).toContain('2024');
  });

  it('should return dash if createdAt is empty', () => {
    component.vendorData = { createdAt: '' } as any;
    expect(component.getFormattedDate()).toBe('—');
  });
});
