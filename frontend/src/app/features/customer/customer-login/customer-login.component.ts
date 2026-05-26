import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { OtpTimerService } from '../../../core/services/otp-timer.service';
import { User } from '../../../models/User.model';
import { AuthService } from '../../../core/services/auth.service';
import { ModalService } from '../../../shared/modal/modal.service';

@Component({
  selector: 'app-customer-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './customer-login.component.html',
  styleUrls: ['./customer-login.component.scss'],
})
export class CustomerLoginComponent implements OnInit, OnDestroy {
  loginForm!: FormGroup;
  errorMessage: string = '';
  isLoading: boolean = false;
  isOtpSent: boolean = false;
  isLoggedIn: boolean = false;
  loggedInUser!: User;

  private authSub?: Subscription;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private modalService: ModalService,
    public otpTimer: OtpTimerService,
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      phone: [
        '',
        [
          Validators.required,
          Validators.pattern('^[6-9]{1}[0-9]{9}$'),
          Validators.maxLength(10),
        ],
      ],
      otp: [''],
    });

    this.authSub = this.authService.currentUser$.subscribe((user) => {
      if (user && user.role === 'CUSTOMER') {
        setTimeout(() => {
          if (user.name === 'New Customer') {
            this.router.navigate(['/customer/welcome']);
          } else {
            this.router.navigate(['/customer/dashboard']);
          }
        });
      }
    });
  }

  onSubmit(): void {
    if (this.loginForm.get('phone')?.invalid) return;

    if (!this.isOtpSent) {
      this.sendOtp();
    } else {
      this.verifyLogin();
    }
  }

  private sendOtp() {
    this.isLoading = true;
    this.errorMessage = '';

    const phone = this.loginForm.get('phone')?.value;

    this.authService.requestOtp(phone).subscribe({
      next: (res: any) => {
        this.isOtpSent = true;
        this.isLoading = false;

        // Backend includes devCode only when NODE_ENV !== 'production'.
        // In real production, the OTP arrives via SMS and this modal stays silent.
        if (res?.devCode) {
          this.modalService.confirm({
            title: 'Your OTP (Dev Mode)',
            message: `Your verification code is: ${res.devCode}`,
            confirmText: 'OK',
            showCancel: false,
          });
        }

        this.loginForm
          .get('otp')
          ?.setValidators([
            Validators.required,
            Validators.pattern('^[0-9]{4}$'),
          ]);
        this.loginForm.get('otp')?.updateValueAndValidity();
        this.otpTimer.startTimer(30);
      },
      error: () => {
        this.errorMessage = 'Failed to send OTP. Please try again.';
        this.isLoading = false;
      },
    });
  }

  private verifyLogin() {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.message || 'Verification failed';
        this.isLoading = false;
        this.loginForm.get('otp')?.reset();
      },
    });
  }

  resendOtp() {
    this.isLoading = true;
    this.errorMessage = '';
    const phone = this.loginForm.get('phone')?.value;

    this.authService.requestOtp(phone).subscribe({
      next: (res: any) => {
        this.otpTimer.startTimer(30);
        this.isLoading = false;

        if (res?.devCode) {
          this.modalService.confirm({
            title: 'Your OTP (Dev Mode)',
            message: `Your verification code is: ${res.devCode}`,
            confirmText: 'OK',
            showCancel: false,
          });
        }
      },
      error: () => {
        this.errorMessage = 'Failed to resend OTP. Please try again.';
        this.isLoading = false;
      },
    });
  }

  toggleNumberChange() {
    this.isOtpSent = false;
    this.errorMessage = '';
    this.otpTimer.stopTimer();

    this.loginForm.get('otp')?.clearValidators();
    this.loginForm.get('otp')?.updateValueAndValidity();
    this.loginForm.get('otp')?.setValue('');
  }

  ngOnDestroy() {
    if (this.authSub) this.authSub.unsubscribe();
    this.otpTimer.stopTimer();
  }
}