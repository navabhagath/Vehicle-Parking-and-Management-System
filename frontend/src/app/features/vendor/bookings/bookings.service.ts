import { inject, Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { environment } from "../../../env/evironment";
import { map, Observable } from "rxjs";
import { Booking, ParkingLocation } from "../overview/overview.model";


@Injectable({
    providedIn : 'root' 
})

export class BookingsService {

    private http : HttpClient = inject(HttpClient);
    private apiUrl = environment.apiUrl;


    getLocationById(locationId: string): Observable<ParkingLocation> {
        return this.http.get<ParkingLocation>(`${this.apiUrl}/vendor/parkinglocations/${locationId}`);
    }

    getCurrentBookings(locationId: string): Observable<Booking[]> { 
        const params = new HttpParams().set('type','current');
        return this.http.get<Booking[]>(`${this.apiUrl}/vendor/bookings/${locationId}`,{ params });
    } 

    getOverstayedBookings(locationId: string): Observable<Booking[]> {
        const params = new HttpParams().set('type','overstayed');
        return this.http.get<Booking[]>(`${this.apiUrl}/vendor/bookings/${locationId}`,{ params });
    }
}