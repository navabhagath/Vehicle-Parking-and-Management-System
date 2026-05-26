import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Booking } from '../overview/overview.model';
import { ActivatedRoute } from '@angular/router';
import { BookingsService } from './bookings.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [CommonModule , DatePipe],
  templateUrl: './bookings.component.html',
  styleUrl: './bookings.component.scss'
})

export class BookingsComponent implements OnInit{
  
  isLoading = true;
  hasError = false;
  locationName : string = 'Loading....';
  activeTab = 'Current';
  currentBookings: Booking[] = [];
  overstayedBookings : Booking[] = [];
  arr = ['Current', 'Overstayed'];
  
  private route : ActivatedRoute = inject(ActivatedRoute);
  private bookingsService : BookingsService = inject(BookingsService);
  private locationId = '';

  ngOnInit(): void {

    this.route.parent?.paramMap.subscribe((params)=>{
      this.locationId = params.get('id') || '';
      if(this.locationId) this.loadData();
    })
  }
  
  loadData(): void {
    this.isLoading = true;
    this.hasError = false;

    forkJoin({
      location: this.bookingsService.getLocationById(this.locationId),
      current: this.bookingsService.getCurrentBookings(this.locationId),
      overstayed: this.bookingsService.getOverstayedBookings(this.locationId)
    }).subscribe({
      next: ({ location, current, overstayed }) => {
        this.locationName = location.locationName;
        this.currentBookings = current;
        this.overstayedBookings = overstayed;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false
        this.hasError = true;
      }
    });
  }

  setTab(tab: string): void {
    this.activeTab = tab;
  }

  getTabBookings(): Booking[] {
    if (this.activeTab === 'Overstayed') return this.overstayedBookings;
    return this.currentBookings;
  }
}
