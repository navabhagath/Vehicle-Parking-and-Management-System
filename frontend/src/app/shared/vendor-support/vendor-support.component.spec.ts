import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import { RaiseTicketComponent as CustomerSupportComponent } from './vendor-support.component';
import { VendorSupportDao } from './vendor-support.dao';

describe('VendorSupportComponent', () => {
  let component: CustomerSupportComponent;
  let fixture: ComponentFixture<CustomerSupportComponent>;

  beforeEach(async () => {
    const daoSpy = {
      currentUser$: of({ id: 'vendor1', email: 'vendor@test.com' }),
      raiseTicket: jasmine.createSpy().and.returnValue(of({})),
    };

    await TestBed.configureTestingModule({
      imports: [CustomerSupportComponent, RouterTestingModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: VendorSupportDao, useValue: daoSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(CustomerSupportComponent, {
        set: { template: '', imports: [], providers: [] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(CustomerSupportComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize ticket with empty fields', () => {
    expect(component.ticket.subject).toBe('');
    expect(component.ticket.email).toBe('');
    expect(component.ticket.issue).toBe('');
    expect(component.ticket.category).toBe('');
    expect(component.ticket.bookingId).toBe('');
  });

  it('should set formSubmitted to false initially', () => {
    expect(component.formSubmitted).toBeFalse();
  });

  it('should select category', () => {
    component.selectCategory('billing');
    expect(component.ticket.category).toBe('billing');
  });

  it('should unsubscribe on destroy', () => {
    spyOn((component as any).sub, 'unsubscribe');
    component.ngOnDestroy();
    expect((component as any).sub.unsubscribe).toHaveBeenCalled();
  });
});
