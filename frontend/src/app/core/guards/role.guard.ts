import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { ModalService } from '../../shared/modal/modal.service';
export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return async (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const modalService = inject(ModalService);
    const user = authService.currentUserValue;

    if (user && allowedRoles.includes(user.role)) {
      return true;
    }

    if (user) {
      await modalService.confirm({
        title: 'Access Denied',
        message: `You don't have permission to access this page. Redirecting to your dashboard.`,
        confirmText: 'OK',
        showCancel:false
      });

      if (user.role === 'VENDOR') {
        return router.createUrlTree(['/vendor/dashboard']);
      } else if (user.role === 'SUPER_ADMIN') {
        return router.createUrlTree(['/super_admin/dashboard']);
      } else if (user.role === 'CUSTOMER') {
        return router.createUrlTree(['/customer/dashboard']);
      }
    }

    return router.createUrlTree(['/']);
  };
};
