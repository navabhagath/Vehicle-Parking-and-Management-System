import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AdminSearchUserService } from '../../../core/services/admin-search-user.service';
import { AdminSidebarComponent } from '../admin-sidebar/admin-sidebar.component';
@Component({
  selector: 'app-admin-user-management',
  standalone: true,
  imports: [CommonModule,AdminSidebarComponent],
  templateUrl: './super-admin-rbac-panel.component.html',
  styleUrls: ['./super-admin-rbac-panel.component.scss'],
})
export class SuperAdminRbacPanelComponent implements OnInit {
  constructor(
    private router: Router,
    public adminSearchUserService: AdminSearchUserService,
  ) {}

  ngOnInit() {
    this.adminSearchUserService.loadUsers();
  }

  applyFilter(event: Event) {
    const searchTerm = (event.target as HTMLInputElement).value;
    this.adminSearchUserService.updateSearchTerm(searchTerm);
  }

  goToDetails(userId: string) {
    this.router.navigate(['/super_admin/user-details', userId]);
  }
}
