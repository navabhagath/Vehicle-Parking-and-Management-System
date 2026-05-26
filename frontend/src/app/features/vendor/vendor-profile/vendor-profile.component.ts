import { Component, inject, OnInit } from '@angular/core';
import { VendorProfileService } from './vendor-profile.service';
import { ActivatedRoute } from '@angular/router';
import { VendorData } from './vendor-profile.model';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
@Component({
  selector: 'app-vendor-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vendor-profile.component.html',
  styleUrl: './vendor-profile.component.scss',
})
export class VendorProfileComponent implements OnInit {
  VendorProfileService: VendorProfileService = inject(VendorProfileService);
  activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  authService: AuthService = inject(AuthService);

  // vendorId : string = 'user_vendor_001';
  vendorId = '';

  vendorData!: VendorData;

  ngOnInit(): void {
    this.vendorId = this.authService.currentUserValue?.id || '';
    this.VendorProfileService.getVendorProfileData().subscribe((data) => {
      this.vendorData = data;
    });
  }
  getFormattedDate(): string {
    if (!this.vendorData.createdAt) return '—';
    const date = new Date(this.vendorData.createdAt);
    return date.toLocaleDateString('en-IN', {
      month: 'short',
      year: 'numeric',
    });
  }
}
