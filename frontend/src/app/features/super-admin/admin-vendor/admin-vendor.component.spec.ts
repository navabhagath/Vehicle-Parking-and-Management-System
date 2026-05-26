import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AdminVendorComponent } from './admin-vendor.component';

describe('AdminVendorComponent', () => {
  let component: AdminVendorComponent;
  let fixture: ComponentFixture<AdminVendorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminVendorComponent, RouterTestingModule],
      providers: [provideHttpClient(), provideHttpClientTesting()],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminVendorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have isLoading true initially', () => {
    expect(component.isLoading).toBeTrue();
  });

  it('should have empty displayVendors initially', () => {
    expect(component.displayVendors).toEqual([]);
  });
});
