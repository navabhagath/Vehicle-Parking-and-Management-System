// src/app/customer/customer-layout/customer-layout.component.ts

import { Component, ViewChild, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';
import { LocationDropdownComponent } from '../location-dropdown/location-dropdown.component';
import { ProfileOffcanvasComponent } from '../profileoff-canvas/profileoff-canvas.component';

import { CustomerDao } from '../../../shared/customer.dao';
import { CustomerStateService } from '../../../shared/services/selected-location.service';
import { User } from '../../../models/User.model';
import { ParkingLocation } from '../../../models/parkingLocation.model';

@Component({
  selector: 'app-customer-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    LocationDropdownComponent,
    ProfileOffcanvasComponent,
  ],
  templateUrl: './customer-layout.component.html',
  styleUrls: ['./customer-layout.component.scss'],
})
export class CustomerLayoutComponent implements OnInit, OnDestroy {
  user: User | null = null;
  profileImg = '';

  @ViewChild('profileOffcanvas') profileOffcanvas!: ProfileOffcanvasComponent;

  private dao = inject(CustomerDao);
  private customerState = inject(CustomerStateService);
  private sub = new Subscription();

  ngOnInit(): void {
    this.sub.add(
      this.dao.currentUser$.subscribe((userData) => {
        this.user = userData;
        if (userData) {
          this.profileImg = `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=4BD2F8&color=fff&rounded=true&size=44`;
        }
      }),
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  onLocationChange(loc: ParkingLocation): void {
    this.customerState.setLocation(loc);
  }

  openProfile(): void {
    this.profileOffcanvas.open();
  }
}
