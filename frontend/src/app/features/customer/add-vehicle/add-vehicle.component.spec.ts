import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AddVehicleComponent } from './add-vehicle.component';
import { CustomerDao } from '../../../shared/customer.dao';

describe('AddVehicleComponent', () => {
  let component: AddVehicleComponent;
  let fixture: ComponentFixture<AddVehicleComponent>;
  let daoSpy: jasmine.SpyObj<CustomerDao>;

  beforeEach(async () => {
    daoSpy = jasmine.createSpyObj('CustomerDao', ['addVehicle'], {
      currentUser$: of({ id: 'u1', name: 'Test User' }),
    });

    await TestBed.configureTestingModule({
      imports: [AddVehicleComponent],
      providers: [{ provide: CustomerDao, useValue: daoSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(AddVehicleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set user from dao on init', () => {
    expect(component.user).toEqual({ id: 'u1', name: 'Test User' } as any);
  });

  it('should not submit if required fields are empty', () => {
    component.onSubmit();
    expect(daoSpy.addVehicle).not.toHaveBeenCalled();
  });

  it('should submit vehicle when form is filled', () => {
    const mockVehicle = { id: 'v1', plateNumber: 'KA01AB1234' } as any;
    daoSpy.addVehicle.and.returnValue(of(mockVehicle));

    component.plateNumber = 'KA01AB1234';
    component.name = 'My Car';
    component.model = 'Honda City';
    component.vehicleType = '4-WHEELER';

    spyOn(component.vehicleAdded, 'emit');
    spyOn(component.closed, 'emit');

    component.onSubmit();

    expect(daoSpy.addVehicle).toHaveBeenCalled();
    expect(component.vehicleAdded.emit).toHaveBeenCalledWith(mockVehicle);
    expect(component.closed.emit).toHaveBeenCalled();
  });

  it('should emit closed on closeSheet', () => {
    spyOn(component.closed, 'emit');
    component.closeSheet();
    expect(component.closed.emit).toHaveBeenCalled();
  });

  it('should reset form on closeSheet', () => {
    component.plateNumber = 'XX';
    component.name = 'XX';
    component.closeSheet();
    expect(component.plateNumber).toBe('');
    expect(component.name).toBe('');
  });

  it('should filter special characters in validateInput', () => {
    const event = { target: { value: 'AB@#12' } };
    const result = component.validateInput(event);
    expect(result).toBe('AB12');
  });
});
