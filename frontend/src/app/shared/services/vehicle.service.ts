import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Vehicle } from '../../models/vehicle.model';

@Injectable({
  providedIn: 'root',
})
export class VehicleService {
  private URL = 'http://localhost:3000/vehicle';

  constructor(private http: HttpClient) {}

  getVehicles(): Observable<Vehicle[]> {
    return this.http.get<Vehicle[]>(this.URL);
  }

  getVehiclesByUser(userId: string): Observable<Vehicle[]> {
    return this.http.get<Vehicle[]>(`${this.URL}?userId=${userId}`);
  }
}