import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { CustomerComponent } from './customer.component';
import { DashboardComponent } from './dashboard/dashboard.component';

// Stub DashboardComponent
@Component({ selector: 'app-dashboard', standalone: true, template: '' })
class MockDashboardComponent {}

describe('CustomerComponent', () => {
  let component: CustomerComponent;
  let fixture: ComponentFixture<CustomerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerComponent],
    })
      .overrideComponent(CustomerComponent, {
        remove: {
          imports: [DashboardComponent],
        },
        add: { imports: [MockDashboardComponent] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(CustomerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render without errors', () => {
    expect(fixture.nativeElement).toBeTruthy();
  });
});
