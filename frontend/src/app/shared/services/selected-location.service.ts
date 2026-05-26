import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ParkingLocation } from '../../models/parkingLocation.model';


@Injectable({ providedIn: 'root' })
export class CustomerStateService {
  private locationSubject = new BehaviorSubject<ParkingLocation | null>(null);
  // By making this locationSubject Private I am restricting so that no component can change location except State Service
  //I am  using asObservable for making it a read only value 
  selectedLocation$ = this.locationSubject.asObservable();

  setLocation(loc: ParkingLocation): void {
    this.locationSubject.next(loc);
  }
}