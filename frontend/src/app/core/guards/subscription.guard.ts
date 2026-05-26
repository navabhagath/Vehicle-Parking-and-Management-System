import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const subscriptionGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const user = authService.currentUserValue;
  if (user?.role === 'VENDOR' && user.hasPaidSubscription) {
    return true;
  }
  // Unpaid vendors are locked into the payment screen
  return router.createUrlTree(['/vendor/subscription']);
};
