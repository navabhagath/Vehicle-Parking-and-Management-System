import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ModalService } from '../../shared/modal/modal.service';
 
export const permissionGuard = (permission: string): CanActivateFn => {
  return async () => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const modalService = inject(ModalService);
    const user = authService.currentUserValue;
 
    if (!user) {
      return router.createUrlTree(['/']);
    }
 
    if (authService.hasPermission(permission)) {
      return true;
    }
 
   
    await modalService.confirm({
      title: 'Permission Required',
      message: "You don't have access to this feature. Please contact your administrator if you believe this is a mistake.",
      confirmText: 'OK',
      showCancel: false,
    });
 
    if (user.role === 'VENDOR') return router.createUrlTree(['/vendor/dashboard']);
    if (user.role === 'SUPER_ADMIN') return router.createUrlTree(['/super_admin/dashboard']);
    return router.createUrlTree(['/customer/dashboard']);
  };
};
 