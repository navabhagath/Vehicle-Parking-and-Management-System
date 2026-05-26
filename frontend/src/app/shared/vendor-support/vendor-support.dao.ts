// src/app/customer/dao.ts
 
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, switchMap } from 'rxjs';
import { environment } from '../../env/evironment';
import { User } from '../../models/User.model';
import { Ticket } from '../../models/ticket.model';
import { AuthService } from '../../core/services/auth.service';
 
@Injectable({
  providedIn: 'root'
})
 
 
export class VendorSupportDao {
  private api = environment.apiUrl;
  private api2 = environment.apiUrl2;
  private auth  = inject(AuthService)
 
 
  constructor(private http: HttpClient) {}
 
  // Observable-based currentUser$ — same pattern as CustomerDao
  get currentUser$(): Observable<User | null> {
    return this.auth.currentUser$;
  }
 
 
 
assignHandler(formData: FormData): Observable<Ticket> {
  console.log("assignHandler");
  return this.http.get<User[]>(`${this.api2}/customer/users/getUserByRole/?role=SUPER_ADMIN`).pipe(
    map(users => {
      if (!users || users.length === 0) {
        throw new Error('No SUPER_ADMIN user found');
      }
      return users[0];
    }),
    switchMap((admin: User) => {
      formData.append('handlerId', admin.id);
 
      const ticketPayload: any = {};
      formData.forEach((value, key) => {
        ticketPayload[key] = value;
      });
 
      console.log('Submitting Ticket Payload:', ticketPayload);
      return this.createTicket(ticketPayload);
    })
  );
}
 
  createTicket(data: Ticket): Observable<Ticket> {
    return this.http.post<Ticket>(`${this.api2}/customer/tickets`, data);
  }
}
 