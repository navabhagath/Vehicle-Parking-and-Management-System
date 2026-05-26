import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
// import { Subscription } from 'rxjs';
// import { VendorAnalyticsService } from './vendor-analytics.service';
// import { VendorAnalyticsStateService } from '../Services/vendor-analytics-state.service';
import { VendorRevenueStatsComponent } from './vendor-revenue-stats/vendor-revenue-stats.component'; 
import { VendorVehiclePieComponent } from './vendor-vehicle-pie/vendor-vehicle-pie.component'; 
import { VendorRevenueBarComponent } from './vendor-revenue-bar/vendor-revenue-bar.component'; 

@Component({
  selector: 'app-vendor-analytics',
  standalone: true,
  imports: [ VendorRevenueStatsComponent ,VendorVehiclePieComponent ,VendorRevenueBarComponent ],
  templateUrl: './vendor-analytics.component.html',
  styleUrl: './vendor-analytics.component.scss',
})

export class VendorAnalyticsComponent implements OnInit {
  locationId = '';
  private route = inject(ActivatedRoute);

  ngOnInit(): void {
    this.route.parent?.paramMap.subscribe(params => {
      this.locationId = params.get('id') || '';
    })
  }

}
