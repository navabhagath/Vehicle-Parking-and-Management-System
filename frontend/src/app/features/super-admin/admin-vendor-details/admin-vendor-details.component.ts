import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AdminSidebarComponent } from '../admin-sidebar/admin-sidebar.component';
import { VendorService } from './admin-vendor-details.service';
import { LocationDetail } from './admin-vendor-details.model';
import { Vendor } from '../admin-vendor/admin-vendor.model';
import { ModalService } from '../../../shared/modal/modal.service';

@Component({
  selector: 'app-admin-vendor-details',
  templateUrl: './admin-vendor-details.component.html',
  styleUrls: ['./admin-vendor-details.component.scss'],
  standalone: true,
  imports: [AdminSidebarComponent, CommonModule],
})
export class AdminVendorDetailsComponent implements OnInit {
  vendor?: Vendor;
  location?: LocationDetail;
  isLoading = true;
  private locIndex = 0;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private vendorService = inject(VendorService);
  private modalService = inject(ModalService);

  ngOnInit(): void {
    const vendorId = this.route.snapshot.paramMap.get('id');
    this.locIndex = +(this.route.snapshot.queryParamMap.get('locIndex') ?? 0);

    if (vendorId) {
      this.vendorService.getVendorData().subscribe({
        next: (allVendors: Vendor[]) => {
          this.vendor = allVendors.find((v) => v.vendorId === vendorId);
          this.isLoading = false;

          if (
            this.vendor &&
            this.vendor.locationDetails?.length > this.locIndex
          ) {
            this.location = this.vendor.locationDetails[this.locIndex];
          } else if (!this.vendor) {
            console.error('Vendor not found');
          }
        },
        error: (err) => {
          console.error('Error fetching data', err);
          this.isLoading = false;
        },
      });
    }
  }

  changeStatus(newStatus: string) {
    const locId = this.location?.locationId;

    if (!locId) {
      this.modalService.confirm({
        title: 'Error',
        message: 'Location ID not found.',
        type: 'danger',
        showCancel: false,
      });
      return;
    }

    this.vendorService.updateLocationStatus(locId, newStatus).subscribe({
      next: () => {
        if (this.location) {
          this.location.approvalStatus = newStatus;
        }
        this.modalService.confirm({
          title: 'Success',
          message: 'Status updated successfully',
          type: 'default',
          showCancel: false,
        });
      },
      error: (err) => {
        console.error('Update failed', err);
        this.modalService.confirm({
          title: 'Error',
          message: 'Failed to update: ' + err.error?.message,
          type: 'danger',
          showCancel: false,
        });
      },
    });
  }

  goBack() {
    this.router.navigate(['super_admin/vendor']); // Update to your actual list path
  }
}
