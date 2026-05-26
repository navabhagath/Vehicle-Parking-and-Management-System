
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { environment } from '../../env/evironment';
import { map, catchError, of } from 'rxjs';
import { ParkingLocation } from '../../features/vendor/overview/overview.model';

export const locationOwnerGuard: CanActivateFn = (route) => {
  const http = inject(HttpClient);
  const authService = inject(AuthService);
  const router = inject(Router);

  const locationId = route.paramMap.get('id');
  const vendorId = authService.currentUserValue?.id;

  const bool = authService.currentUserValue?.hasPaidSubscription;

  if (!locationId || !vendorId) {
    router.navigateByUrl('/vendor/dashboard');
    return false;
  }

  return http.get<ParkingLocation>(`${environment.apiUrl}/vendor/parkinglocations/${locationId}`).pipe(
    map(location => {
      if (location && location.vendorId === vendorId && bool) {
        return true;
      }
      router.navigateByUrl('/vendor/dashboard');
      return false;
    }),
    catchError(() => {
      router.navigateByUrl('/vendor/dashboard');
      return of(false);
    })
  );
};