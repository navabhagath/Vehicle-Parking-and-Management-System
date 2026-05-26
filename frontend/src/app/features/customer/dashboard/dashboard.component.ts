import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { CustomerDao } from '../../../shared/customer.dao';
import { Router } from '@angular/router';
import { QRCodeModule } from 'angularx-qrcode';
 
import { CustomerStateService } from '../../../shared/services/selected-location.service';
import { AddVehicleComponent } from '../add-vehicle/add-vehicle.component';
import { ParkingLocationComponent } from '../parking-location/parking-location.component';
import { MyVehiclesComponent } from '../my-vehicles/my-vehicles.component';
import { DashboardWalletComponent } from '../dashboard-wallet/dashboard-wallet.component';
import { RecentBookingsComponent } from '../recent-bookings/recent-bookings.component';
import { TimeslotService } from '../../../shared/services/timeslot.service';
import { QrService } from '../../../shared/services/qr.service';
import { User } from '../../../models/User.model';
import { Vehicle } from '../../../models/vehicle.model';
import { ParkingLocation } from '../../../models/parkingLocation.model';
import { Booking } from '../../../models/booking.model';
import { WalletDao } from '../../../shared/wallet/wallet.dao';
 
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    QRCodeModule,
    AddVehicleComponent,
    ParkingLocationComponent,
    MyVehiclesComponent,
    DashboardWalletComponent,
    RecentBookingsComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  user: User | null = null;
  vehicles: Vehicle[] = [];
  selectedLocation: ParkingLocation | null = null;
  showAddVehicle = false;
  showAlert = false;
  walletValue = 0;
 
  currentBooking: Booking | null = null;
  qrData: string = '';
 
  private subscriptions = new Subscription();
  private router = inject(Router);
 
  constructor(
    private dao: CustomerDao,
    private customerState: CustomerStateService,
    private timeslotService: TimeslotService,
    private qrService: QrService
  ) {}
 
  ngOnInit(): void {
    const userSub = this.dao.currentUser$.subscribe((userData) => {
      if (userData) {
        this.user = userData;
        this.loadVehicles(userData.id);
        this.loadCurrentBooking(userData.id);
        this.dao.getWalletByUser(this.user.id).subscribe();
      }
    });
 
    const locSub = this.customerState.selectedLocation$.subscribe((loc) => {
      this.selectedLocation = loc;
    });
 
    const walletSub =  this.dao.wallet$.subscribe((wallet) => {
      if (wallet) this.walletValue = wallet.balance;
    });
   
 
    this.subscriptions.add(userSub);
    this.subscriptions.add(locSub);
    this.subscriptions.add(walletSub);
  }
 
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
 
  loadVehicles(userId: string): void {
    this.dao.getVehiclesByUser(userId).subscribe({
      next: (v) => {
        this.vehicles = v.sort(
          (a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0),
        );
      },
    });
  }
 
  loadCurrentBooking(customerId: string): void {
    this.timeslotService.getBookingsByCustomer(customerId).subscribe({
      next: (bookings) => {
        console.log(bookings)
        this.currentBooking = bookings.find(
          (b) => b.status === 'CONFIRMED' || b.status === 'ACTIVE'
        ) ?? null;
 
        if (this.currentBooking) {
          this.qrData = this.qrService.generateQrData(this.currentBooking);
        }
      },
    });
  }
 
  openAddVehicle() {
    this.showAddVehicle = true;
 
  }
 
  onAddVehicleClosed() {
    this.showAddVehicle = false;
  }
 
  onVehicleAdded(vehicle: Vehicle): void {
    this.vehicles = [...this.vehicles, vehicle].sort(
      (a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0),
    );
  }
 
  BookNow() {
    this.router.navigate(['/customer/choose-vehicle'], {
      state: {
        user: this.user,
        selectedLocation: this.selectedLocation
      }
    });
  }
 
  get hasVehicles(): boolean {
    return this.vehicles.length > 0;
  }
}
 
 