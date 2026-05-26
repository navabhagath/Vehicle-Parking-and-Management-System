import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from "../../../env/evironment";
// import { Booking } from './vendor-analytics.model';
import { RevenueStatsResponse, VehiclePieData, VehiclePeriod,BarChartData,BarRange } from './vendor-analytics.model'; 
 
@Injectable({ providedIn: 'root' })
export class VendorAnalyticsService {
 
  private apiUrl = environment.apiUrl;
 
  constructor(private http: HttpClient) {}
 
  getRevenueStats(locationId: string): Observable<RevenueStatsResponse> {
    return this.http.get<RevenueStatsResponse>(
      `${this.apiUrl}/vendor/analytics/stats/${locationId}`,
    );
  }

  getVehiclePie(locationId: string, period: VehiclePeriod): Observable<VehiclePieData> {
    const params = new HttpParams().set('period', period);
    return this.http.get<VehiclePieData>(
      `${this.apiUrl}/vendor/analytics/vehicle-pie/${locationId}`,
      { params },
    );
  }

  getRevenueBar(locationId: string, range: BarRange): Observable<BarChartData> {
    const params = new HttpParams().set('range', range);
    return this.http.get<BarChartData>(
      `${this.apiUrl}/vendor/analytics/revenue-bar/${locationId}`,
      { params },
    );
  }
  
}