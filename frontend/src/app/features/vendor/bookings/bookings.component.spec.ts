import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { BookingsComponent } from './bookings.component';
import { BookingsService } from './bookings.service';
import { ActivatedRoute } from '@angular/router';

describe('BookingsComponent', () => {
  let component: BookingsComponent;
  let fixture: ComponentFixture<BookingsComponent>;
  let bookingsService: jasmine.SpyObj<BookingsService>;

  const mockRoute = {
    parent: {
      paramMap: of(new Map([['id', 'loc123']])),
    },
  };

  beforeEach(async () => {
    const serviceSpy = jasmine.createSpyObj('BookingsService', [
      'getLocationById',
      'getCurrentBookings',
      'getOverstayedBookings',
    ]);
    serviceSpy.getLocationById.and.returnValue(
      of({ locationName: 'Test Location' }),
    );
    serviceSpy.getCurrentBookings.and.returnValue(of([]));
    serviceSpy.getOverstayedBookings.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [BookingsComponent, RouterTestingModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: BookingsService, useValue: serviceSpy },
        { provide: ActivatedRoute, useValue: mockRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BookingsComponent);
    component = fixture.componentInstance;
    bookingsService = TestBed.inject(
      BookingsService,
    ) as jasmine.SpyObj<BookingsService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default activeTab as Current', () => {
    expect(component.activeTab).toBe('Current');
  });

  it('should switch tab using setTab', () => {
    component.setTab('Overstayed');
    expect(component.activeTab).toBe('Overstayed');
  });

  it('should return currentBookings for Current tab', () => {
    component.currentBookings = [{ id: '1' } as any];
    component.activeTab = 'Current';
    expect(component.getTabBookings().length).toBe(1);
  });

  it('should return overstayedBookings for Overstayed tab', () => {
    component.overstayedBookings = [{ id: '2' } as any, { id: '3' } as any];
    component.activeTab = 'Overstayed';
    expect(component.getTabBookings().length).toBe(2);
  });

  it('should set isLoading to false after data loads', () => {
    expect(component.isLoading).toBeFalse();
  });

  it('should set hasError on load failure', () => {
    bookingsService.getLocationById.and.returnValue(
      throwError(() => new Error('fail')),
    );
    component.loadData();
    expect(component.hasError).toBeTrue();
    expect(component.isLoading).toBeFalse();
  });
});
