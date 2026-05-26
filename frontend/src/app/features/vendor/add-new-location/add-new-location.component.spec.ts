import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { AddNewLocationComponent } from './add-new-location.component';
import { AddNewLocationService } from './add-new-location.service';
import { AuthService } from '../../../core/services/auth.service';
import { ModalService } from '../../../shared/modal/modal.service';

describe('AddNewLocationComponent', () => {
  let component: AddNewLocationComponent;
  let fixture: ComponentFixture<AddNewLocationComponent>;

  beforeEach(async () => {
    const locationSpy = jasmine.createSpyObj('AddNewLocationService', [
      'checkLocationNameExists',
      'uploadGstDocument',
      'buildLocationData',
      'postLocation',
    ]);
    const authSpy = jasmine.createSpyObj('AuthService', [], {
      currentUserValue: { id: 'vendor1' },
    });
    const modalSpy = jasmine.createSpyObj('ModalService', ['confirm']);
    locationSpy.checkLocationNameExists.and.returnValue(of(false));
    modalSpy.confirm.and.returnValue(Promise.resolve(true));

    await TestBed.configureTestingModule({
      imports: [AddNewLocationComponent, RouterTestingModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AddNewLocationService, useValue: locationSpy },
        { provide: AuthService, useValue: authSpy },
        { provide: ModalService, useValue: modalSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(AddNewLocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form', () => {
    expect(component.form).toBeDefined();
    expect(component.form.get('locationName')).toBeTruthy();
    expect(component.form.get('capacity')).toBeTruthy();
    expect(component.form.get('bikePrice')).toBeTruthy();
    expect(component.form.get('carPrice')).toBeTruthy();
  });

  it('should have 7 operational days', () => {
    expect(component.operationalDays.length).toBe(7);
    expect(component.operationalDaysArray.length).toBe(7);
  });

  it('should have 3 amenities', () => {
    expect(component.amenities.length).toBe(3);
    expect(component.amenitiesDetailsArray.length).toBe(3);
  });

  it('should mark form as invalid when empty', () => {
    expect(component.form.valid).toBeFalse();
  });

  it('should not submit if form is invalid', () => {
    component.onSubmit();
    expect(component.isSubmitting).toBeFalse();
  });

  it('should validate locationName minimum length', () => {
    component.form.get('locationName')?.setValue('Ab');
    expect(
      component.form.get('locationName')?.hasError('minlength'),
    ).toBeTrue();
  });

  it('should reject all-spaces location name', () => {
    component.form.get('locationName')?.setValue('     ');
    expect(
      component.form.get('locationName')?.hasError('allSpaces'),
    ).toBeTrue();
  });

  it('should validate file type on selection', () => {
    const event = {
      target: {
        files: [
          new File([''], 'test.exe', { type: 'application/x-msdownload' }),
        ],
      },
    } as unknown as Event;
    component.onFileSelected(event);
    expect(component.gstFileError).toBe(
      'Only PDF, JPG, or PNG files are allowed.',
    );
    expect(component.gstFile).toBeNull();
  });

  it('should accept valid PDF file', () => {
    const file = new File(['content'], 'doc.pdf', { type: 'application/pdf' });
    const event = { target: { files: [file] } } as unknown as Event;
    component.onFileSelected(event);
    expect(component.gstFile).toBe(file);
    expect(component.gstFileError).toBeNull();
  });

  it('should reject file larger than 5MB', () => {
    const bigContent = new Array(6 * 1024 * 1024).fill('a').join('');
    const file = new File([bigContent], 'big.pdf', { type: 'application/pdf' });
    const event = { target: { files: [file] } } as unknown as Event;
    component.onFileSelected(event);
    expect(component.gstFileError).toBe('File size must be under 5 MB.');
  });

  it('should set vendorId from auth service', () => {
    expect(component.vendorId).toBe('vendor1');
  });
});
