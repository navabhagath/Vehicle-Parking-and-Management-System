import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { UserDao } from '../../../features/vendor/vendor-login/user.dao';
@Component({
  selector: 'app-customer-rename',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './customer-rename.component.html',
  styleUrl: './customer-rename.component.scss'
})
export class CustomerRenameComponent {
    private authService = inject(AuthService);
  private userDao = inject(UserDao);
  private router = inject(Router);

  nameControl = new FormControl('', [
    Validators.required,
    Validators.minLength(4),
    Validators.maxLength(30),
    Validators.pattern('^[a-zA-Z][a-zA-Z0-9 _]*$')
  ]);

  isLoading = false;
  errorMessage = '';

  onSubmit() {
    if (this.nameControl.invalid) return;

    const user = this.authService.currentUserValue;
    if (!user) {
      this.router.navigate(['/customer/login']);
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const trimmedName = this.nameControl.value!.trim();

    this.userDao.updateUserName(trimmedName).subscribe({
  next: (res) => {
    // Use the user object the backend sends back — it's the source of truth
    this.authService.updateCurrentUser(res.user);
    this.isLoading = false;
    this.router.navigate(['customer', 'dashboard']);
  },
  error: () => {
    this.errorMessage = 'Failed to save your name. Please try again.';
    this.isLoading = false;
  },
});
  }
}
