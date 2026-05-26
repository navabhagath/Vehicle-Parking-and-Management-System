import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AdminRevenueComponent } from './admin-revenue.component';

describe('AdminRevenueComponent', () => {
  let component: AdminRevenueComponent;
  let fixture: ComponentFixture<AdminRevenueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminRevenueComponent, RouterTestingModule],
      providers: [provideHttpClient(), provideHttpClientTesting()],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminRevenueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty revenueList', () => {
    expect(component.revenueList).toEqual([]);
  });

  it('should initialize with empty filteredList', () => {
    expect(component.filteredList).toEqual([]);
  });

  it('should have totalRevenueAllVendors as 0', () => {
    expect(component.totalRevenueAllVendors).toBe(0);
  });

  it('should return correct status class for Active', () => {
    expect(component.getStatusClass('Active')).toContain('bg-success');
  });

  it('should return correct status class for Overdue', () => {
    expect(component.getStatusClass('Overdue')).toContain('bg-danger');
  });

  it('should return default status class for unknown', () => {
    expect(component.getStatusClass('Unknown')).toContain('bg-secondary');
  });

  it('should calculate overdue count', () => {
    component.revenueList = [
      { status: 'Overdue' },
      { status: 'Active' },
      { status: 'Overdue' },
    ];
    expect(component.getOverdueCount()).toBe(2);
  });

  it('should calculate total revenue from filteredList', () => {
    component.filteredList = [{ amount: 100 }, { amount: 200 }, { amount: 50 }];
    expect(component.getTotalRevenue()).toBe(350);
  });
});
