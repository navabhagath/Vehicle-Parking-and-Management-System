

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { environment } from '../../../env/evironment';  

@Injectable({
  providedIn: 'root'
})
export class VendorService {
  private baseUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

 
  getVendorData(): Observable<any> {
   return this.http.get<any>(`${this.baseUrl}/admin/vendor-management`);
  }

  updateLocationStatus(locationId: string, status: string): Observable<any> {
    // We send a PATCH request to the backend
    return this.http.patch(`${this.baseUrl}/admin/update-status/${locationId}`, {
      status: status
    });
}

}
