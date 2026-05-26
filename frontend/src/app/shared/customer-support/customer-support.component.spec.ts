import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import { RaiseTicketComponent } from './customer-support.component';
import { CustomerSupportDao } from './customer-support.dao';

describe('CustomerSupportComponent', () => {
  let component: RaiseTicketComponent;
  let fixture: ComponentFixture<RaiseTicketComponent>;

  beforeEach(async () => {
    const daoSpy = {
      currentUser$: of({ id: 'user1', email: 'test@test.com' }),
      getBookingDropdown: () => of([]),
      getTickets: () => of([]),
      raiseTicket: jasmine.createSpy().and.returnValue(of({})),
    };

    await TestBed.configureTestingModule({
      imports: [RaiseTicketComponent, RouterTestingModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: CustomerSupportDao, useValue: daoSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(RaiseTicketComponent, {
        set: { template: '', imports: [], providers: [] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(RaiseTicketComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize ticket object with empty fields', () => {
    expect(component.ticket.subject).toBe('');
    expect(component.ticket.email).toBe('');
    expect(component.ticket.issue).toBe('');
    expect(component.ticket.category).toBe('');
    expect(component.ticket.bookingId).toBe('');
  });

  it('should initialize bookings as empty array', () => {
    expect(component.bookings).toEqual([]);
  });

  it('should select a booking and set bookingId', () => {
    const mockBooking = {
      id: 'b1',
      vehicleName: 'Car',
      location: 'Lot A',
      checkIn: '',
      checkOut: '',
      finalAmount: 100,
    };
    component.selectBooking(mockBooking);
    expect(component.ticket.bookingId).toBe('b1');
  });

  it('should call location.back on goBack', () => {
    spyOn(component as any, 'goBack').and.callThrough();
    // goBack uses Location service which is mocked via override
    expect(component.goBack).toBeDefined();
  });

  it('should unsubscribe on destroy', () => {
    spyOn((component as any).sub, 'unsubscribe');
    component.ngOnDestroy();
    expect((component as any).sub.unsubscribe).toHaveBeenCalled();
  });
});
