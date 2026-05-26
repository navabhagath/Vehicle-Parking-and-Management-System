import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ParkingLocation } from '../../models/parkingLocation.model';
import { environment } from '../../env/evironment';

@Injectable({
  providedIn: 'root',
})
export class ParkingLocationService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ParkingLocation[]> {
    return this.http.get<ParkingLocation[]>(`${this.apiUrl}/parkinglocations`);
  }

  getById(id: string): Observable<ParkingLocation> {
    return this.http.get<ParkingLocation>(`${this.apiUrl}/parkinglocations/${id}`);
  }

  getActiveBookings(locationId: string, status: string): Observable<any[]> {
    const params = new HttpParams()
      .set('locationId', locationId)
      .set('status', status);

    return this.http.get<any[]>(`${this.apiUrl}/bookings`, { params });
  }
}