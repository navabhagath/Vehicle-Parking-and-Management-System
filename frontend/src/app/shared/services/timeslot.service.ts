import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { Booking } from '../../models/booking.model';
import { environment } from '../../env/evironment';

@Injectable({
  providedIn: 'root',
})
export class TimeslotService {
  private apiUrl = `${environment.apiUrl2}/bookings`;

  private newBooking$ = new BehaviorSubject<Booking | null>(null);
  readonly latestBooking$ = this.newBooking$.asObservable();

  constructor(private http: HttpClient) {}

  createBooking(booking: Booking): Observable<Booking> {
    return this.http.post<Booking>(this.apiUrl, booking);
  }

  getBookingsByLocation(locationId: string): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.apiUrl}/getBookingsByStatus/?locationId=${locationId}`);
  }

  getBookingsByCustomer(customerId: string): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.apiUrl}/getBookingsByStatus/?customerId=${customerId}`);
  }

  notifyNewBooking(booking: Booking): void {
    this.newBooking$.next(booking);
  } 
}
