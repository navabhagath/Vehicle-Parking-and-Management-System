import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ParkingLocation, SubscriptionStatus } from './landing-page.model';
import { AuthService } from '../../../core/services/auth.service';
import { LandingPageService } from './landing-page.service';
import { ModalService } from '../../../shared/modal/modal.service';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './landing-page.component.html',
  
})
export class LandingPageComponent implements OnInit {

  locations: ParkingLocation[] = [];
  occupancyMap: Map<string, number> = new Map();
  isLoading = true;
  loadError: string | null = null;

  subscription: SubscriptionStatus | null = null;
  isRenewing = false;

  private router: Router = inject(Router);
  private authService = inject(AuthService);
  private landingPageService = inject(LandingPageService);
  private modalService = inject(ModalService);

  activeCount = 0;
  totalSlots = 0;
  totalOccupied = 0;

  ngOnInit(): void {
    const user = this.authService.currentUserValue;
    if (!user) {
      this.router.navigate(['/vendor/login']);
      return;
    }
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.isLoading = true;
    this.loadError = null;

    forkJoin({
      dashboard: this.landingPageService.getDashboardData(),
      subscription: this.landingPageService.getSubscriptionStatus(),
    }).subscribe({
      next: ({ dashboard, subscription }) => {
        this.locations = dashboard.locations;
        this.occupancyMap = new Map(Object.entries(dashboard.occupancyMap));
        this.activeCount = dashboard.activeCount;
        this.totalSlots = dashboard.totalSlots;
        this.totalOccupied = dashboard.totalOccupied;
        this.subscription = subscription;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.loadError =
          err.status === 0
            ? 'Cannot reach the server. Please check your connection.'
            : 'Failed to load dashboard.';
      },
    });
  }

  retry(): void {
    this.loadDashboard();
  }

  getLocationSlots(loc: ParkingLocation): number {
    return this.landingPageService.getLocationSlots(loc);
  }

  onLocationClick(loc: ParkingLocation): void {
    if (loc.isActive && loc.approvalStatus == 'APPROVED') {
      this.router.navigate(['/vendor/location', loc.id]);
    }
  }

  onAddLocation(): void {
    this.router.navigate(['/vendor/location/new']);
  }

  async onRenew(): Promise<void> {
    const confirmed = await this.modalService.confirm({
      title: 'Renew Subscription',
      message: 'Extend your subscription by 1 year for ₹1,50,000?',
      confirmText: 'Renew',
      type: 'default',
    });
    if (!confirmed) return;

    this.isRenewing = true;
    this.landingPageService.renewSubscription().subscribe({
      next: async (status) => {
        this.subscription = status;
        this.isRenewing = false;

        
        const currentUser = this.authService.currentUserValue;
        if (currentUser) {
          this.authService.updateCurrentUser({
            ...currentUser,
            hasPaidSubscription: true,
          });
        }

        await this.modalService.confirm({
          title: 'Success',
          message: 'Subscription renewed successfully!',
          confirmText: 'OK',
          type: 'default',
        });
      },
      error: async (err) => {
        this.isRenewing = false;
        const message =
          err.status === 0
            ? 'Cannot reach the server. Please try again.'
            : 'Renewal failed. Please try again.';
        await this.modalService.confirm({
          title: 'Renewal Failed',
          message,
          confirmText: 'OK',
          type: 'danger',
        });
      },
    });
  }

  async logout() {
    const confirmed = await this.modalService.confirm({
      title: 'Logout',
      message: 'Are you sure you want to log out?',
      confirmText: 'Logout',
      type: 'danger',
    });
    if (confirmed) {
      this.authService.logout();
    }
  }
}