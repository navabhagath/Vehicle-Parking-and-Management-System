import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { SuperAdminManagePermissions } from './super-admin-manage-permissions.component';

describe('SuperAdminManagePermissionsComponent', () => {
  let component: SuperAdminManagePermissions;
  let fixture: ComponentFixture<SuperAdminManagePermissions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SuperAdminManagePermissions, RouterTestingModule],
      providers: [provideHttpClient(), provideHttpClientTesting()],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(SuperAdminManagePermissions);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have isLoading true initially', () => {
    expect(component.isLoading).toBeTrue();
  });

  it('should have permissionGroups defined', () => {
    expect(component.permissionGroups).toBeDefined();
    expect(component.permissionGroups.length).toBeGreaterThan(0);
  });

  it('should have empty notificationMessage initially', () => {
    expect(component.notificationMessage).toBe('');
  });

  it('should have isUpdatingStatus false initially', () => {
    expect(component.isUpdatingStatus).toBeFalse();
  });
});
