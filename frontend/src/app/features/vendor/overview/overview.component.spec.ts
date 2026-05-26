import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of, throwError } from 'rxjs';

import { OverviewComponent } from './overview.component';
import { OverviewService } from './overview.service';
import { CurrentOccupancyPiechartService } from '../Services/current-occupancy-piechart.service';
import { OverviewResponse, SlotSummary } from './overview.model';

describe('OverviewComponent', () => {
  let component: OverviewComponent;
  let fixture: ComponentFixture<OverviewComponent>;
  let overviewService: jasmine.SpyObj<OverviewService>;
  let occupancyService: jasmine.SpyObj<CurrentOccupancyPiechartService>;

  const emptySummary: SlotSummary = { total: 0, occupied: 0, free: 0 };

  const mockResponse: OverviewResponse = {
    location: {
      id: 'loc456',
      vendorId: 'v1',
      locationName: 'Test Location',
      locationId: 'L1',
      isActive: true,
      operationalHours: { start: '09:00', end: '21:00' },
      capacity: { twoWheeler: 10, fourWheeler: 10 },
      basePrice: 50,
      approvalStatus: 'approved',
      twoWheeler: 10,
      fourWheeler: 10,
    },
    slotSummary: { total: 10, occupied: 5, free: 5 },
    recentParking: [],
  };

  const mockRoute = {
    parent: {
      paramMap: of(convertToParamMap({ id: 'loc456' })),
    },
  };

  beforeEach(async () => {
    const overviewSpy = jasmine.createSpyObj<OverviewService>('OverviewService', ['getOverview']);
    const occupancySpy = jasmine.createSpyObj<CurrentOccupancyPiechartService>(
      'CurrentOccupancyPiechartService',
      ['updateCurrentOccupancy'],
      { currentOccupancy$: of(emptySummary) },
    );

    overviewSpy.getOverview.and.returnValue(of(mockResponse));

    await TestBed.configureTestingModule({
      imports: [OverviewComponent],
      providers: [
        { provide: OverviewService, useValue: overviewSpy },
        { provide: CurrentOccupancyPiechartService, useValue: occupancySpy },
        { provide: ActivatedRoute, useValue: mockRoute },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(OverviewComponent);
    component = fixture.componentInstance;
    overviewService = TestBed.inject(OverviewService) as jasmine.SpyObj<OverviewService>;
    occupancyService = TestBed.inject(
      CurrentOccupancyPiechartService,
    ) as jasmine.SpyObj<CurrentOccupancyPiechartService>;
    fixture.detectChanges();
  });

  it('should create and have menuItems', () => {
    expect(component).toBeTruthy();
    expect(component.menuItems.length).toBe(3);
  });

  it('should load overview data on init and update occupancy state', () => {
    expect(overviewService.getOverview).toHaveBeenCalledWith('loc456');
    expect(component.location.locationName).toBe('Test Location');
    expect(component.slotSummary).toEqual({ total: 10, occupied: 5, free: 5 });
    expect(component.recentParking).toEqual([]);
    expect(component.isLoading).toBeFalse();
    expect(occupancyService.updateCurrentOccupancy).toHaveBeenCalledWith({
      total: 10,
      occupied: 5,
      free: 5,
    });
  });

  it('should set isLoading to false on error', () => {
    overviewService.getOverview.and.returnValue(throwError(() => new Error('fail')));
    component.loadData();
    expect(component.isLoading).toBeFalse();
  });
});