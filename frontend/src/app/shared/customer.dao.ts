// src/app/customer/customer.dao.ts
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../env/evironment';

import { AuthService } from '../core/services/auth.service';
import { Wallet } from '../models/Wallet.model';
import { User } from '../models/User.model';
import { Vehicle } from '../models/vehicle.model';
import { ParkingLocation } from '../models/parkingLocation.model';
import { Booking } from '../models/booking.model';
import { Transaction } from '../models/transaction.model';
import { Ticket } from '../models/ticket.model';

interface BookingResult {
  booking: Booking;
  vehicle: Vehicle;
  location: ParkingLocation;
}

@Injectable({
  providedIn: 'root',
})
export class CustomerDao {
  private api = environment.apiUrl2;
  private auth = inject(AuthService);
  private walletSubject = new BehaviorSubject<Wallet | null>(null);
  wallet$ = this.walletSubject.asObservable();
  private newBookingSubject = new BehaviorSubject<Booking | null>(null);
  readonly latestBooking$ = this.newBookingSubject.asObservable();

  constructor(private http: HttpClient) {}

  get currentUser$(): Observable<User | null> {
    return this.auth.currentUser$;
  }

  // ── Vehicle ──────────────────────────────────────────────
  getVehiclesByUser(userId: string): Observable<Vehicle[]> {
    return this.http.get<Vehicle[]>(`${this.api}/customer/vehicle/?userId=${userId}`);
  }
  getVehiclesByVehicleID(vehicleId: string): Observable<Vehicle> {
    return this.http.get<Vehicle>(`${this.api}/customer/vehicle/${vehicleId}`);
  }
  addVehicle(vehicle: Partial<Vehicle>): Observable<Vehicle> {
    return this.http.post<Vehicle>(`${this.api}/customer/vehicle`, vehicle);
  }
  updateVehicle(id: string, data: Partial<Vehicle>): Observable<Vehicle> {
    return this.http.patch<Vehicle>(`${this.api}/customer/vehicle/${id}`, data);
  }
  deleteVehicle(id: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/customer/vehicle/${id}`);
  }

  // ── Wallet ───────────────────────────────────────────────
  getWalletByUser(userId: string): Observable<Wallet[]> {
    return this.http.get<Wallet[]>(`${this.api}/customer/wallet?userId=${userId}`).pipe(
      tap((wallets) => {
        if (wallets.length > 0) this.walletSubject.next(wallets[0]);
      }),
    );
  }
  refreshWallet(wallet: Wallet): void {
    this.walletSubject.next(wallet);
  }

  // ── Locations ────────────────────────────────────────────
  getAllLocations(): Observable<ParkingLocation[]> {
    return this.http.get<ParkingLocation[]>(`${this.api}/customer/locations`);
  }
  getLocationById(id: string): Observable<ParkingLocation> {
    return this.http.get<ParkingLocation>(`${this.api}/customer/locations/getLocationById/${id}`);
  }

  // ── Bookings ─────────────────────────────────────────────
  createBooking(booking: Partial<Booking>): Observable<Booking> {
    return this.http.post<Booking>(`${this.api}/bookings`, booking);
  }
  getBookingsByUser(userId: string, page: number, limit: number): Observable<Booking[]> {
    const url = `${this.api}/customer/bookings?customerId=${userId}&_page=${page}&_limit=${limit}`;
    return this.http.get<Booking[]>(url);
  }
  getBookingsByCustomer(customerId: string): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.api}/customer/bookings?customerId=${customerId}`);
  }
  getActiveBooking(userId: string): Observable<Booking[]> {
    return this.http.get<Booking[]>(
      `${this.api}/customer/bookings/getBookingsByStatus?customerId=${userId}&status=ACTIVE`,
    );
  }
  getRecentBookings(userId: string, page: number, limit: number): Observable<BookingResult[]> {
    const url = `${this.api}/customer/bookings/recent?customerId=${userId}&_page=${page}&_limit=${limit}`;
    return this.http.get<BookingResult[]>(url);
  }
  updateBooking(id: string, data: Partial<Booking>): Observable<Booking> {
    return this.http.patch<Booking>(`${this.api}/bookings/${id}`, data);
  }
  getActiveBookingsByLocation(locationId: string, status: string): Observable<Booking[]> {
    return this.http.get<Booking[]>(
      `${this.api}/customer/bookings/getBookingsByStatus?locationId=${locationId}&status=${status}`,
    );
  }
  notifyNewBooking(booking: Booking): void {
    this.newBookingSubject.next(booking);
  }

  // ── Transactions ─────────────────────────────────────────
  getTransactions(walletId: string): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.api}/customer/transactions?walletId=${walletId}`);
  }

  // ── Tickets ──────────────────────────────────────────────
  getTicketsByUser(userId: string): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(`${this.api}/customer/tickets?creatorId=${userId}`);
  }
  createTicket(ticket: Partial<Ticket>): Observable<Ticket> {
    return this.http.post<Ticket>(`${this.api}/customer/tickets`, ticket);
  }
}
