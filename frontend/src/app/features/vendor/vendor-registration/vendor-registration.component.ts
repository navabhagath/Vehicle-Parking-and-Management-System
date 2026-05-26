import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ValidatorFn,
  AbstractControl,
  ValidationErrors,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Observable, of, map, catchError } from 'rxjs';
import { UserDao } from '../vendor-login/user.dao';
import { ModalService } from '../../../shared/modal/modal.service';

@Component({
  selector: 'app-vendor-registration',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './vendor-registration.component.html',
  styleUrls: ['./vendor-registration.component.scss'],
})
export class VendorRegistrationComponent implements OnInit {
  registrationForm!: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private userDao: UserDao,
    private router: Router,
    private modalService: ModalService,
  ) {}

  ngOnInit(): void {
    this.registrationForm = this.fb.group(
      {
        name: [
          '',
          [
            Validators.required,
            Validators.minLength(5),
            this.noNumbersValidator(),
            Validators.pattern(/^[a-zA-Z][a-zA-Z0-9 _]*$/),
          ],
        ],
        email: [
          '',
          {
            validators: [
              Validators.required,
              Validators.email,
              Validators.pattern(
                /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
              ),
            ],
            asyncValidators: [this.emailExistsValidator()],
            // updateOn: 'blur' fires the async check once on field-exit
            // rather than per keystroke. Single request per attempt.
            updateOn: 'blur',
          },
        ],
        phone: [
          '',
          {
            validators: [
              Validators.required,
              Validators.pattern('^[6-9]{1}[0-9]{9}$'),
            ],
            asyncValidators: [this.phoneExistsValidator()],
            updateOn: 'blur',
          },
        ],
        password_hash: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.pattern(
              /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$*&])[A-Za-z\d@#!]{8,}$/,
            ),
          ],
        ],
        confirmPassword: ['', [Validators.required]],
      },
      {
        validators: this.passwordMatchValidator,
      },
    );
  }

  emailExistsValidator(): (
    control: AbstractControl,
  ) => Observable<ValidationErrors | null> {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value || control.invalid) return of(null);
      return this.userDao
        .checkEmailAvailability(control.value.toLowerCase())
        .pipe(
          map((res) => (res.available ? null : { emailTaken: true })),
          // Network failure shouldn't block the user — the backend's 409
          // on submit is the real safety net.
          catchError(() => of(null)),
        );
    };
  }

  phoneExistsValidator(): (
    control: AbstractControl,
  ) => Observable<ValidationErrors | null> {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value || control.value.length !== 10) return of(null);
      return this.userDao
        .checkPhoneAvailability(control.value)
        .pipe(
          map((res) => (res.available ? null : { phoneTaken: true })),
          catchError(() => of(null)),
        );
    };
  }

  noNumbersValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;
      const hasNumbers = /[^a-zA-Z\s ]/.test(value);
      return hasNumbers ? { hasNumbers: true } : null;
    };
  }

  passwordMatchValidator(g: FormGroup) {
    const pass = g.get('password_hash')?.value;
    const confirm = g.get('confirmPassword')?.value;
    return pass === confirm ? null : { mismatch: true };
  }

  onSubmit(): void {
    if (this.registrationForm.invalid || this.isLoading) return;

    this.isLoading = true;
    this.errorMessage = '';

    const formData = this.registrationForm.value;

    // Backend expects { name, email, phone, password }. It hashes the password,
    // creates the wallet, and writes the initial revenue row atomically.
    const payload = {
      name: formData.name,
      email: formData.email.toLowerCase(),
      phone: formData.phone.toString(),
      password: formData.password_hash,
    };

    this.userDao.registerVendor(payload).subscribe({
      next: async () => {
        this.isLoading = false;
        await this.modalService.confirm({
          title: 'Registration Successful',
          message: 'Your account has been created. Please login to continue.',
          confirmText: 'Go to Login',
          showCancel: false,
        });
        this.router.navigate(['/vendor/login']);
      },
      error: (err) => {
        this.isLoading = false;
        // Backend sends 409 with a specific message for duplicate email/phone.
        this.errorMessage =
          err?.error?.message || 'Registration failed. Please try again.';
      },
    });
  }
}