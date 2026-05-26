import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { MyVehiclesComponent } from './my-vehicles.component';
import { CustomerDao } from '../../../shared/customer.dao';

describe('MyVehiclesComponent', () => {
  let component: MyVehiclesComponent;
  let fixture: ComponentFixture<MyVehiclesComponent>;
  let daoSpy: jasmine.SpyObj<CustomerDao>;

  beforeEach(async () => {
    daoSpy = jasmine.createSpyObj('CustomerDao', ['updateVehicle']);

    await TestBed.configureTestingModule({
      imports: [MyVehiclesComponent],
      providers: [{ provide: CustomerDao, useValue: daoSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(MyVehiclesComponent);
    component = fixture.componentInstance;
    component.user = { id: 'u1', name: 'Test' } as any;
    component.vehicles = [
      { id: 'v1', name: 'Car 1', isPrimary: true } as any,
      { id: 'v2', name: 'Car 2', isPrimary: false } as any,
    ];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit addVehicleRequest on addVehicle', () => {
    spyOn(component.addVehicleRequest, 'emit');
    component.addVehicle();
    expect(component.addVehicleRequest.emit).toHaveBeenCalled();
  });

  it('should toggle primary status', () => {
    daoSpy.updateVehicle.and.returnValue(of({} as any));
    const vehicle = component.vehicles[1]; // isPrimary = false

    component.updatePrimary(vehicle);

    expect(daoSpy.updateVehicle).toHaveBeenCalledWith('v2', {
      isPrimary: true,
    });
  });

  it('should unset old primary when setting new primary', () => {
    daoSpy.updateVehicle.and.returnValue(of({} as any));
    const vehicle = component.vehicles[1]; // isPrimary = false

    component.updatePrimary(vehicle);

    // Second call should unset old primary (v1)
    expect(daoSpy.updateVehicle).toHaveBeenCalledWith('v1', {
      isPrimary: false,
    });
  });
});
