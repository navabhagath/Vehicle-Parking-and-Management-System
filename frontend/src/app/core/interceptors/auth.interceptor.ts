import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  const isAuthEndpoint = !req.url.includes('/api/');

  const authReq =
    token && !isAuthEndpoint
      ? req.clone({
          setHeaders: { Authorization: `Bearer ${token}` },
        })
      : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !isAuthEndpoint) {
        authService.forceLogout();
      }

      if (
        error.status === 403 &&
        error.error?.code === 'ACCOUNT_SUSPENDED' &&
        !isAuthEndpoint
      ) {
        authService.forceLogout();
      }

      return throwError(() => error);
    }),
  );
};
