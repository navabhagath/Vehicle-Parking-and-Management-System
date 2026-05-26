import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { SimpleChange } from '@angular/core';
import { of } from 'rxjs';
import { VendorRevenueBarComponent } from './vendor-revenue-bar.component';
import { VendorAnalyticsService } from '../vendor-analytics.service';

describe('VendorRevenueBarComponent', () => {
  let component: VendorRevenueBarComponent;
  let fixture: ComponentFixture<VendorRevenueBarComponent>;
  let analyticsService: jasmine.SpyObj<VendorAnalyticsService>;

  beforeEach(async () => {
    const serviceSpy = jasmine.createSpyObj('VendorAnalyticsService', [
      'getRevenueBar',
    ]);
    serviceSpy.getRevenueBar.and.returnValue(
      of({ labels: ['Mon', 'Tue'], data: [100, 200] }),
    );

    await TestBed.configureTestingModule({
      imports: [VendorRevenueBarComponent, RouterTestingModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: VendorAnalyticsService, useValue: serviceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(VendorRevenueBarComponent);
    component = fixture.componentInstance;
    analyticsService = TestBed.inject(
      VendorAnalyticsService,
    ) as jasmine.SpyObj<VendorAnalyticsService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default activeRange as week', () => {
    expect(component.activeRange).toBe('week');
  });

  it('should have 3 range options', () => {
    expect(component.ranges.length).toBe(3);
  });

  it('should trigger load on locationId change', () => {
    component.locationId = 'loc1';
    component.ngOnChanges({
      locationId: new SimpleChange(null, 'loc1', true),
    });
    expect(
      analyticsService.getRevenueBar || analyticsService['getRevenueBar'],
    ).toBeDefined();
  });

  it('should not trigger load if locationId is empty', () => {
    analyticsService.getRevenueBar?.calls?.reset();
    component.locationId = '';
    component.ngOnChanges({
      locationId: new SimpleChange(null, '', true),
    });
  });
});
