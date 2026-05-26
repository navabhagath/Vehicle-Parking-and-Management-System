import { Component, OnInit, inject } from '@angular/core';
import { SearchService } from '../services/search.service';
import { RevenueRecord } from './admin-revenue.model';
import { CommonModule } from '@angular/common';
import { AdminSidebarComponent } from '../admin-sidebar/admin-sidebar.component';
import { RevenueService } from './admin-revenue.service';
import { ModalService } from '../../../shared/modal/modal.service';

@Component({
  selector: 'app-revenue',
  templateUrl: './admin-revenue.component.html',
  standalone: true,
  imports: [CommonModule, AdminSidebarComponent],
})
export class AdminRevenueComponent implements OnInit {
  revenueList: any[] = [];
  filteredList: any[] = [];
  totalRevenueAllVendors: number = 0;

  isLoading = true;
  currentSearchTerm: string = '';

  private searchService = inject(SearchService);
  private revenueService = inject(RevenueService);
  private modalService = inject(ModalService);

  ngOnInit(): void {
    this.loadRevenue();

    this.searchService.currentSearchTerm.subscribe((term) => {
      this.currentSearchTerm = term;
      this.applyFilters();
    });
  }

  loadRevenue() {
    this.isLoading = true;
    this.revenueService.getRawRevenueData().subscribe({
      next: (data) => {
        this.revenueList = data.vendorData;
        this.filteredList = [...data.vendorData];
        this.totalRevenueAllVendors = data.totalRevenueAllVendors;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading revenue data:', err);
        this.isLoading = false;
      },
    });
  }

  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchService.updateSearch(value);
  }

  applyFilters() {
    if (!this.currentSearchTerm) {
      this.filteredList = [...this.revenueList];
      return;
    }

    const lowTerm = this.currentSearchTerm.toLowerCase();
    this.filteredList = this.revenueList.filter(
      (item) =>
        item.vendorName?.toLowerCase().includes(lowTerm) ||
        item.vendorId?.toLowerCase().includes(lowTerm) ||
        item.vendorEmail?.toLowerCase().includes(lowTerm),
    );
  }

  sendReminder(item: any) {
    if (!item.vendorEmail) {
      this.modalService.confirm({
        title: 'Error',
        message: 'No email address found for this vendor.',
        type: 'danger',
        showCancel: false,
      });
      return;
    }

    this.revenueService.sendEmailReminder(item).subscribe({
      next: (res) => {
        item.lastReminderAt = new Date();
        this.modalService.confirm({
          title: 'Success',
          message: `Reminder email has been sent to ${item.vendorName}`,
          type: 'default',
          showCancel: false,
        });
      },
      error: (err) => {
        console.error('Email Reminder failed:', err);
        this.modalService.confirm({
          title: 'Error',
          message: 'Failed to send email. Please check the server logs.',
          type: 'danger',
          showCancel: false,
        });
      },
    });
  }
  getStatusClass(status: string) {
    switch (status) {
      case 'Active':
        return 'bg-success-subtle text-success border-success';
      case 'Expiring Soon':
        return 'bg-warning-subtle text-dark border-warning';
      case 'Overdue':
        return 'bg-danger-subtle text-danger border-danger';
      default:
        return 'bg-secondary-subtle text-muted border-secondary';
    }
  }

  getOverdueCount(): number {
    return this.revenueList.filter((item) => item.status === 'Overdue').length;
  }

  getTotalRevenue(): number {
    return this.filteredList.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  }
}
