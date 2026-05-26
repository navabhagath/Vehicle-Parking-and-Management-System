import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SimpleChange } from '@angular/core';
import { ParkingLocationComponent } from './parking-location.component';

describe('ParkingLocationComponent', () => {
  let component: ParkingLocationComponent;
  let fixture: ComponentFixture<ParkingLocationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParkingLocationComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ParkingLocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should update lat/long on ngOnChanges', () => {
    const loc = { name: 'Test', geo: { coordinates: [77.5, 12.9] } } as any;
    component.selectedLocation = loc;
    component.ngOnChanges({
      selectedLocation: new SimpleChange(null, loc, true),
    });

    expect(component.long).toBe(77.5);
    expect(component.lat).toBe(12.9);
  });

  it('should return empty thumbnailUrl when no coordinates', () => {
    expect(component.thumbnailUrl).toBe('');
  });

  it('should return valid thumbnailUrl when coordinates set', () => {
    component.lat = 12.9;
    component.long = 77.5;
    expect(component.thumbnailUrl).toContain('77.5');
    expect(component.thumbnailUrl).toContain('12.9');
  });

  it('should return google maps URL with coordinates', () => {
    component.lat = 12.9;
    component.long = 77.5;
    expect(component.googleMapsUrl).toContain('12.9,77.5');
  });

  it('should return # for googleMapsUrl when no coordinates', () => {
    expect(component.googleMapsUrl).toBe('#');
  });
});
