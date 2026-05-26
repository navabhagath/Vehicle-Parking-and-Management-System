import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OccupancyPieChartComponent } from './occupancy-pie-chart.component';

describe('OccupancyPieChartComponent', () => {
  let component: OccupancyPieChartComponent;
  let fixture: ComponentFixture<OccupancyPieChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OccupancyPieChartComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OccupancyPieChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
