import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { GateService } from './gate.service';
import { Booking } from './gatepass.model';
import { ParkingLocation } from './gatepass.model';

@Component({
  selector: 'app-gate',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gatepass.html',
  styleUrls: ['./gatepass.scss'],
})
export class GateComponent implements OnInit {
  locationId: string = '';
  location: ParkingLocation | null = null;
  searchId: string = '';
  booking: Booking | null = null;
  finalAmount: number = 0; // estimated, for display only — backend recomputes
  message: string = '';
  error: string = '';

  constructor(
    private route: ActivatedRoute,
    private gateService: GateService,
  ) {}

  ngOnInit(): void {
    this.route.parent?.paramMap.subscribe((params) => {
      this.locationId = params.get('id') || '';
      if (this.locationId) {
        this.loadLocation();
      }
    });
  }

  private loadLocation(): void {
    this.gateService.getLocationById(this.locationId).subscribe({
      next: (loc) => {
        this.location = loc;
      },
      error: (err) => {
        this.error = err.error?.message || 'Location not found';
      },
    });
  }

  searchBooking(): void {
    this.resetState();
    if (!this.searchId.trim()) return;

    this.gateService
      .getBookingById(this.searchId.trim(), this.locationId)
      .subscribe({
        next: (booking) => {
          this.booking = booking;
          if (booking.status === 'ACTIVE' && this.location) {
            const price = this.getPricePerHour();
            this.finalAmount = this.gateService.calculateFinalAmount(
              booking,
              price,
            );
          }
        },
        error: (err) => {
          this.error = err.error?.message || 'Booking not found';
        },
      });
  }

  onCheckIn(): void {
    if (!this.booking) return;
    this.gateService.checkIn(this.booking.id!, this.locationId).subscribe({
      next: (updatedBooking) => {
        this.booking = updatedBooking;
        this.message = 'Vehicle checked in successfully!';
        if (this.location) {
          this.finalAmount = this.gateService.calculateFinalAmount(
            updatedBooking,
            this.getPricePerHour(),
          );
        }
      },
      error: (err) => {
        this.error = err.error?.message || 'Check-in failed';
      },
    });
  }

  onCheckOut(): void {
    if (!this.booking) return;
    this.gateService
      .checkOut(this.booking, this.finalAmount, this.locationId)
      .subscribe({
        next: (response) => {
          const finalAmount = response?.finalAmount ?? this.finalAmount;
          this.message = `Vehicle checked out. Amount deducted: ₹${finalAmount}`;
          if (this.booking) {
            this.booking.status = 'COMPLETED';
            this.booking.finalDeductedAmount = finalAmount;
          }
        },
        error: (err) => {
          this.error = err.error?.message || 'Check-out failed';
        },
      });
  }

  clearSearch(): void {
    this.searchId = '';
    this.resetState();
  }

  private getPricePerHour(): number {
    if (!this.location || !this.booking) return 0;
    return this.booking.type === '4-WHEELER'
      ? this.location.carPrice
      : this.location.bikePrice;
  }

  private resetState(): void {
    this.booking = null;
    this.finalAmount = 0;
    this.message = '';
    this.error = '';
  }
}
