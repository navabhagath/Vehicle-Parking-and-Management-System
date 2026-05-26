import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Vehicle } from '../../../models/vehicle.model';
import { ParkingLocation } from '../../../models/parkingLocation.model';
import { Booking } from '../../../models/booking.model';
import { DurationOption } from './choose-timeslot.model';
import { CustomerDao } from '../../../shared/customer.dao';
import { User } from '../../../models/User.model';

@Component({
  selector: 'app-choose-timeslot',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './choose-timeslot.html',
  styleUrl: './choose-timeslot.scss',
})
export class ChooseTimeslotComponent implements OnInit {
  vehicle: Vehicle | null = null;
  location: ParkingLocation | null = null;
  user: User | null = null;
  isSubmitting = false;

  durationOptions: DurationOption[] = [];
  maxHours = 0;

  selectedOption: string | null = null;
  customHours = 4;

  constructor(
    private router: Router,
    private customerDao: CustomerDao,
  ) {}

  ngOnInit(): void {
    this.vehicle =
      this.router.getCurrentNavigation()?.extras.state?.['vehicle'] ??
      history.state?.['vehicle'];

    this.location =
      this.router.getCurrentNavigation()?.extras.state?.['location'] ??
      history.state?.['location'];

    this.user =
      this.router.getCurrentNavigation()?.extras.state?.['user'] ??
      history.state?.['user'];

    if (!this.vehicle || !this.location) {
      this.router.navigate(['/customer/choose-vehicle']);
      return;
    }

    const d = new Date();
    console.log(d);

    this.calculateMaxHours();
    this.buildDurationOptions();
  }

  private calculateMaxHours(): void {
    if (!this.location) return;

    const now = new Date();
    const [endH, endM] = this.location.operationalHours.end
      .split(':')
      .map(Number);

    const closingTime = new Date();
    closingTime.setHours(endH, endM, 0, 0);

    const diffMs = closingTime.getTime() - now.getTime();
    this.maxHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (this.maxHours < 1) this.maxHours = 0;
  }

  private buildDurationOptions(): void {
    this.durationOptions = [];

    for (let i = 1; i <= Math.min(this.maxHours, 3); i++) {
      this.durationOptions.push({
        label: `${i} hr`,
        value: `${i}`,
        hours: i,
      });
    }

    if (this.maxHours > 3) {
      this.durationOptions.push({
        label: 'More +',
        value: 'more',
        hours: null,
      });
      this.customHours = 4;
    }
  }

  get pricePerHour(): number {
    if (!this.vehicle || !this.location) return 0;
    return this.vehicle.type === '4-WHEELER'
      ? this.location.carPrice
      : this.location.bikePrice;
  }

  get selectedHours(): number {
    if (!this.selectedOption) return 0;
    if (this.selectedOption === 'more') return this.customHours;
    return parseInt(this.selectedOption, 10);
  }

  get totalPrice(): number {
    return this.selectedHours * this.pricePerHour;
  }

  selectOption(value: string): void {
    this.selectedOption = value;
  }

  increment(): void {
    if (this.customHours < this.maxHours) this.customHours++;
  }

  decrement(): void {
    if (this.customHours > 4) this.customHours--;
  }

  confirmDuration(): void {
    if (!this.selectedOption || !this.vehicle || !this.location || !this.user)
      return;

    const now = new Date();
    const scheduledEnd = new Date(
      now.getTime() + this.selectedHours * 60 * 60 * 1000,
    );

    const booking: Partial<Booking> = {
      customerId: this.user.id,
      vehicleId: this.vehicle.id,
      locationId: this.location.id,
      plateNumber: this.vehicle.plateNumber,
      customerName: this.user.name,
      type: this.vehicle.type,
      scheduledStartTime: now.toISOString(),
      scheduledEndTime: scheduledEnd.toISOString(),
      actualCheckIn: null,
      actualCheckOut: null,
      finalDeductedAmount: 0.0,
      status: 'CONFIRMED',
      qrData: `${this.user.id}-${this.vehicle.id}-${now.getTime()}`,
    };

    this.isSubmitting = true;

    this.customerDao.createBooking(booking).subscribe({
      next: (saved) => {
        this.isSubmitting = false;
        this.customerDao.notifyNewBooking(saved);
        this.router.navigate(['customer/dashboard'], {});
      },
      error: (err) => {
        console.error('Booking failed', err);
        this.isSubmitting = false;
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/customer/choose-location'], {
      state: {
        vehicle: this.vehicle,
        user: this.user,
        selectedLocation: this.location,
      },
    });
  }
}
