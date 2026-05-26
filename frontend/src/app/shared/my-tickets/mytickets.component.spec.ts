import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import { MyTicketsComponent } from './mytickets.component';
import { HelpCenterDao } from './mytickets.dao';

describe('MyTicketsComponent', () => {
  let component: MyTicketsComponent;
  let fixture: ComponentFixture<MyTicketsComponent>;
  let dao: any;

  beforeEach(async () => {
    const daoSpy = {
      getTicketsByUser: jasmine.createSpy().and.returnValue(
        of([
          { id: 't1', subject: 'Issue', status: 'OPEN' },
          { id: 't2', subject: 'Bug', status: 'IN_PROGRESS' },
        ]),
      ),
      updateTicketStatus: jasmine.createSpy().and.returnValue(of({})),
    };

    await TestBed.configureTestingModule({
      imports: [MyTicketsComponent, RouterTestingModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: HelpCenterDao, useValue: daoSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(MyTicketsComponent, {
        set: { template: '', imports: [], providers: [] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(MyTicketsComponent);
    component = fixture.componentInstance;
    dao = TestBed.inject(HelpCenterDao);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load tickets on init', () => {
    expect(component.tickets.length).toBe(2);
  });

  it('should return correct status class', () => {
    expect(component.getStatusClass('OPEN')).toBe('status-open');
    expect(component.getStatusClass('REJECTED')).toBe('status-rejected');
  });

  it('should format status strings', () => {
    expect(component.formatStatus('OPEN')).toBe('Open');
    expect(component.formatStatus('IN_PROGRESS')).toBe('In Progress');
    expect(component.formatStatus('APPROVED')).toBe('Approved');
    expect(component.formatStatus('REJECTED')).toBe('Rejected');
  });

  it('should call updateTicketStatus on status change', () => {
    const ticket = { id: 't1', status: 'OPEN' } as any;
    component.onStatusChange(ticket, 'APPROVED');
    expect(dao.updateTicketStatus).toHaveBeenCalledWith('t1', 'APPROVED');
  });

  it('should have 4 status options', () => {
    expect(component.statuses.length).toBe(4);
  });
});
