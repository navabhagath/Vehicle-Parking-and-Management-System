import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { CustomerLayoutComponent } from './customer-layout.component';
import { CustomerDao } from '../../../shared/customer.dao';
import { CustomerStateService } from '../../../shared/services/selected-location.service';
import { LocationDropdownComponent } from '../location-dropdown/location-dropdown.component';
import { ProfileOffcanvasComponent } from '../profileoff-canvas/profileoff-canvas.component';
import { Component } from '@angular/core';

// Stub child components
@Component({
  selector: 'app-location-dropdown',
  standalone: true,
  template: '',
})
class MockLocationDropdown {}
@Component({
  selector: 'app-profile-offcanvas',
  standalone: true,
  template: '',
})
class MockProfileOffcanvas {
  open() {}
}

describe('CustomerLayoutComponent', () => {
  let component: CustomerLayoutComponent;
  let fixture: ComponentFixture<CustomerLayoutComponent>;
  let customerStateSpy: jasmine.SpyObj<CustomerStateService>;

  beforeEach(async () => {
    const daoSpy = jasmine.createSpyObj('CustomerDao', [], {
      currentUser$: of({ name: 'John', role: 'CUSTOMER' }),
    });
    customerStateSpy = jasmine.createSpyObj('CustomerStateService', [
      'setLocation',
    ]);

    await TestBed.configureTestingModule({
      imports: [CustomerLayoutComponent, RouterTestingModule],
      providers: [
        { provide: CustomerDao, useValue: daoSpy },
        { provide: CustomerStateService, useValue: customerStateSpy },
      ],
    })
      .overrideComponent(CustomerLayoutComponent, {
        remove: {
          imports: [LocationDropdownComponent, ProfileOffcanvasComponent],
        },
        add: { imports: [MockLocationDropdown, MockProfileOffcanvas] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(CustomerLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set user on init', () => {
    expect(component.user).toEqual({ name: 'John', role: 'CUSTOMER' } as any);
  });

  it('should generate profile image URL', () => {
    expect(component.profileImg).toContain('ui-avatars.com');
    expect(component.profileImg).toContain('John');
  });

  it('should call customerState.setLocation on locationChange', () => {
    const loc = { name: 'Lot A' } as any;
    component.onLocationChange(loc);
    expect(customerStateSpy.setLocation).toHaveBeenCalledWith(loc);
  });
});
