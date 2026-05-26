import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LandingPageComponent } from './landing-page.component';
import { AuthService } from '../../../core/services/auth.service';
import { LandingPageService } from './landing-page.service';
import { ModalService } from '../../../shared/modal/modal.service';

describe('LandingPageComponent', () => {
  let component: LandingPageComponent;
  let fixture: ComponentFixture<LandingPageComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let landingPageService: jasmine.SpyObj<LandingPageService>;
  let modalService: jasmine.SpyObj<ModalService>;
  let router: Router;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj(
      'AuthService',
      ['logout', 'updateCurrentUser'],
      {
        currentUserValue: { id: 'user1', role: 'VENDOR' },
      },
    );
    const landingSpy = jasmine.createSpyObj('LandingPageService', [
      'getDashboardData',
      'getSubscriptionStatus',
      'getLocationSlots',
      'renewSubscription',
    ]);
    const modalSpy = jasmine.createSpyObj('ModalService', ['confirm']);

    landingSpy.getDashboardData.and.returnValue(
      of({
        locations: [],
        occupancyMap: {},
        activeCount: 2,
        totalSlots: 50,
        totalOccupied: 20,
      }),
    );
    landingSpy.getSubscriptionStatus.and.returnValue(
      of({ active: true, expiresAt: '2027-01-01' }),
    );
    landingSpy.getLocationSlots.and.returnValue(10);
    modalSpy.confirm.and.returnValue(Promise.resolve(true));

    await TestBed.configureTestingModule({
      imports: [LandingPageComponent, RouterTestingModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authSpy },
        { provide: LandingPageService, useValue: landingSpy },
        { provide: ModalService, useValue: modalSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(LandingPageComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    landingPageService = TestBed.inject(
      LandingPageService,
    ) as jasmine.SpyObj<LandingPageService>;
    modalService = TestBed.inject(ModalService) as jasmine.SpyObj<ModalService>;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load dashboard data on init', () => {
    expect(component.activeCount).toBe(2);
    expect(component.totalSlots).toBe(50);
    expect(component.totalOccupied).toBe(20);
  });

  it('should set isLoading to false after loading', () => {
    expect(component.isLoading).toBeFalse();
  });

  it('should set loadError on network failure', () => {
    landingPageService.getDashboardData.and.returnValue(
      throwError(() => ({ status: 0 })),
    );
    component.loadDashboard();
    expect(component.loadError).toBe(
      'Cannot reach the server. Please check your connection.',
    );
  });

  it('should set generic loadError on non-network failure', () => {
    landingPageService.getDashboardData.and.returnValue(
      throwError(() => ({ status: 500 })),
    );
    component.loadDashboard();
    expect(component.loadError).toBe('Failed to load dashboard.');
  });

  it('should call retry and reload dashboard', () => {
    spyOn(component, 'loadDashboard');
    component.retry();
    expect(component.loadDashboard).toHaveBeenCalled();
  });

  it('should navigate to /vendor/location/new on addLocation', () => {
    spyOn(router, 'navigate');
    component.onAddLocation();
    expect(router.navigate).toHaveBeenCalledWith(['/vendor/location/new']);
  });

  it('should navigate to location on click if active and approved', () => {
    spyOn(router, 'navigate');
    const loc = {
      id: 'loc1',
      isActive: true,
      approvalStatus: 'APPROVED',
    } as any;
    component.onLocationClick(loc);
    expect(router.navigate).toHaveBeenCalledWith(['/vendor/location', 'loc1']);
  });

  it('should not navigate if location is not active', () => {
    spyOn(router, 'navigate');
    const loc = {
      id: 'loc1',
      isActive: false,
      approvalStatus: 'APPROVED',
    } as any;
    component.onLocationClick(loc);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should call getLocationSlots from service', () => {
    const loc = { id: 'loc1' } as any;
    const result = component.getLocationSlots(loc);
    expect(landingPageService.getLocationSlots).toHaveBeenCalledWith(loc);
    expect(result).toBe(10);
  });
});
