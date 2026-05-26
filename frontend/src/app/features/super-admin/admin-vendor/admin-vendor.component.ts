// import { Component, OnInit, inject } from '@angular/core';
// import { Router } from '@angular/router';
// import { CommonModule } from '@angular/common';
// import { Vendor } from './admin-vendor.model';

// import { SearchService } from '../services/search.service';
// import { AdminSidebarComponent } from '../admin-sidebar/admin-sidebar.component';
// import {VendorService} from './admin-vendor.service'

//   import { map } from 'rxjs/operators';

// @Component({
//   selector: 'app-admin-vendor',
//   templateUrl: './admin-vendor.component.html',
//   standalone: true,
//   imports: [CommonModule, AdminSidebarComponent]
// })
// export class AdminVendorComponent implements OnInit {
//   allVendors: Vendor[] = [];
//   displayVendors: Vendor[] = [];
//   isLoading: boolean = true;

//   private searchService = inject(SearchService);
//   private router = inject(Router);
//   private vendorService = inject(VendorService);
//   currentSearchTerm: string = '';
//   selectedStatus: string = 'ALL';

//   ngOnInit(): void {
//     this.loadVendors();

//     this.searchService.currentSearchTerm.subscribe(term => {
//       this.filterList(term);

//  this.currentSearchTerm = term;
//   this.applyFilters();

//     });

//   }

//      onSearch(event: any) {
//     const value = (event.target as HTMLInputElement).value;
//     this.searchService.updateSearch(value);
//   }

//   onFilterChange(event: any) {
//   this.selectedStatus = event.target.value;
//   this.applyFilters();
// }

// applyFilters() {
//   let filtered = [...this.allVendors];

//   const searchTerm = this.currentSearchTerm;

//   if (searchTerm) {
//     const lowTerm = searchTerm.toLowerCase();

//     filtered = filtered.filter(v =>
//       v.name?.toLowerCase().includes(lowTerm) ||
//       v.email?.toLowerCase().includes(lowTerm) ||
//       v.phone?.toLowerCase().includes(lowTerm)
//     );
//   }

//   if (this.selectedStatus !== 'ALL') {
//     filtered = filtered.filter(v => {
//       const loc = v.locationDetails?.[0];

//       if (this.selectedStatus === 'NA') {
//         return !loc;
//       }

//       return loc?.approvalStatus === this.selectedStatus;
//     });
//   }

//   this.displayVendors = filtered;
// }

// loadVendors() {
//   this.isLoading = true;

//   this.vendorService.getVendorData()
//     .pipe(

//       map((vendors: Vendor[]) => vendors.filter((v: Vendor) => v.status !== 'suspended'))
//     )
//     .subscribe({
//       next: (data) => {
//         this.allVendors = data;
//         this.displayVendors = [...data];
//         this.isLoading = false;
//       },
//       error: (err) => {
//         console.error('Error loading vendors:', err);
//         this.isLoading = false;
//       }
//     });
// }

//   filterList(searchTerm: string) {
//     if (!searchTerm) {
//       this.displayVendors = [...this.allVendors];
//     } else {
//       const lowTerm = searchTerm.toLowerCase();
//       this.displayVendors = this.allVendors.filter(v =>
//         v.name?.toLowerCase().includes(lowTerm) || v.email?.toLowerCase().includes(lowTerm) || v.phone?.toLowerCase().includes(lowTerm)

//       );
//     }
//     this.applyFilters();
//   }

//   viewVendor(locationId: string) {
//     this.router.navigate(['/admin-vendor-details', locationId]);
//   }
// }

import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Vendor, LocationDetail } from './admin-vendor.model';

import { SearchService } from '../services/search.service';
import { AdminSidebarComponent } from '../admin-sidebar/admin-sidebar.component';
import { VendorService } from './admin-vendor.service';

import { map } from 'rxjs/operators';

@Component({
  selector: 'app-admin-vendor',
  templateUrl: './admin-vendor.component.html',
  standalone: true,
  imports: [CommonModule, AdminSidebarComponent],
})
export class AdminVendorComponent implements OnInit {
  allRows: Array<{ vendor: Vendor; location: LocationDetail | null }> = [];
  displayVendors: Array<{ vendor: Vendor; location: LocationDetail | null }> =
    [];
  isLoading: boolean = true;

  private searchService = inject(SearchService);
  private router = inject(Router);
  private vendorService = inject(VendorService);

  currentSearchTerm: string = '';
  selectedStatus: string = 'ALL';

  ngOnInit(): void {
    this.loadVendors();

    this.searchService.currentSearchTerm.subscribe((term) => {
      this.currentSearchTerm = term;
      this.applyFilters();
    });
  }

  onSearch(event: any) {
    const value = (event.target as HTMLInputElement).value;
    this.searchService.updateSearch(value);
  }

  onFilterChange(event: any) {
    this.selectedStatus = event.target.value;
    this.applyFilters();
  }

  /**
   * Flattens vendors into one row per location.
   * Vendors with no locations still get one row (location = null).
   */
  private flattenVendors(
    vendors: Vendor[],
  ): Array<{ vendor: Vendor; location: LocationDetail | null }> {
    const rows: Array<{ vendor: Vendor; location: LocationDetail | null }> = [];

    for (const v of vendors) {
      if (v.locationDetails && v.locationDetails.length > 0) {
        for (const loc of v.locationDetails) {
          rows.push({ vendor: v, location: loc });
        }
      } else {
        rows.push({ vendor: v, location: null });
      }
    }

    return rows;
  }

  applyFilters() {
    let filtered = [...this.allRows];

    const searchTerm = this.currentSearchTerm;
    if (searchTerm) {
      const lowTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.vendor.name?.toLowerCase().includes(lowTerm) ||
          r.vendor.email?.toLowerCase().includes(lowTerm) ||
          r.vendor.phone?.toLowerCase().includes(lowTerm) ||
          r.location?.locationName?.toLowerCase().includes(lowTerm),
      );
    }

    if (this.selectedStatus !== 'ALL') {
      filtered = filtered.filter((r) => {
        if (this.selectedStatus === 'NA') {
          return !r.location;
        }
        return r.location?.approvalStatus === this.selectedStatus;
      });
    }

    this.displayVendors = filtered;
  }

  loadVendors() {
    this.isLoading = true;

    this.vendorService
      .getVendorData()
      .pipe(
        map((vendors: Vendor[]) =>
          vendors.filter((v: Vendor) => v.status !== 'suspended'),
        ),
      )
      .subscribe({
        next: (data) => {
          this.allRows = this.flattenVendors(data);
          this.displayVendors = [...this.allRows];
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading vendors:', err);
          this.isLoading = false;
        },
      });
  }

  viewVendor(vendorId: string, locationIndex: number = 0) {
    this.router.navigate(['/admin-vendor-details', vendorId], {
      queryParams: { locIndex: locationIndex },
    });
  }
}
