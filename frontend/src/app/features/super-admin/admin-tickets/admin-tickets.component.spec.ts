import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { AdminTicketsComponent } from './admin-tickets.component';
import { AdminTicketsService } from './admin-tickets.service';
import { AdminSidebarComponent } from '../admin-sidebar/admin-sidebar.component';
import { Ticket } from '../../../models/ticket.model';

// Lightweight stub to replace the real sidebar so we don't drag in AuthService/HttpClient.
@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  template: '',
})
class AdminSidebarStubComponent {}

// The template uses <app-sidebar> (not <app-admin-sidebar>), so we need a stub for that too.
@Component({
  selector: 'app-sidebar',
  standalone: true,
  template: '',
})
class SidebarStubComponent {}

describe('AdminTicketsComponent', () => {
  let component: AdminTicketsComponent;
  let fixture: ComponentFixture<AdminTicketsComponent>;
  let dao: jasmine.SpyObj<AdminTicketsService>;
  let location: jasmine.SpyObj<Location>;
  let router: jasmine.SpyObj<Router>;

  const mockTickets: Ticket[] = [
    {
      id: 't1',
      subject: 'Gate broken',
      emailId: 'a@b.com',
      status: 'OPEN',
      createdAt: '2026-01-01T10:00:00Z',
    } as Ticket,
    {
      id: 't2',
      subject: 'Payment issue',
      emailId: 'c@d.com',
      status: 'IN_PROGRESS',
      createdAt: '2026-01-02T10:00:00Z',
    } as Ticket,
  ];

  beforeEach(async () => {
    const daoSpy = jasmine.createSpyObj<AdminTicketsService>('AdminTicketsService', [
      'getTicketsByUser',
      'updateTicketStatus',
    ]);
    const locationSpy = jasmine.createSpyObj<Location>('Location', ['back']);
    const routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);

    daoSpy.getTicketsByUser.and.returnValue(of(mockTickets));
    daoSpy.updateTicketStatus.and.returnValue(of({}));

    await TestBed.configureTestingModule({
      imports: [AdminTicketsComponent],
      providers: [
        { provide: AdminTicketsService, useValue: daoSpy },
        { provide: Location, useValue: locationSpy },
        { provide: Router, useValue: routerSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(AdminTicketsComponent, {
        remove: { imports: [AdminSidebarComponent] },
        add: { imports: [AdminSidebarStubComponent, SidebarStubComponent] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(AdminTicketsComponent);
    component = fixture.componentInstance;
    dao = TestBed.inject(AdminTicketsService) as jasmine.SpyObj<AdminTicketsService>;
    location = TestBed.inject(Location) as jasmine.SpyObj<Location>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    fixture.detectChanges();
  });

  it('should create and load tickets on init', () => {
    expect(component).toBeTruthy();
    expect(dao.getTicketsByUser).toHaveBeenCalled();
    expect(component.tickets).toEqual(mockTickets);
    expect(component.statuses.length).toBe(4);
  });

  it('should format status labels and classes', () => {
    expect(component.formatStatus('OPEN')).toBe('Open');
    expect(component.formatStatus('IN_PROGRESS')).toBe('In Progress');
    expect(component.formatStatus('UNKNOWN')).toBe('UNKNOWN');
    expect(component.getStatusClass('OPEN')).toBe('status-open');
    expect(component.getStatusClass('IN_PROGRESS')).toBe('status-in_progress');
  });

  it('should update ticket status on success and leave others unchanged', () => {
    component.onStatusChange(mockTickets[0], 'APPROVED');
    expect(dao.updateTicketStatus).toHaveBeenCalledWith('t1', 'APPROVED');
    expect(component.tickets.find((t) => t.id === 't1')?.status).toBe('APPROVED');
    expect(component.tickets.find((t) => t.id === 't2')?.status).toBe('IN_PROGRESS');
  });

  it('should not mutate tickets when updateTicketStatus errors', () => {
    dao.updateTicketStatus.and.returnValue(throwError(() => new Error('fail')));
    component.onStatusChange(mockTickets[0], 'REJECTED');
    expect(component.tickets.find((t) => t.id === 't1')?.status).toBe('OPEN');
  });

  it('should navigate on raiseTicket and call location.back on goBack', () => {
    component.raiseTicket();
    expect(router.navigate).toHaveBeenCalledWith(['/customer/support']);
    component.goBack();
    expect(location.back).toHaveBeenCalled();
  });
});