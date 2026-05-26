import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../../../env/evironment";
import { VendorData } from "./vendor-profile.model";
import { filter, Observable } from "rxjs";

@Injectable({
    providedIn : 'root'
})

export class VendorProfileService{

   private  http : HttpClient = inject(HttpClient);

    private api = environment.apiUrl;

    getVendorProfileData() : Observable<VendorData>{
        return this.http.get<VendorData>(`${this.api}/vendor/profileData`);
    }
    
}