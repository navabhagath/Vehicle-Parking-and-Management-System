import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../env/evironment";
import {  Observable } from "rxjs";
import { OverviewResponse } from "./overview.model";

@Injectable({
    providedIn : 'root'
})

export class OverviewService{
    private http : HttpClient = inject(HttpClient);
    private apiUrl = environment.apiUrl;
    

    getOverview(locationId: string): Observable<OverviewResponse> {
        return this.http.get<OverviewResponse>(
          `${this.apiUrl}/vendor/locations/${locationId}/overview`
        );
    }
}