import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { RecentBookingsComponent } from './recent-bookings.component';
import { RecentBookingsService } from '../../../shared/services/recent-bookings.service';

describe('RecentBookingsComponent', () => {
  let component: RecentBookingsComponent;
  let fixture: ComponentFixture<RecentBookingsComponent>;
  let bookingsServiceSpy: jasmine.SpyObj<RecentBookingsService>;

  const mockResults = [
    { booking: { id: 'b1' }, vehicle: { id: 'v1' }, location: { id: 'l1' } },
    { booking: { id: 'b2' }, vehicle: { id: 'v2' }, location: { id: 'l2' } },
  ] as any[];

  beforeEach(async () => {
    bookingsServiceSpy = jasmine.createSpyObj('RecentBookingsService', [
      'getBookings',
    ]);
    bookingsServiceSpy.getBookings.and.returnValue(of(mockResults));

    await TestBed.configureTestingModule({
      imports: [RecentBookingsComponent],
      providers: [
        { provide: RecentBookingsService, useValue: bookingsServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RecentBookingsComponent);
    component = fixture.componentInstance;
    component.user = { id: 'u1', name: 'Test' } as any;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load bookings on init', () => {
    expect(bookingsServiceSpy.getBookings).toHaveBeenCalledWith('u1', 1, 5);
  });

  it('should set res with booking results', () => {
    expect(component.res.length).toBe(2);
    expect(component.res[0].booking.id).toBe('b1');
  });
});
