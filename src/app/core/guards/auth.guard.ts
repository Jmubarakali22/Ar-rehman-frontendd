import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const token = localStorage.getItem('art_token');

  if (!token) {
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  // Check required page permission if defined in route data
  const requiredPage = route.data?.['page'] as string;
  if (requiredPage && !authService.hasPermission(requiredPage)) {
    router.navigate(['/dashboard']);
    return false;
  }

  return true;
};
