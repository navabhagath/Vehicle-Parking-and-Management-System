import { inject, Injectable } from "@angular/core";
import { environment } from "../../../env/evironment";
import { HttpClient } from "@angular/common/http";
import { ParkingLocation } from "../landing-page/landing-page.model";
import { Observable } from "rxjs";

@Injectable({
    providedIn : 'root'
})

export class VendorLayoutService{

    api = environment.apiUrl;
    http : HttpClient = inject(HttpClient);
    
    getLocationName(locationId : string) : Observable<ParkingLocation>{
        return this.http.get<ParkingLocation>(`${this.api}/vendor/parkinglocations/${locationId}`)
    }
}