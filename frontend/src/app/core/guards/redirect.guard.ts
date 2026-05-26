import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const redirectGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const user = authService.currentUserValue;

  if (user?.role === 'VENDOR') {
    return router.createUrlTree(['/vendor/dashboard']);
  }
  if (user?.role === 'SUPER_ADMIN') {
    return router.createUrlTree(['/super_admin/dashboard']);
  }
  if (user?.role === 'CUSTOMER') {
    return router.createUrlTree(['/customer/dashboard']);
  }
  return router.createUrlTree(['/']);
};