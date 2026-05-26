import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AdminVendorDetailsComponent } from './admin-vendor-details.component';

describe('AdminVendorDetailsComponent', () => {
  let component: AdminVendorDetailsComponent;
  let fixture: ComponentFixture<AdminVendorDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminVendorDetailsComponent, RouterTestingModule],
      providers: [provideHttpClient(), provideHttpClientTesting()],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminVendorDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have isLoading true initially', () => {
    expect(component.isLoading).toBeTrue();
  });

  it('should have undefined vendor initially', () => {
    expect(component.vendor).toBeUndefined();
  });

  it('should have undefined location initially', () => {
    expect(component.location).toBeUndefined();
  });
});
