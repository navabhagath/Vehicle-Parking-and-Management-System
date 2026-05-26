// src/app/customer/location-dropdown/location-dropdown.component.ts

import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomerDao } from '../../../shared/customer.dao';
import { ParkingLocation } from '../../../models/parkingLocation.model';

@Component({
  selector: 'app-location-dropdown',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './location-dropdown.component.html',
  styleUrls: ['./location-dropdown.component.scss'],
})
export class LocationDropdownComponent implements OnInit {
  locations: ParkingLocation[] = [];
  selectedLocation: ParkingLocation | null = null;

  @Output() locationChange = new EventEmitter<ParkingLocation>();

  constructor(private dao: CustomerDao) {}

  ngOnInit(): void {
    this.dao.getAllLocations().subscribe({
      next: (locs) => {
        this.locations = locs;
        if (locs.length > 0) {
          this.selectedLocation = locs[0];
          this.locationChange.emit(this.selectedLocation);
        }
      },
    });
  }

  selectLocation(loc: ParkingLocation): void {
    this.selectedLocation = loc;
    this.locationChange.emit(loc);
  }
}
