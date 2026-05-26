import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  AbstractControl,
  AsyncValidatorFn,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { AddNewLocationService } from './add-new-location.service';
import { ModalService } from '../../../shared/modal/modal.service';
import { map, of, switchMap, timer } from 'rxjs';
import { first } from 'rxjs/operators';

// Custom validator: closing time must be after opening time
export const timeRangeValidator: ValidatorFn = (
  group: AbstractControl
): ValidationErrors | null => {
  const start = group.get('operationalHours.start')?.value;
  const end = group.get('operationalHours.end')?.value;
  return start && end && start >= end ? { invalidTimeRange: true } : null;
};

// Custom Validator for the Arrays
export const minSelectedValidator = (min: number): ValidatorFn => {
  return (group: AbstractControl): ValidationErrors | null => {
    const arr = group as FormArray;
    const selected = arr.controls.filter((c) => c.value === true).length;
    return selected >= min
      ? null
      : { minSelected: { required: min, actual: selected } };
  };
};

// Custom validator for white spaces
export const noAllSpacesValidator: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {
  const value = control.value as string;
  if (value && value.trim().length === 0) {
    return { allSpaces: true };
  }
  return null;
};

export function uniqueLocationNameValidator(
  locationService: AddNewLocationService
): AsyncValidatorFn {
  return (control: AbstractControl) => {
    if (!control.value || control.value.trim().length === 0) {
      return of(null);
    }
    return timer(500).pipe(
      switchMap(() => locationService.checkLocationNameExists(control.value)),
      map((exists) => (exists ? { nameExists: true } : null)),
      first()
    );
  };
}

@Component({
  selector: 'app-add-new-location',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './add-new-location.component.html',
  styleUrl: './add-new-location.component.scss',
})
export class AddNewLocationComponent implements OnInit {
  private fb: FormBuilder = inject(FormBuilder);
  private router: Router = inject(Router);
  private authService: AuthService = inject(AuthService);
  private modalService: ModalService = inject(ModalService);
  private locationService: AddNewLocationService = inject(AddNewLocationService);

  isSubmitting = false;
  submitError = false;
  isFetchingLocation = false;
  vendorId = '';
  form!: FormGroup;

  // GST file upload state
  gstFile: File | null = null;
  gstFileError: string | null = null;

  operationalDays = [
    { id: 1, day: 'Sunday' },
    { id: 2, day: 'Monday' },
    { id: 3, day: 'Tuesday' },
    { id: 4, day: 'Wednesday' },
    { id: 5, day: 'Thursday' },
    { id: 6, day: 'Friday' },
    { id: 7, day: 'Saturday' },
  ];

  amenities = [
    { id: 1, prop: 'CCTV' },
    { id: 2, prop: 'Security Guard' },
    { id: 3, prop: 'Covered Parking' },
  ];

  ngOnInit() {
    this.vendorId = this.authService.currentUserValue?.id || '';

    this.form = this.fb.group(
      {
        locationName: new FormControl('', {
          validators: [
            Validators.required,
            Validators.minLength(5),
            noAllSpacesValidator,
            Validators.pattern(/^[A-Za-z][A-Za-z0-9\s]*$/),
          ],
          asyncValidators: [uniqueLocationNameValidator(this.locationService)],
        }),
        geo: this.fb.group({
          type: ['Point'],
          coordinates: this.fb.array([
            [null, [Validators.required, Validators.min(-90), Validators.max(90)]],
            [null, [Validators.required, Validators.min(-180), Validators.max(180)]],
          ]),
        }),
        operationalDays: this.fb.array([], [minSelectedValidator(1)]),
        operationalHours: this.fb.group({
          start: ['', Validators.required],
          end: ['', Validators.required],
        }),
        capacity: this.fb.group({
          twoWheeler: ['', [Validators.required, Validators.min(0)]],
          fourWheeler: ['', [Validators.required, Validators.min(0)]],
        }),
        bikePrice: ['', [Validators.required, Validators.min(0)]],
        carPrice: ['', [Validators.required, Validators.min(0)]],
        amenities: this.fb.array([], [minSelectedValidator(1)]),
        gstDocument: [null, Validators.required],
        vendorId: [''], 
      },
      { validators: timeRangeValidator }
    );

    this.operationalDays.forEach(() => {
      (this.form.get('operationalDays') as FormArray).push(
        new FormControl(false)
      );
    });

    this.amenities.forEach(() => {
      (this.form.get('amenities') as FormArray).push(new FormControl(false));
    });
  }

  get operationalDaysArray(): FormArray {
    return this.form.get('operationalDays') as FormArray;
  }

  get amenitiesDetailsArray(): FormArray {
    return this.form.get('amenities') as FormArray;
  }

  onDayChange() {
    this.operationalDaysArray.markAsTouched();
  }

  onAmenityChange() {
    this.amenitiesDetailsArray.markAsTouched();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    this.gstFileError = null;
    const fileCtrl = this.form.get('gstDocument');

    if (!input.files || input.files.length === 0) {
      this.gstFile = null;
      fileCtrl?.setValue(null);
      fileCtrl?.markAsTouched();
      return;
    }

    const file = input.files[0];
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    const maxSize = 5 * 1024 * 1024; // 5 MB

    if (!allowedTypes.includes(file.type)) {
      this.gstFileError = 'Only PDF, JPG, or PNG files are allowed.';
      this.gstFile = null;
      fileCtrl?.setValue(null);
      return;
    }

    if (file.size > maxSize) {
      this.gstFileError = 'File size must be under 5 MB.';
      this.gstFile = null;
      fileCtrl?.setValue(null);
      return;
    }

    this.gstFile = file;
    fileCtrl?.setValue(file);
    fileCtrl?.markAsTouched();
  }

  onSubmit() {
    if (this.form.invalid || this.isSubmitting) return;

    this.isSubmitting = true;
    this.submitError = false;

    // Upload GST file -> payload -> post
    this.locationService
      .uploadGstDocument(this.gstFile!)
      .pipe(
        switchMap((uploadRes) => {
          const locationData = this.locationService.buildLocationData(
            this.form.value,
            this.vendorId,
            this.operationalDays,
            this.operationalDaysArray.controls.map((c) => c.value),
            this.amenities,
            this.amenitiesDetailsArray.controls.map((c) => c.value),
            uploadRes.url,
          );
          return this.locationService.postLocation(locationData);
        })
      )
      .subscribe({
        next: () => {
          this.isSubmitting = false;
          this.router.navigateByUrl('/vendor/dashboard');
        },
        error: () => {
          this.isSubmitting = false;
          this.submitError = true;
        },
      });
  }

  async getCurrentLocation() {
    if (!navigator.geolocation) {
      await this.modalService.confirm({
        title: 'Not Supported',
        message: 'Geolocation is not supported in your browser.',
        confirmText: 'OK',
      });
      return;
    }

    this.isFetchingLocation = true;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const long = parseFloat(position.coords.longitude.toFixed(4));
        const lat = parseFloat(position.coords.latitude.toFixed(4));

        const cordsArray = this.form.get('geo.coordinates') as FormArray;
        cordsArray.at(0).setValue(long);
        cordsArray.at(1).setValue(lat);
        this.isFetchingLocation = false;
      },
      async () => {
        this.isFetchingLocation = false;
        await this.modalService.confirm({
          title: 'Location Error',
          message:
            'Unable to fetch location. Please allow location access and try again.',
          confirmText: 'OK',
        });
      }
    );
  }

  async goBack() {
    const confirm = await this.modalService.confirm({
      title: 'Are You Sure ? ',
      message: 'Your Progress will be lost if you go back',
      confirmText: 'OK',
    });
    if (confirm) {
      this.router.navigateByUrl('/vendor/dashboard');
    }
  }
}