import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import {AuthService} from '../core/services/auth.service';
import { ModalService } from '../shared/modal/modal.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
})
export class ResetPasswordComponent implements OnInit {
  step: 1 | 2 | 3 = 1;
  isLoading = false;
  errorMessage = '';

  emailForm!: FormGroup;
  otpForm!: FormGroup;
  passwordForm!: FormGroup;

  role = '';
  currentRoute = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private modalService: ModalService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.currentRoute = this.router.url;
    if (this.currentRoute.includes('/vendor')) this.role = 'VENDOR';
    else if (this.currentRoute.includes('/super_admin'))
      this.role = 'SUPER_ADMIN';

    this.emailForm = this.fb.group({
      email: [
        '',
        [
          Validators.required,
          Validators.pattern(
            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
          ),
        ],
      ],
    });

    this.otpForm = this.fb.group({
      otpCode: [
        '',
        [
          Validators.required,
          Validators.minLength(4),
          Validators.maxLength(4),
          Validators.pattern('^[0-9]{4}$'),
        ],
      ],
    });

    this.passwordForm = this.fb.group(
      {
        newPassword: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.pattern(
              /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[#!@])[A-Za-z\d#!@]{8,}$/,
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

  passwordMatchValidator(g: FormGroup) {
    const pass = g.get('newPassword')?.value;
    const confirm = g.get('confirmPassword')?.value;
    return pass === confirm ? null : { mismatch: true };
  }

  // Step 1: Request OTP (sent to email via Nodemailer)
  onRequestOtp() {
    if (this.emailForm.invalid) return;

    // Guard: if the user landed here from an unexpected path, role won't
    // be set and the backend would reject the request. Fail fast with a
    // clearer message.
    if (!this.role) {
      this.errorMessage = 'Unable to determine account type. Please return to the login page and try again.';
      return;
    }

    const email = this.emailForm.get('email')!.value.toLowerCase();
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.requestPasswordResetOtp(email, this.role).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.step = 2;

        // Backend includes devCode only when NODE_ENV !== 'production'.
        // In production this stays silent; the user reads the OTP from email.
        if (res?.devCode) {
          this.modalService.confirm({
            title: 'Your OTP (Dev Mode)',
            message: `Your verification code is: ${res.devCode}`,
            confirmText: 'OK',
            showCancel: false,
          });
        }
      },
      error: (err) => {
        this.isLoading = false;
        // Backend now returns 404 "No vendor/admin account found with this
        // email." which surfaces via err.message (handleHttpError in
        // AuthService extracts error.error.message).
        this.errorMessage = err.message || 'Error sending OTP.';
      },
    });
  }

  onClickBack() {
    if (this.currentRoute.includes('/vendor')) {
      this.router.navigate(['/vendor/login']);
    } else if (this.currentRoute.includes('/super_admin')) {
      this.router.navigate(['/super_admin/login']);
    } else {
      this.router.navigate(['/']);
    }
  }

  // Step 2: Verify OTP — AuthService stores the resetToken internally on success
  onVerifyOtp() {
    if (this.otpForm.invalid) return;

    const otpCode = this.otpForm.get('otpCode')!.value;
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.verifyPasswordResetOtp(otpCode).subscribe({
      next: (isValid) => {
        this.isLoading = false;
        if (isValid) {
          this.step = 3;
        } else {
          this.errorMessage = 'Invalid OTP code. Please try again.';
        }
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Verification failed. Try again.';
      },
    });
  }

  // Step 3: Update password using the resetToken AuthService is holding
  onResetPassword() {
    if (this.passwordForm.invalid) return;

    const email = this.emailForm.get('email')!.value.toLowerCase();
    const newPassword = this.passwordForm.get('newPassword')!.value;

    this.isLoading = true;
    this.errorMessage = '';

    // email arg is kept for signature compatibility; AuthService uses the
    // resetToken it stored during verifyPasswordResetOtp.
    this.authService.resetUserPassword(email, newPassword).subscribe({
      next: async () => {
        this.isLoading = false;

        await this.modalService.confirm({
          title: 'Success',
          message: 'Your password has been reset successfully.',
          confirmText: 'OK',
          showCancel: false,
        });

        const currentUrl = this.router.url;

        if (currentUrl.includes('/vendor')) {
          this.router.navigate(['/vendor/login']);
        } else if (currentUrl.includes('/super_admin')) {
          this.router.navigate(['/super_admin/login']);
        } else {
          this.router.navigate(['/']);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage =
          err?.message || 'Failed to update password. Please try again.';
      },
    });
  }
}