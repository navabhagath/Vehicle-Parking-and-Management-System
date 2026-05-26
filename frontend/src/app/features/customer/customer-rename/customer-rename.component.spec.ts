import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { CustomerRenameComponent } from './customer-rename.component';
import { AuthService } from '../../../core/services/auth.service';
import { UserDao } from '../../../features/vendor/vendor-login/user.dao';

describe('CustomerRenameComponent', () => {
  let component: CustomerRenameComponent;
  let fixture: ComponentFixture<CustomerRenameComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let userDaoSpy: jasmine.SpyObj<UserDao>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj(
      'AuthService',
      ['updateCurrentUser'],
      {
        currentUserValue: { id: 'u1', name: 'Old Name' },
      },
    );
    userDaoSpy = jasmine.createSpyObj('UserDao', ['updateUserName']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [CustomerRenameComponent, ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: UserDao, useValue: userDaoSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomerRenameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have invalid nameControl initially', () => {
    expect(component.nameControl.valid).toBeFalse();
  });

  it('should require minimum 4 characters', () => {
    component.nameControl.setValue('Ab');
    expect(component.nameControl.hasError('minlength')).toBeTrue();
  });

  it('should not allow special characters at start', () => {
    component.nameControl.setValue('1abc');
    expect(component.nameControl.hasError('pattern')).toBeTrue();
  });

  it('should accept valid name', () => {
    component.nameControl.setValue('John Doe');
    expect(component.nameControl.valid).toBeTrue();
  });

  it('should not submit if control is invalid', () => {
    component.nameControl.setValue('');
    component.onSubmit();
    expect(userDaoSpy.updateUserName).not.toHaveBeenCalled();
  });

  it('should submit and navigate to dashboard on success', () => {
    const updatedUser = { id: 'u1', name: 'New Name' };
    userDaoSpy.updateUserName.and.returnValue(of({ user: updatedUser } as any));
    component.nameControl.setValue('New Name');

    component.onSubmit();

    expect(userDaoSpy.updateUserName).toHaveBeenCalledWith('New Name');
    expect(authServiceSpy.updateCurrentUser).toHaveBeenCalledWith(
      updatedUser as any,
    );
    expect(routerSpy.navigate).toHaveBeenCalledWith(['customer', 'dashboard']);
  });

  it('should show error message on failure', () => {
    userDaoSpy.updateUserName.and.returnValue(
      throwError(() => new Error('fail')),
    );
    component.nameControl.setValue('Valid Name');

    component.onSubmit();

    expect(component.errorMessage).toBe(
      'Failed to save your name. Please try again.',
    );
    expect(component.isLoading).toBeFalse();
  });
});
