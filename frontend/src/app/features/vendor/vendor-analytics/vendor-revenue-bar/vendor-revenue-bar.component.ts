import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  NgApexchartsModule,
  ApexChart,
  ApexXAxis,
  ApexYAxis,
  ApexDataLabels,
  ApexAxisChartSeries,
} from 'ng-apexcharts';
import { BarRange } from '../vendor-analytics.model';
import { VendorAnalyticsService } from '../vendor-analytics.service';

@Component({
  selector: 'app-vendor-revenue-bar',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './vendor-revenue-bar.component.html',
  styleUrl: './vendor-revenue-bar.component.scss',
})
export class VendorRevenueBarComponent implements OnChanges {
  @Input() locationId!: string;

  activeRange: BarRange = 'week';

  ranges: { key: BarRange; label: string }[] = [
    { key: 'week', label: 'Weekly' },
    { key: 'month', label: 'Monthly' },
    { key: 'year', label: 'Yearly' },
  ];

  barSeries: ApexAxisChartSeries = [{ name: 'Revenue', data: [0] }]; // data in the graph
  barChart: ApexChart = {
    // barchart config
    type: 'bar',
    height: 280,
    fontFamily: 'inherit',
    toolbar: { show: false },
  };
  barXAxis: ApexXAxis = {
    categories: [''],
    axisBorder: { show: false },
    axisTicks: { show: false },
  };
  barYAxis: ApexYAxis = {
    labels: {
      style: { fontSize: '10px', colors: '#010101ff' },
      formatter: (v) => `₹${v}`,
    },
  };
  barDataLabels: ApexDataLabels = { enabled: false }; // data on bars
  barColors: string[] = ['#4BD2F8'];

  constructor(private analyticsService: VendorAnalyticsService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['locationId'] && this.locationId) {
      this.load();
    }
  }

  onRangeChange(range: BarRange): void {
    this.activeRange = range;
    this.load();
  }

  private load(): void {
    this.analyticsService.getRevenueBar(this.locationId, this.activeRange).subscribe({
      next: ({ labels, data }) => {
        this.barXAxis = { ...this.barXAxis, categories: labels };
        this.barSeries = [{ name: 'Revenue', data }];
      },
      error: (err) => console.error('Failed to loas revenue bar', err),
    });
  }
}
