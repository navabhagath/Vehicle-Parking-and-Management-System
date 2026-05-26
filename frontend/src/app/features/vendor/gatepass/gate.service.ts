import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Booking } from './gatepass.model';
import { ParkingLocation } from './gatepass.model';
import { environment } from '../../../env/evironment';

@Injectable({
  providedIn: 'root',
})
export class GateService {
  private apiUrl = environment.apiUrl2;

  constructor(private http: HttpClient) {}

  getLocationById(locationId: string): Observable<ParkingLocation> {
    return this.http.get<ParkingLocation>(
      `${this.apiUrl}/vendor/parkinglocations/${locationId}`,
    );
  }

  getBookingById(bookingId: string, locationId: string): Observable<Booking> {
    return this.http.get<Booking>(
      `${this.apiUrl}/vendor/gatepass/${bookingId}/${locationId}`,
    );
  }

  checkIn(bookingId: string, locationId: string): Observable<Booking> {
    return this.http.patch<Booking>(
      `${this.apiUrl}/vendor/gatepass/checkin/${bookingId}/${locationId}`,
      {},
    );
  }


  checkOut(
    booking: Booking,
    _finalAmount: number,
    locationId: string,
  ): Observable<any> {
    return this.http.post(`${this.apiUrl}/vendor/gatepass/checkout`, {
      bookingId: booking.id,
      locationId,
    });
  }


  calculateFinalAmount(booking: Booking, pricePerHour: number): number {
    if (!booking.actualCheckIn) return 0;

    const actualHours = Math.ceil(
      (new Date().getTime() - new Date(booking.actualCheckIn).getTime()) /
        (1000 * 60 * 60),
    );

    return Math.max(1, actualHours) * pricePerHour;
  }
}
