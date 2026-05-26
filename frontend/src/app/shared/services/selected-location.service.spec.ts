import { TestBed } from '@angular/core/testing';
import { CustomerStateService as SelectedLocationService } from './selected-location.service';

describe('SelectedLocationService', () => {
  let service: SelectedLocationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SelectedLocationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initially emit null for selectedLocation$', (done) => {
    service.selectedLocation$.subscribe((loc) => {
      expect(loc).toBeNull();
      done();
    });
  });

  it('should emit the location after setLocation is called', (done) => {
    const mockLocation = { id: 'loc1', locationName: 'Test Parking' } as any;
    service.setLocation(mockLocation);
    service.selectedLocation$.subscribe((loc) => {
      expect(loc).toEqual(mockLocation);
      done();
    });
  });

  it('should emit the latest location value', (done) => {
    const loc1 = { id: 'loc1', locationName: 'First' } as any;
    const loc2 = { id: 'loc2', locationName: 'Second' } as any;
    service.setLocation(loc1);
    service.setLocation(loc2);
    service.selectedLocation$.subscribe((loc) => {
      expect(loc).toEqual(loc2);
      done();
    });
  });
});
