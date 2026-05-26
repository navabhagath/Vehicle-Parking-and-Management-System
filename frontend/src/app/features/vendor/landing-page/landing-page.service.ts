import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../env/evironment";
import { map, Observable } from "rxjs";
import { ParkingLocation,DashboardResponse,ApiResponse, SubscriptionStatus} from "./landing-page.model";


@Injectable({
    providedIn : 'root' 
})

export class LandingPageService{

    private http : HttpClient = inject(HttpClient);
    private apiUrl = environment.apiUrl;

    getDashboardData() : Observable<DashboardResponse> {
        return this.http.get<ApiResponse<DashboardResponse>>(`${this.apiUrl}/vendor/dashboard`)
            .pipe(map(res => res.data));
    } 

    getSubscriptionStatus(): Observable<SubscriptionStatus> {
        return this.http
            .get<ApiResponse<SubscriptionStatus>>(`${this.apiUrl}/vendor/subscription/status`)
            .pipe(map(res => res.data));
    }

    renewSubscription(): Observable<SubscriptionStatus> {
        return this.http
            .patch<ApiResponse<SubscriptionStatus>>(`${this.apiUrl}/vendor/subscription/renew`, {})
            .pipe(map(res => res.data));
    }

    getLocationSlots(loc: ParkingLocation): number {
        return loc.capacity.twoWheeler + loc.capacity.fourWheeler;
    }

    getLocationOccupied(loc: ParkingLocation, occupancyMap: Map<string, number>): number {
        return occupancyMap.get(loc.id) || 0;
    }

}