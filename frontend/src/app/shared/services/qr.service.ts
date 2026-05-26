import { Injectable } from '@angular/core';
import { Booking } from '../.././models/booking.model';

@Injectable({
  providedIn: 'root',
})
export class QrService {

  generateQrData(booking: Booking): string {
    return [
      `Booking ID: ${booking.id}`,
      `Customer ID: ${booking.customerId}`,
      `Vehicle ID: ${booking.vehicleId}`,
      `Location ID: ${booking.locationId}`,
      `Scheduled Start: ${booking.scheduledStartTime}`,
      `Scheduled End: ${booking.scheduledEndTime}`,
      `Status: ${booking.status}`
    ].join('\n');
  }
}