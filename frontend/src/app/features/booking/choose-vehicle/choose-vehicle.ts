import { Component, OnInit } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { Vehicle } from '../../../models/vehicle.model';
import { CustomerDao } from '../../../shared/customer.dao';
import { User } from '../../../models/User.model';
import { ParkingLocation } from '../../../models/parkingLocation.model';
import { ModalService } from '../../../shared/modal/modal.service';

@Component({
  selector: 'app-choose-vehicle',
  standalone: true,
  imports: [CommonModule, RouterModule, AsyncPipe],
  templateUrl: './choose-vehicle.html',
  styleUrl: './choose-vehicle.scss'
})
export class ChooseVehicleComponent implements OnInit {
  vehicles$!: Observable<Vehicle[]>;
  selectedVehicle: Vehicle | null = null;
  user: User | null = null;
  selectedLocation: ParkingLocation | null = null;
 
  get selectedVehicleId(): string | null {
    return this.selectedVehicle?.id ?? null;
  }
 
  constructor(private router: Router, private customerDao: CustomerDao, private modalService: ModalService) {}
 
  ngOnInit(): void {
    this.user =
      this.router.getCurrentNavigation()?.extras.state?.['user']
      ?? history.state?.['user'];
 
    this.selectedLocation =
      this.router.getCurrentNavigation()?.extras.state?.['selectedLocation']
      ?? history.state?.['selectedLocation'];
 
    if (!this.user) {
      this.router.navigate(['/customer/dashboard']);
      return;
    }
 
    this.vehicles$ = this.customerDao.getVehiclesByUser(this.user.id).pipe(
      tap((vehicles) => {
        const primary = vehicles.find(v => v.isPrimary);
        if (primary) this.selectedVehicle = primary;
      })
    );
  }
 
  selectVehicle(vehicle: Vehicle): void {
    this.selectedVehicle = vehicle;
  }

  goBack(): void {
    this.router.navigate(['/customer/dashboard']);
  }
 
  async onConfirm() {
    if (this.selectedVehicle) {
      this.router.navigate(['/customer/choose-location'], {
        state: {
          vehicle: this.selectedVehicle,
          user: this.user,
          selectedLocation: this.selectedLocation
        }
      });
    } else {
      await this.modalService.confirm({
      title: 'No Vehicle Selected',
      message: 'Please select a vehicle before continuing.',
      confirmText: 'OK',
    });
    }
  }
}
 