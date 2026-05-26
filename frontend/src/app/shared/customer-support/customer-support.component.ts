import { Component, inject, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe, Location } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';
 
import { CustomerSupportDao } from './customer-support.dao';
import { Booking } from '../../models/booking.model';
import { Vehicle } from '../../models/vehicle.model';
import { ParkingLocation } from '../../models/parkingLocation.model';
import { User } from '../../models/User.model';
import { ModalService } from '../modal/modal.service';
import { ErrorHandlerService } from '../services/errorhandler.service';
 
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
  imports: [DatePipe, CurrencyPipe, CommonModule, FormsModule],
  templateUrl: './customer-support.component.html',
  styleUrl: './customer-support.component.scss'
})
export class RaiseTicketComponent implements OnInit, OnDestroy {
  private user: User | null = null;
  private sub = new Subscription();
  @ViewChild('ticketForm') ticketForm!: NgForm;
submitted = false;
 
  ticket: Ticket = {
    subject: '',
    email: '',
    issue: '',
    category: '',
    bookingId: '',
  };
 
  bookingDropdown: result[] = [];
  bookings: Bookings[] = [];
 
  private dao = inject(CustomerSupportDao);
  private modal = inject(ModalService)
  private errorHandler = inject(ErrorHandlerService)
 
  constructor(private location: Location) {}
 
  ngOnInit(): void {
    // 1. Subscribe to user
    this.sub.add(
      this.dao.currentUser$.subscribe(userData => {
        this.user = userData;
      })
    );
 
    // 2. getBookingDropdown already switches off currentUser$ internally
    this.sub.add(
      this.dao.getBookingDropdown().subscribe({
        next: (val) => {
          this.bookings = val;
        },
        error:(err)=>{
          this.errorHandler.handleError(err, 'RaiseTicket');
        }
      })
    );
  }
 
  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
 
  goBack(): void {
    this.location.back();
  }
 
  selectBooking(booking: Bookings): void {
    this.ticket.bookingId = booking.id;
  }
 
getSelectedBookingLabel(): string {
    const b = this.bookings.find(bk => bk.id === this.ticket.bookingId);
    return b ? `${b.id} ` : '';
  }
 
 
 
async onSubmit() {
  this.submitted = true;
 
  if (this.ticketForm.invalid || !this.user) {
    this.ticketForm.controls['subject']?.markAsTouched();
    this.ticketForm.controls['issue']?.markAsTouched();
    this.ticketForm.controls['email']?.markAsTouched();
    return;
  }
 
  const formData = new FormData();
  formData.append('subject', this.ticket.subject);
  formData.append('description', this.ticket.issue);
  formData.append('bookingId', this.ticket.bookingId);
  formData.append('category', this.ticket.category);
  formData.append('status', 'OPEN');
  formData.append('emailId', this.ticket.email);
  formData.append('creatorId', this.user.id);
  formData.append('createdAt',new Date().toISOString())
 
  const confirmed = await this.modal.confirm({
    title: 'Raise Ticket',
    message: 'Are you sure you want to raise ticket?',
    confirmText: 'Raise',
    type: 'warn',
  });
 
  if (confirmed) {
    this.dao.assignHandler(formData).subscribe({
      next: (val) => {
        console.log(val);
        this.goBack();
      },
      error:(err)=>{
       this.errorHandler.handleError(err, 'RaiseTicket');
      }
    });
  }
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
 