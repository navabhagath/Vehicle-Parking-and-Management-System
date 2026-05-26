import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { RecentBookingsService } from './recent-bookings.service';
import { CustomerDao } from '../customer.dao';

describe('RecentBookingsService', () => {
  let service: RecentBookingsService;
  let customerDao: jasmine.SpyObj<CustomerDao>;

  beforeEach(() => {
    const daoSpy = jasmine.createSpyObj('CustomerDao', ['getRecentBookings']);
    daoSpy.getRecentBookings.and.returnValue(of([{ id: 'b1' }]));

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: CustomerDao, useValue: daoSpy },
      ],
    });
    service = TestBed.inject(RecentBookingsService);
    customerDao = TestBed.inject(CustomerDao) as jasmine.SpyObj<CustomerDao>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call dao.getRecentBookings with correct params', () => {
    service.getBookings('user1', 1, 5);
    expect(customerDao.getRecentBookings).toHaveBeenCalledWith('user1', 1, 5);
  });

  it('should return observable from dao', (done) => {
    service.getBookings('user1', 1, 5).subscribe((result) => {
      expect(result).toEqual([{ id: 'b1' }] as any);
      done();
    });
  });
});
