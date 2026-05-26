import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { SuperAdminRbacPanelComponent } from './super-admin-rbac-panel.component';

describe('SuperAdminRbacPanelComponent', () => {
  let component: SuperAdminRbacPanelComponent;
  let fixture: ComponentFixture<SuperAdminRbacPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SuperAdminRbacPanelComponent, RouterTestingModule],
      providers: [provideHttpClient(), provideHttpClientTesting()],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(SuperAdminRbacPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have adminSearchUserService injected', () => {
    expect(component.adminSearchUserService).toBeTruthy();
  });

  it('should call applyFilter and update search term', () => {
    spyOn(component.adminSearchUserService, 'updateSearchTerm');
    const event = { target: { value: 'john' } } as unknown as Event;
    component.applyFilter(event);
    expect(
      component.adminSearchUserService.updateSearchTerm,
    ).toHaveBeenCalledWith('john');
  });

  it('should navigate to user details on goToDetails', () => {
    const router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    spyOn(router, 'navigate');
    component.goToDetails('user123');
    expect(router.navigate).toHaveBeenCalledWith([
      '/super_admin/user-details',
      'user123',
    ]);
  });
});
