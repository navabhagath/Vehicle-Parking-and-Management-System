import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [RouterModule, RouterOutlet],
  templateUrl: './booking.html',
  styleUrl: './booking.scss',
})
export class Booking {}
