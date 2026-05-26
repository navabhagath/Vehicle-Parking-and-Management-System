import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Booking } from '../../models/booking.model';
import { Vehicle } from '../../models/vehicle.model';
import { ParkingLocation } from '../../models/parkingLocation.model';
import { User } from '../../models/User.model';
import { VendorSupportDao } from './vendor-support.dao';
 
interface Bookings {
  id: string;
  vehicleName: string;
  location: string;
  checkIn: string;
  checkOut: string;
  finalAmount: number;
}
 
interface Ticket {
  subject: string;
  email: string;
  issue: string;
  category: string;
  bookingId: string;
}
 
interface result {
  booking: Booking;
  vehicle: Vehicle;
  location: ParkingLocation;
}
 
@Component({
  selector: 'app-customer-support',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './vendor-support.component.html',
  styleUrl: './vendor-support.component.scss'
})
export class RaiseTicketComponent implements OnInit, OnDestroy {
  private user: User | null = null;
  private sub = new Subscription();
 
  /** Tracks whether the user has attempted to submit */
  formSubmitted = false;
 
  ticket: Ticket = {
    subject: '',
    email: '',
    issue: '',
    category: '',
    bookingId: '',
  };
 
  bookingDropdown: result[] = [];
  bookings: Bookings[] = [];
 
  private dao = inject(VendorSupportDao);
 
  constructor(private location: Location) {}
 
  ngOnInit(): void {
    this.sub.add(
      this.dao.currentUser$.subscribe(userData => {
        this.user = userData;
      })
    );
  }
 
  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
 
  goBack(): void {
    this.location.back();
  }
 
  /** Called from template when a category item is clicked */
  selectCategory(value: string): void {
    this.ticket.category = value;
  }
 
  onSubmit(form: NgForm): void {
    // Mark form as submitted so all error messages become visible
    this.formSubmitted = true;
 
    // Validate Angular form controls
    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }
 
    // Validate category separately (not a standard form control)
    if (!this.ticket.category) {
      return;
    }
 
    // Guard: user must be loaded
    if (!this.user) {
      console.error('User data is not available.');
      return;
    }
 
    const formData = new FormData();
    formData.append('subject', this.ticket.subject.trim());
    formData.append('description', this.ticket.issue.trim());
    formData.append('bookingId', this.ticket.bookingId);
    formData.append('category', this.ticket.category);
    formData.append('status', 'OPEN');
    formData.append('emailId', this.ticket.email.trim());
    formData.append('creatorId', this.user.id);
    formData.append('createdAt',new Date().toISOString());
 
    this.dao.assignHandler(formData).subscribe({
      next: (val) => {
        console.log('Ticket submitted:', val);
        this.goBack();
      },
      error: (err) => {
        console.error('Failed to submit ticket:', err);
      }
    });
  }
 
  categories = [
    { value: 'CLAIM_MONEY', label: 'Claim Money' },
    { value: 'DISPUTE', label: 'Dispute' },
    { value: 'SUPPORT', label: 'Support' }
  ];
 
  getCategoryLabel(value: string): string {
    return this.categories.find(c => c.value === value)?.label || '';
  }
}