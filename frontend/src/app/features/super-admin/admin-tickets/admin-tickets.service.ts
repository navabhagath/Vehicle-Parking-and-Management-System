// src/app/customer/dao.ts
 
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, switchMap } from 'rxjs';
import { environment } from '../../../env/evironment';
;
 
import { User } from '../../../models/User.model';
import { Ticket } from '../../../models/ticket.model';
import { AuthService } from '../../../core/services/auth.service';
 
type status2 = 'APPROVED' | 'OPEN' | 'REJECTED' | 'IN_PROGRESS';
 
@Injectable({
  providedIn: 'root'
})
export class AdminTicketsService {
 
  private api = environment.apiUrl;
  private api2 = environment.apiUrl2;
  private auth  = inject(AuthService)
 
  constructor(private http: HttpClient) {}
 
  get currentUser$(): Observable<User | null> {
    return this.auth.currentUser$;
  }
 
  getTicketsByUser(): Observable<Ticket[]> {
    return this.currentUser$.pipe(
      switchMap(user =>
        this.http.get<Ticket[]>(`${this.api2}/customer/tickets/handler/?handlerId=${user?.id}`)
      )
    );
  }
 
  updateTicketStatus(ticketId: string, newStatus: status2) {
    return this.http.patch(`${this.api2}/customer/tickets/${ticketId}`, { status: newStatus });
  }
}
 