// src/app/customer/dao.ts
 
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, switchMap } from 'rxjs';
import { environment } from '../../env/evironment';
 
import { RecentBookingsService } from '../../shared/services/recent-bookings.service';
 
import { Booking } from '../../models/booking.model';
import { Vehicle } from '../../models/vehicle.model';
import { ParkingLocation } from '../../models/parkingLocation.model';
import { User } from '../../models/User.model';
import { Ticket } from '../../models/ticket.model';
import { AuthService } from '../../core/services/auth.service';
 
interface result {
  booking: Booking;
  vehicle: Vehicle;
  location: ParkingLocation;
}
 
@Injectable({
  providedIn: 'root'
})
export class CustomerSupportDao {
  private booking = inject(RecentBookingsService);
  private api = environment.apiUrl;
  private api2 = environment.apiUrl2;
  private auth  = inject(AuthService)
 
 
  constructor(private http: HttpClient) {}
 
  get currentUser$(): Observable<User | null> {
    return this.auth.currentUser$;
  }
 
  getBookingDropdown() {
    // Switch off the user stream so we always have the latest ID
    return this.currentUser$.pipe(
      switchMap(user =>
        this.booking.getBookings(user!.id, 1, 100).pipe(
          map((items: result[]) =>
            items.map(item => ({
              id: item.booking.id,
              vehicleName: item.vehicle.plateNumber,
              location: item.location.locationName,
              finalAmount: item.booking.finalDeductedAmount,
              checkIn: item.booking.scheduledStartTime,
              checkOut: item.booking.scheduledEndTime
            }))
          )
        )
      )
    );
  }
 
  assignHandler(formData: FormData): Observable<Ticket> {
    const bookingId = formData.get('bookingId') as string;
 
    return this.http.get<Booking>(`${this.api2}/customer/bookings/${bookingId}`).pipe(
      switchMap((book: Booking) =>
        this.http.get<ParkingLocation>(`${this.api2}/customer/locations/getLocationById/${book.locationId}`).pipe(
          map(location => ({ book, location }))
        )
      ),
      switchMap(({ book, location }) => {
        formData.append('handlerId', location.vendorId);
 
        const ticketPayload: any = {};
        formData.forEach((value, key) => {
          ticketPayload[key] = value;
        });
 
        console.log("Submitting Ticket Payload:", ticketPayload);
        return this.createTicket(ticketPayload);
      })
    );
  }
 
  createTicket(data: Ticket): Observable<Ticket> {
    return this.http.post<Ticket>(`${this.api2}/customer/tickets`, data);
  }
}
 