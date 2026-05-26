

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../env/evironment';  

@Injectable({
  providedIn: 'root'
})
export class AdminDashboardService {
  private baseUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

 
  getDashboardStats(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/admin/stats`);
  }
}