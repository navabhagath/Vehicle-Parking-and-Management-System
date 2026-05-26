import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import { HelpcenterComponent } from './helpcenter.component';
import { HelpCenterDao } from './helpcenter.dao';

describe('HelpcenterComponent', () => {
  let component: HelpcenterComponent;
  let fixture: ComponentFixture<HelpcenterComponent>;
  let dao: any;

  beforeEach(async () => {
    const daoSpy = {
      getTicketsByUser: jasmine
        .createSpy()
        .and.returnValue(of([{ id: 't1', subject: 'Test', status: 'OPEN' }])),
      updateTicketStatus: jasmine.createSpy().and.returnValue(of({})),
    };

    await TestBed.configureTestingModule({
      imports: [HelpcenterComponent, RouterTestingModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: HelpCenterDao, useValue: daoSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(HelpcenterComponent, {
        set: { template: '', imports: [], providers: [] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(HelpcenterComponent);
    component = fixture.componentInstance;
    dao = TestBed.inject(HelpCenterDao);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load tickets on init', () => {
    expect(component.tickets.length).toBe(1);
    expect(component.tickets[0].id).toBe('t1');
  });

  it('should return correct status class', () => {
    expect(component.getStatusClass('OPEN')).toBe('status-open');
    expect(component.getStatusClass('IN_PROGRESS')).toBe('status-in_progress');
  });

  it('should format status correctly', () => {
    expect(component.formatStatus('OPEN')).toBe('Open');
    expect(component.formatStatus('IN_PROGRESS')).toBe('In Progress');
    expect(component.formatStatus('APPROVED')).toBe('Approved');
    expect(component.formatStatus('REJECTED')).toBe('Rejected');
    expect(component.formatStatus('UNKNOWN')).toBe('UNKNOWN');
  });

  it('should have 4 status options', () => {
    expect(component.statuses.length).toBe(4);
  });

  it('should call dao.updateTicketStatus on status change', () => {
    const ticket = { id: 't1', subject: 'Test', status: 'OPEN' } as any;
    component.onStatusChange(ticket, 'APPROVED');
    expect(dao.updateTicketStatus).toHaveBeenCalledWith('t1', 'APPROVED');
  });
});
