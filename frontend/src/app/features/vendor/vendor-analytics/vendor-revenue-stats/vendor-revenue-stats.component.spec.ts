import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { SimpleChange } from '@angular/core';
import { VendorRevenueStatsComponent } from './vendor-revenue-stats.component';
import { VendorAnalyticsService } from '../vendor-analytics.service';

describe('VendorRevenueStatsComponent', () => {
  let component: VendorRevenueStatsComponent;
  let fixture: ComponentFixture<VendorRevenueStatsComponent>;
  let analyticsService: jasmine.SpyObj<VendorAnalyticsService>;

  beforeEach(async () => {
    const serviceSpy = jasmine.createSpyObj('VendorAnalyticsService', [
      'getRevenueStats',
    ]);
    serviceSpy.getRevenueStats.and.returnValue(
      of({ today: 100, month: 3000, year: 36000, total: 100000 }),
    );

    await TestBed.configureTestingModule({
      imports: [VendorRevenueStatsComponent, RouterTestingModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: VendorAnalyticsService, useValue: serviceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(VendorRevenueStatsComponent);
    component = fixture.componentInstance;
    analyticsService = TestBed.inject(
      VendorAnalyticsService,
    ) as jasmine.SpyObj<VendorAnalyticsService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load stats when locationId changes', () => {
    component.locationId = 'loc1';
    component.ngOnChanges({
      locationId: new SimpleChange(null, 'loc1', true),
    });
    expect(analyticsService.getRevenueStats).toHaveBeenCalledWith('loc1');
  });

  it('should map response to 4 stat cards', () => {
    component.locationId = 'loc1';
    component.ngOnChanges({
      locationId: new SimpleChange(null, 'loc1', true),
    });
    expect(component.stats.length).toBe(4);
    expect(component.stats[0].label).toBe("Today's Revenue");
    expect(component.stats[0].value).toBe(100);
  });

  it('should not load stats if locationId is empty', () => {
    analyticsService.getRevenueStats.calls.reset();
    component.locationId = '';
    component.ngOnChanges({
      locationId: new SimpleChange(null, '', true),
    });
    expect(analyticsService.getRevenueStats).not.toHaveBeenCalled();
  });
});
