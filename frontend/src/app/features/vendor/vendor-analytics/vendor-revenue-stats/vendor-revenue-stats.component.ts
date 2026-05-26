import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { RevenueStat, RevenueStatsResponse } from '../vendor-analytics.model';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { VendorAnalyticsService } from '../vendor-analytics.service';

@Component({
  selector: 'app-vendor-revenue-stats',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './vendor-revenue-stats.component.html',
  styleUrl: './vendor-revenue-stats.component.scss',
})
export class VendorRevenueStatsComponent implements OnChanges {
  @Input() locationId!: string;
  stats: RevenueStat[] = [];

  constructor(private analyticsService: VendorAnalyticsService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['locationId'] && this.locationId) {
      this.loadStats();
    }
  }

  private loadStats(): void {
    this.analyticsService.getRevenueStats(this.locationId).subscribe({
      next: (res) => (this.stats = this.toCards(res)),
      error: (err) => console.error('Failed to load stats', err),
    });
  }

  private toCards(res: RevenueStatsResponse): RevenueStat[] {
    return [
      {
        label: "Today's Revenue",
        value: res.today,
        icon: 'bi-lightning-charge-fill',
        color: '#2563eb',
        bg: '#eff4ff',
      },
      {
        label: 'Monthly Revenue',
        value: res.month,
        icon: 'bi-calendar3',
        color: '#10b981',
        bg: '#ecfdf5',
      },
      {
        label: 'Yearly Revenue',
        value: res.year,
        icon: 'bi-graph-up-arrow',
        color: '#f59e0b',
        bg: '#fffbeb',
      },
      {
        label: 'Total Revenue',
        value: res.total,
        icon: 'bi-wallet2',
        color: '#8b5cf6',
        bg: '#f5f3ff',
      },
    ];
  }
}