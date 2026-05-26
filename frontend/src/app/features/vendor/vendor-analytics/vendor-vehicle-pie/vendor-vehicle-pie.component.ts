import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
// import { Subscription } from 'rxjs';
import {
  NgApexchartsModule,
  ApexChart,
  ApexStroke,
  ApexDataLabels,
  ApexLegend,
  ApexTooltip,
  ApexNonAxisChartSeries,
} from 'ng-apexcharts';
// import { VendorAnalyticsStateService } from '../../Services/vendor-analytics-state.service';
import { VehiclePeriod, VehiclePieData } from '../vendor-analytics.model';
import { VendorAnalyticsService } from '../vendor-analytics.service';
// import { Interpolation } from '@angular/compiler';

@Component({
  selector: 'app-vendor-vehicle-pie',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './vendor-vehicle-pie.component.html',
  styleUrl: './vendor-vehicle-pie.component.scss',
})
export class VendorVehiclePieComponent implements OnChanges {

  @Input() locationId!: string;

  activePeriod: VehiclePeriod = 'today';

  currentData: VehiclePieData = {
    twoWheelerRev: 0,
    fourWheelerRev: 0,
    twoWheelerCount: 0,
    fourWheelerCount: 0,
  };

  periods: { key: VehiclePeriod; label: string }[] = [
    { key: 'today', label: 'Today' },
    { key: 'last7', label: '7 Days' },
    { key: 'last15', label: '15 Days' },
    { key: 'last30', label: '30 Days' },
  ];

  // ApexCharts config
  pieSeries: ApexNonAxisChartSeries = [1]; // data in the pie chart
  pieChart: ApexChart = {
    // configuration of the pie chart
    type: 'pie',
    height: 220,
    fontFamily: 'inherit',
  };
  pieLabels: string[] = ['2-Wheeler', '4-Wheeler']; // custom labels overiding default labels
  pieColors: string[] = ['#4BD2F8', '#FFDF66']; // colors to that pie chart
  pieStroke: ApexStroke = { width: 2 }; // for space btw the graph
  pieDataLabels: ApexDataLabels = { enabled: false }; // not showing the default labels
  pieLegend: ApexLegend = { show: false }; // not shwing the default legend
  pieTooltip: ApexTooltip = { enabled: true }; // when we hover on that part to get that data

  constructor(private analyticsService: VendorAnalyticsService) {}


  ngOnChanges(changes: SimpleChanges): void {
    if (changes['locationId'] && this.locationId) {
      this.load();
    }
  }

  onPeriodChange(period: VehiclePeriod): void {
    this.activePeriod = period;
    this.load();
  }

  private load(): void {
    this.analyticsService.getVehiclePie(this.locationId, this.activePeriod).subscribe({
      next: (data) => {
        this.currentData = data;
        this.applyChart();
      },
      error: (err) => console.error('Failed to load pie chart', err),
    });
  }

  private applyChart(): void {
    const hasData = this.currentData.twoWheelerRev > 0 || this.currentData.fourWheelerRev > 0;

    if (hasData) {
      this.pieSeries = [
        this.currentData.twoWheelerRev,
        this.currentData.fourWheelerRev,
      ];
      this.pieColors = ['#2563eb', '#f59e0b'];
      this.pieLabels = ['2-Wheeler', '4-Wheeler'];
    } else {
      this.pieSeries = [1];
      this.pieColors = ['#e8ecf1'];
      this.pieLabels = ['No data'];
    }
  }
}
