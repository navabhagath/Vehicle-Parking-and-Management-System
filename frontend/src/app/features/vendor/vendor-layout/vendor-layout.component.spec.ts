import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { VendorLayoutComponent } from './vendor-layout.component';
import { VendorLayoutService } from './vendor-layout.service';
import { AuthService } from '../../../core/services/auth.service';
import { ModalService } from '../../../shared/modal/modal.service';

describe('VendorLayoutComponent', () => {
  let component: VendorLayoutComponent;
  let fixture: ComponentFixture<VendorLayoutComponent>;
  let router: Router;
  let modalService: jasmine.SpyObj<ModalService>;

  beforeEach(async () => {
    const daoSpy = jasmine.createSpyObj('VendorLayoutDao', ['getLocationName']);
    const authSpy = jasmine.createSpyObj('AuthService', ['logout']);
    const modalSpy = jasmine.createSpyObj('ModalService', ['confirm']);
    daoSpy.getLocationName.and.returnValue(
      of({ locationName: 'Test Parking' }),
    );
    modalSpy.confirm.and.returnValue(Promise.resolve(true));

    await TestBed.configureTestingModule({
      imports: [VendorLayoutComponent, RouterTestingModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: VendorLayoutService, useValue: daoSpy },
        { provide: AuthService, useValue: authSpy },
        { provide: ModalService, useValue: modalSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(VendorLayoutComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    modalService = TestBed.inject(ModalService) as jasmine.SpyObj<ModalService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have menu items defined', () => {
    expect(component.menuItems.length).toBeGreaterThan(0);
  });

  it('should toggle sidebar', () => {
    const initial = component.sidebarOpen;
    component.toggleSidebar();
    expect(component.sidebarOpen).toBe(!initial);
  });

  it('should navigate back to landing on goBackToLanding', () => {
    spyOn(router, 'navigate');
    component.goBackToLanding();
    expect(router.navigate).toHaveBeenCalledWith(['/vendor/dashboard']);
  });

  it('should return activeLabel based on activeMenu', () => {
    expect(component.activeLabel).toBeDefined();
  });

  it('should call logout after confirmation', async () => {
    const authService = TestBed.inject(
      AuthService,
    ) as jasmine.SpyObj<AuthService>;
    await component.logout();
    expect(modalService.confirm).toHaveBeenCalled();
    expect(authService.logout).toHaveBeenCalled();
  });
});
