import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { environment } from '../../../env/evironment';  

@Injectable({
  providedIn: 'root'
})
export class RevenueService {
  private baseUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

 
  getRawRevenueData(): Observable<any> {
   return this.http.get<any>(`${this.baseUrl}/admin/getRevenue`);
  }

  sendEmailReminder(vendorData: any): Observable<any> {
   
    return this.http.post(`${this.baseUrl}/admin/send-reminder`, vendorData);
  }
}


