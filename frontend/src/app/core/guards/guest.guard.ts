import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const guestGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn) {
    return true;
  }

  const user = authService.currentUserValue;
  if (user?.role === 'SUPER_ADMIN') {
    return router.createUrlTree(['/super_admin/dashboard']);
  }

  if (user?.role === 'VENDOR') {
    return router.createUrlTree(['/vendor/dashboard'])
  }

  return router.createUrlTree(['/customer/dashboard']);
};
