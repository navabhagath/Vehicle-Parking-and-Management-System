import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ProfileOffcanvasComponent } from './profileoff-canvas.component';
import { CustomerDao } from '../../../shared/customer.dao';
import { AuthService } from '../../../core/services/auth.service';
import { ModalService } from '../../../shared/modal/modal.service';
import { WalletComponent } from '../../../shared/wallet/wallet.component';

// Mock WalletComponent
@Component({ selector: 'app-wallet', standalone: true, template: '' })
class MockWalletComponent {}

describe('ProfileOffcanvasComponent', () => {
  let component: ProfileOffcanvasComponent;
  let fixture: ComponentFixture<ProfileOffcanvasComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let modalServiceSpy: jasmine.SpyObj<ModalService>;

  beforeEach(async () => {
    (window as any).bootstrap = {
      Offcanvas: class {
        show() {}
        hide() {}
      },
    };

    const daoSpy = jasmine.createSpyObj('CustomerDao', [], {
      currentUser$: of({ name: 'John', role: 'CUSTOMER' }),
    });
    authServiceSpy = jasmine.createSpyObj('AuthService', ['logout']);
    modalServiceSpy = jasmine.createSpyObj('ModalService', ['confirm']);

    await TestBed.configureTestingModule({
      imports: [ProfileOffcanvasComponent, RouterTestingModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: CustomerDao, useValue: daoSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: ModalService, useValue: modalServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(ProfileOffcanvasComponent, {
        remove: { imports: [WalletComponent] },
        add: { imports: [MockWalletComponent], schemas: [NO_ERRORS_SCHEMA] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(ProfileOffcanvasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set user from dao', () => {
    expect(component.user).toEqual({ name: 'John', role: 'CUSTOMER' } as any);
  });

  it('should generate profile image URL', () => {
    expect(component.profileImg).toContain('ui-avatars.com');
    expect(component.profileImg).toContain('John');
  });

  it('should call logout on confirmed signOut', async () => {
    modalServiceSpy.confirm.and.returnValue(Promise.resolve(true));
    await component.signOut();
    expect(authServiceSpy.logout).toHaveBeenCalled();
  });

  it('should not call logout when signOut is cancelled', async () => {
    modalServiceSpy.confirm.and.returnValue(Promise.resolve(false));
    await component.signOut();
    expect(authServiceSpy.logout).not.toHaveBeenCalled();
  });
});
