import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { LocationDropdownComponent } from './location-dropdown.component';
import { CustomerDao } from '../../../shared/customer.dao';

describe('LocationDropdownComponent', () => {
  let component: LocationDropdownComponent;
  let fixture: ComponentFixture<LocationDropdownComponent>;
  let daoSpy: jasmine.SpyObj<CustomerDao>;

  const mockLocations = [
    { id: '1', name: 'Lot A', address: '123 St' },
    { id: '2', name: 'Lot B', address: '456 St' },
  ] as any[];

  beforeEach(async () => {
    daoSpy = jasmine.createSpyObj('CustomerDao', ['getAllLocations']);
    daoSpy.getAllLocations.and.returnValue(of(mockLocations));

    await TestBed.configureTestingModule({
      imports: [LocationDropdownComponent],
      providers: [{ provide: CustomerDao, useValue: daoSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(LocationDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load locations on init', () => {
    expect(component.locations.length).toBe(2);
  });

  it('should select first location by default', () => {
    expect(component.selectedLocation).toEqual(mockLocations[0]);
  });

  it('should emit locationChange on init', () => {
    spyOn(component.locationChange, 'emit');
    component.ngOnInit();
    expect(component.locationChange.emit).toHaveBeenCalled();
  });

  it('should update selectedLocation on selectLocation', () => {
    component.selectLocation(mockLocations[1]);
    expect(component.selectedLocation).toEqual(mockLocations[1]);
  });

  it('should emit locationChange on selectLocation', () => {
    spyOn(component.locationChange, 'emit');
    component.selectLocation(mockLocations[1]);
    expect(component.locationChange.emit).toHaveBeenCalledWith(
      mockLocations[1],
    );
  });
});
