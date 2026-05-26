import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms'; // Added ReactiveFormsModule
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
 
@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink], // Replaced FormsModule with ReactiveFormsModule
  templateUrl: './admin-login.component.html',
  styleUrl: './admin-login.component.scss'
})
export class AdminLoginComponent implements OnInit {
  errorMessage = '';
  isLoading = false;
  loginForm!: FormGroup;
 
  constructor(private auth: AuthService, private router: Router, private fb: FormBuilder) {}
 
  ngOnInit(): void {
    this.loginForm = this.fb.group({
      // Email: Required and must follow email format [cite: 18, 21]
      email: ['', [Validators.required, Validators.email]],
      // Password: Required and must be at least 6 characters [cite: 21]
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }
 
  login() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched(); // Trigger validation messages
      return;
    }
 
    this.isLoading = true;
    this.errorMessage = '';
 
    // Extract values directly from the form group
    this.auth.login({
    ...this.loginForm.value,
    expectedRole: 'SUPER_ADMIN',
  }).subscribe({
      next: (user) => {
        this.router.navigate(['/super_admin/dashboard']);
      },
      error: (err) => {
        this.errorMessage = err.message || 'An error occurred during login';
        this.isLoading = false;
      }
    });
  }
}