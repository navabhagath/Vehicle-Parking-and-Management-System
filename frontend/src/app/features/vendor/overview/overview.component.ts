import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import {
  ParkingLocation,
  SlotSummary,
  RecentParkingEntry,
} from './overview.model';
import { CurrentOccupancyPiechartService } from '../Services/current-occupancy-piechart.service';
import { OccupancyPieChartComponent } from './occupancy-pie-chart/occupancy-pie-chart.component';
import { OverviewService } from './overview.service';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CommonModule, OccupancyPieChartComponent],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.scss',
})

export class OverviewComponent implements OnInit {
  location!: ParkingLocation;
  slotSummary: SlotSummary = { total: 0, occupied: 0, free: 0 };
  recentParking: RecentParkingEntry[] = [];
  isLoading = true;

  private locationId = '';

  menuItems = [
    {
      key: 'total',
      label: 'Total Slots',
      icon: 'bi-car-front',
      Color: 'text-light-blue',
    },
    {
      key: 'occupied',
      label: 'Occupied',
      icon: 'bi-people',
      Color: 'text-red',
    },
    {
      key: 'free',
      label: 'Free',
      icon: 'bi-check-circle',
      Color: 'text-green',
    },
  ];

  private route: ActivatedRoute = inject(ActivatedRoute);
  private currentOccupancyState: CurrentOccupancyPiechartService = inject(CurrentOccupancyPiechartService);
  private overviewService: OverviewService = inject(OverviewService);

  ngOnInit(): void {
    this.route.parent?.paramMap.subscribe((params) => {
      this.locationId = params.get('id') || '';
      if (this.locationId) {
        this.loadData();
      }
    });
  }
  
  loadData(): void {
    this.isLoading = true;
    this.overviewService.getOverview(this.locationId).subscribe({
      next: (response) => {
        this.location = response.location;
        this.slotSummary = response.slotSummary;
        this.recentParking = response.recentParking;
        this.currentOccupancyState.updateCurrentOccupancy(this.slotSummary);
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }
}
