import { Component, OnInit, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Router,
  RouterOutlet,
  ActivatedRoute,
  RouterModule,
} from '@angular/router';
import { MenuItem } from './vendor-layout.model';
import { environment } from '../../../env/evironment';
import { VendorLayoutService } from './vendor-layout.service';
import { AuthService } from '../../../core/services/auth.service';
import { switchMap } from 'rxjs';
import { ModalService } from '../../../shared/modal/modal.service';
@Component({
  selector: 'app-vendor-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule],
  templateUrl: './vendor-layout.component.html',
  styleUrl: './vendor-layout.component.scss',
})
export class VendorLayoutComponent implements OnInit {
  sidebarOpen = window.innerWidth >= 992;
  locationName = '';
  locationId = '';

  authService: AuthService = inject(AuthService);
  private modalService = inject(ModalService);

  menuItems: MenuItem[] = [
    { key: 'overview', label: 'Overview', icon: 'bi-grid' },
    { key: 'bookings', label: 'Bookings', icon: 'bi-calendar-check' },
    { key: 'tickets', label: 'Tickets', icon: 'bi-ticket' },
    { key: 'analytics', label: 'Analytics', icon: 'bi-bar-chart-line' },
    { key: 'profile', label: 'Profile', icon: 'bi-person' },
    { key: 'wallet', label: 'Wallet', icon: 'bi-wallet' },
    { key: 'help', label: 'Help & Support', icon: 'bi-question-circle' },
    { key: 'mytickets', label: 'My Tickets', icon: 'bi-ticket' },
    { key: 'gatepass', label: 'Gate Pass', icon: 'bi-sign-turn-right' },
    { key: 'recentTransaction', label: 'Transactions', icon: 'bi-cash' },
  ];

  private API = environment.apiUrl;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private service: VendorLayoutService,
  ) {}

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          this.locationId = params.get('id') || '';
          return this.service.getLocationName(this.locationId);
        }),
      )
      .subscribe({
        next: (loc) => (this.locationName = loc.locationName),
        error: () => (this.locationName = 'Unknown Location'),
      });
  }

  get activeMenu(): string {
    const url = this.router.url;
    const found = this.menuItems.find((m) => url.endsWith('/' + m.key));
    return found ? found.key : 'overview';
  }

  get activeLabel(): string {
    const item = this.menuItems.find((m) => m.key === this.activeMenu);
    return item ? item.label : 'Overview';
  }

  onMenuClick(key: string): void {
    if (window.innerWidth < 992) {
      this.sidebarOpen = false;
    }
    this.router.navigate([key], { relativeTo: this.route });
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  goBackToLanding(): void {
    this.router.navigate(['/vendor/dashboard']);
  }
  async logout() {
    this.sidebarOpen = !this.sidebarOpen;

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
