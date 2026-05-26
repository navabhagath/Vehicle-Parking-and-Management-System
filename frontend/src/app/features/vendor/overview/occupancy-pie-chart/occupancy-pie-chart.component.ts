import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import {
  NgApexchartsModule,
  ApexChart,
  ApexStroke,
  ApexLegend,
  ApexNonAxisChartSeries,
} from 'ng-apexcharts';
import { CurrentOccupancyPiechartService } from '../../Services/current-occupancy-piechart.service';
import { SlotSummary } from '../overview.model';

@Component({
  selector: 'app-occupancy-pie-chart',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './occupancy-pie-chart.component.html',
  styleUrl: './occupancy-pie-chart.component.scss',
})
export class OccupancyPieChartComponent implements OnInit, OnDestroy {

  dataLoaded = false;

  pieSeries: ApexNonAxisChartSeries = [0, 0];
  pieChart: ApexChart = {
    type: 'pie',
    height: 250,
    fontFamily: 'Montserrat, sans-serif',
  };
  pieLabels: string[] = ['Occupied', 'Free'];
  pieColors: string[] = ['#f32c44', '#33AD5F'];
  pieStroke: ApexStroke = { width: 2, colors: ['#fcfcfe'] };
  pieLegend: ApexLegend = {
    show: true,
    position: 'bottom',
    fontSize: '12px',
    fontFamily: 'Montserrat, sans-serif',
  };

  private occupancySub!: Subscription;

  private occupancyData: CurrentOccupancyPiechartService = inject(CurrentOccupancyPiechartService);

  ngOnInit(): void {
    this.occupancySub = this.occupancyData.currentOccupancy$.subscribe(
      (data: SlotSummary) => {
        this.pieSeries = [data.occupied, data.free];
        this.dataLoaded = true;
      },
    );
  }

  ngOnDestroy(): void {
    this.occupancySub?.unsubscribe();
  }
}
