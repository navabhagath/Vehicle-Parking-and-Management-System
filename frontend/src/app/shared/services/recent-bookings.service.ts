import { inject, Injectable } from '@angular/core';
import { CustomerDao } from '../customer.dao';
 
 
@Injectable({
  providedIn: 'root'
})
export class RecentBookingsService {
  private dao = inject(CustomerDao);
 
  getBookings(id: string,page:number,limit:number) {
    return this.dao.getRecentBookings(id,page,limit)
  }
}
 