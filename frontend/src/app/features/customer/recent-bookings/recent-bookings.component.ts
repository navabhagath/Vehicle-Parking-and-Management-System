import { Component, inject, Input, OnInit } from '@angular/core';
import { RecentBookingsService } from '../../../shared/services/recent-bookings.service';

import { CommonModule, DatePipe } from '@angular/common';
import { Booking } from '../../../models/booking.model';
import { Vehicle } from '../../../models/vehicle.model';
import { ParkingLocation } from '../../../models/parkingLocation.model';
import { User } from '../../../models/User.model';


interface result{
  booking:Booking,
  vehicle:Vehicle,
  location:ParkingLocation
}
@Component({
  selector: 'app-recent-bookings',
  standalone: true,
  imports: [CommonModule,DatePipe],
  templateUrl: './recent-bookings.component.html',
  styleUrl: './recent-bookings.component.scss'
})
export class RecentBookingsComponent implements OnInit {
  private bookings = inject(RecentBookingsService)
  @Input() user!:User;
  res:result[]=[];


  ngOnInit(): void {
      this.bookings.getBookings(this.user.id,1,5).subscribe({
        next:(val)=>{
          console.log(val);
          this.res = val;
        }
      })
  }



}
