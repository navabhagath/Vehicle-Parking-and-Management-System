import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { Router } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { CustomerDao } from '../../../shared/customer.dao';
import { CustomerStateService } from '../../../shared/services/selected-location.service';
import { TimeslotService } from '../../../shared/services/timeslot.service';
import { QrService } from '../../../shared/services/qr.service';
import { Component, Input } from '@angular/core';
import { AddVehicleComponent } from '../add-vehicle/add-vehicle.component';
import { ParkingLocationComponent } from '../parking-location/parking-location.component';
import { MyVehiclesComponent } from '../my-vehicles/my-vehicles.component';
import { DashboardWalletComponent } from '../dashboard-wallet/dashboard-wallet.component';
import { RecentBookingsComponent } from '../recent-bookings/recent-bookings.component';

// Stub child components
@Component({ selector: 'app-add-vehicle', standalone: true, template: '' })
class MockAddVehicle {
  @Input() user: any;
}
@Component({ selector: 'app-parking-location', standalone: true, template: '' })
class MockParkingLocation {
  @Input() selectedLocation: any;
}
@Component({ selector: 'app-my-vehicles', standalone: true, template: '' })
class MockMyVehicles {
  @Input() user: any;
  @Input() vehicles: any;
}
@Component({ selector: 'app-dashboard-wallet', standalone: true, template: '' })
class MockDashboardWallet {
  @Input() user: any;
}
@Component({ selector: 'app-recent-bookings', standalone: true, template: '' })
class MockRecentBookings {
  @Input() user: any;
}

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let daoSpy: jasmine.SpyObj<CustomerDao>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    daoSpy = jasmine.createSpyObj(
      'CustomerDao',
      ['getVehiclesByUser', 'getWalletByUser'],
      {
        currentUser$: of({ id: 'u1', name: 'Test' }),
        wallet$: of({ balance: 500 }),
      },
    );
    daoSpy.getVehiclesByUser.and.returnValue(of([]));
    daoSpy.getWalletByUser.and.returnValue(of([{ balance: 500 }] as any));

    const customerStateSpy = jasmine.createSpyObj(
      'CustomerStateService',
      ['setLocation'],
      {
        selectedLocation$: of(null),
      },
    );
    const timeslotSpy = jasmine.createSpyObj('TimeslotService', [
      'getBookingsByCustomer',
    ]);
    timeslotSpy.getBookingsByCustomer.and.returnValue(of([]));
    const qrSpy = jasmine.createSpyObj('QrService', ['generateQrData']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        { provide: CustomerDao, useValue: daoSpy },
        { provide: CustomerStateService, useValue: customerStateSpy },
        { provide: TimeslotService, useValue: timeslotSpy },
        { provide: QrService, useValue: qrSpy },
        { provide: Router, useValue: routerSpy },
      ],
    })
      .overrideComponent(DashboardComponent, {
        remove: {
          imports: [
            AddVehicleComponent,
            ParkingLocationComponent,
            MyVehiclesComponent,
            DashboardWalletComponent,
            RecentBookingsComponent,
          ],
        },
        add: {
          imports: [
            MockAddVehicle,
            MockParkingLocation,
            MockMyVehicles,
            MockDashboardWallet,
            MockRecentBookings,
          ],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set user on init', () => {
    expect(component.user).toEqual({ id: 'u1', name: 'Test' } as any);
  });

  it('should set walletValue from wallet$', () => {
    expect(component.walletValue).toBe(500);
  });

  it('should return false for hasVehicles when empty', () => {
    expect(component.hasVehicles).toBeFalse();
  });

  it('should toggle showAddVehicle', () => {
    expect(component.showAddVehicle).toBeFalse();
    component.openAddVehicle();
    expect(component.showAddVehicle).toBeTrue();
    component.onAddVehicleClosed();
    expect(component.showAddVehicle).toBeFalse();
  });

  it('should add vehicle to list on onVehicleAdded', () => {
    const v = { id: 'v1', isPrimary: false } as any;
    component.onVehicleAdded(v);
    expect(component.vehicles.length).toBe(1);
  });

  it('should navigate on BookNow', () => {
    component.BookNow();
    expect(routerSpy.navigate).toHaveBeenCalledWith(
      ['/customer/choose-vehicle'],
      jasmine.any(Object),
    );
  });
});
