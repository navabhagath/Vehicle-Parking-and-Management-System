import { Component, OnInit, ChangeDetectorRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CustomerDao } from '../../../shared/customer.dao';
import { ParkingLocation } from '../../../models/parkingLocation.model';
import { User } from '../../../models/User.model';
import { Vehicle } from '../../../models/vehicle.model';

@Component({
  selector: 'app-choose-location',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './choose-location.html',
  styleUrls: ['./choose-location.scss'],
})
export class ChooseLocationComponent implements OnInit {
  preSelectedLocation: ParkingLocation | null = null;
  filteredLocations: ParkingLocation[] = [];
  selectedLocation: ParkingLocation | null = null;
  searchQuery = '';
  vehicle: Vehicle | null = null;
  user: User | null = null;
  isSearching = false;

  activeCountMap: Map<string, number> = new Map();

  mapModalLocation: ParkingLocation | null = null;
  mapIframeUrl: SafeResourceUrl | null = null;

  constructor(
    private customerDao: CustomerDao,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer,
  ) {}

  ngOnInit(): void {
    this.vehicle =
      this.router.getCurrentNavigation()?.extras.state?.['vehicle'] ??
      history.state?.['vehicle'];

    this.user =
      this.router.getCurrentNavigation()?.extras.state?.['user'] ??
      history.state?.['user'];

    this.preSelectedLocation =
    
      this.router.getCurrentNavigation()?.extras.state?.['selectedLocation'] ??
      history.state?.['selectedLocation'];

    if (!this.vehicle) {
      this.router.navigate(['/customer/choose-vehicle']);
      return;
    }

    if (this.preSelectedLocation) {
      this.filteredLocations = [this.preSelectedLocation];
      this.selectedLocation = this.preSelectedLocation;
      this.loadAvailability();
    }
  }

  onSearch(): void {
    const query = this.searchQuery.trim().toLowerCase();

    if (!query) {
      if (this.preSelectedLocation) {
        this.filteredLocations = [this.preSelectedLocation];
        this.selectedLocation = this.preSelectedLocation;
      } else {
        this.filteredLocations = [];
      }
      this.isSearching = false;
      this.cdr.detectChanges();
      return;
    }

    this.isSearching = true;
    this.selectedLocation = null;

    this.customerDao.getAllLocations().subscribe({
      next: (data) => {
        this.filteredLocations = data.filter(
          (loc) => loc.locationName.toLowerCase().includes(query),
        );
        this.isSearching = false;
        this.loadAvailability();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to search locations', err);
        this.isSearching = false;
        this.cdr.detectChanges();
      },
    });
  }

  private loadAvailability(): void {
    this.filteredLocations.forEach((loc) => {
      this.customerDao.getActiveBookingsByLocation(loc.id, 'ACTIVE').subscribe({
        next: (res) => {
          this.activeCountMap.set(loc.id, res.length);
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error(`Failed to load availability for ${loc.id}`, err);
        },
      });
    });
  }

  getPrice(loc: ParkingLocation): number {
    return this.vehicle?.type === '4-WHEELER' ? loc.carPrice : loc.bikePrice;
  }

  getAvailability(loc: ParkingLocation): boolean {
    const activeCount = this.activeCountMap.get(loc.id) ?? 0;
    const capacity =
      this.vehicle?.type === '4-WHEELER'
        ? loc.capacity.fourWheeler
        : loc.capacity.twoWheeler;

    return activeCount < capacity;
  }

  selectLocation(loc: ParkingLocation): void {
    if (!this.getAvailability(loc)) return;
    this.selectedLocation = loc;
  }

  isSelected(loc: ParkingLocation): boolean {
    return this.selectedLocation?.id === loc.id;
  }

  confirmLocation(): void {
    if (!this.selectedLocation) return;
    this.router.navigate(['/customer/choose-timeslot'], {
      state: {
        vehicle: this.vehicle,
        location: this.selectedLocation,
        user: this.user,
      },
    });
    console.log(this.selectedLocation);
  }

  getMapLink(loc: ParkingLocation): string {
    const [lng, lat] = loc.geo.coordinates;
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  }

  goBack(): void {
    this.router.navigate(['/customer/choose-vehicle'], {
      state: {
        user: this.user,
        selectedLocation: this.selectedLocation
      }
    });
  }

  openMapModal(loc: ParkingLocation, event: Event): void {
    event.stopPropagation();
    const [lng, lat] = loc.geo.coordinates;
    const url = `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`;
    this.mapIframeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    this.mapModalLocation = loc;
    document.body.style.overflow = 'hidden';
  }

  closeMapModal(): void {
    this.mapModalLocation = null;
    this.mapIframeUrl = null;
    document.body.style.overflow = '';
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.mapModalLocation) {
      this.closeMapModal();
    }
  }
}