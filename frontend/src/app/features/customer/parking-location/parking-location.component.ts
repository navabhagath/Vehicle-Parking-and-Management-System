import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ParkingLocation } from '../../../models/parkingLocation.model';


@Component({
  selector: 'app-parking-location',
  standalone: true,
  imports: [],
  templateUrl: './parking-location.component.html',
  styleUrl: './parking-location.component.scss'
})
export class ParkingLocationComponent implements OnChanges {
  @Input() selectedLocation: ParkingLocation | null = null;
  
  lat?: number;
  long?: number;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedLocation'] && this.selectedLocation) {
      [this.long, this.lat] = this.selectedLocation.geo.coordinates;
      console.log('Coordinates updated:', this.lat, this.long);
    }
  }

  get thumbnailUrl(): string {
    if (this.lat !== undefined && this.long !== undefined) {
      return `https://static-maps.yandex.ru/1.x/?ll=${this.long},${this.lat}&z=13&l=map&size=600,400&pt=${this.long},${this.lat},pm2rdl`;
    }
    return ''; 
  }

  get googleMapsUrl(): string {
    return this.lat && this.long 
      ? `https://www.google.com/maps/search/?api=1&query=${this.lat},${this.long}`
      : '#';
  }
}