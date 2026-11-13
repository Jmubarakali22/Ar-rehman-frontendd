import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state): boolean | UrlTree => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const token = localStorage.getItem('art_token');
  const user = authService.currentUser();

  // If no token or no valid user profile in storage, clear broken session and redirect to login
  if (!token || !user) {
    if (token && !user) {
      localStorage.removeItem('art_token');
      localStorage.removeItem('art_user');
    }
    return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
  }

  // Check required page permission if defined in route data
  const requiredPage = route.data?.['page'] as string;
  if (requiredPage && !authService.hasPermission(requiredPage)) {
    const target = authService.getFirstAccessibleRoute();
    const cleanUrl = state.url.split('?')[0];

    // Anti-loop protection: Never redirect to the same URL being requested
    if (cleanUrl === target || cleanUrl === `/${requiredPage}`) {
      // If user has no access to target either, logout safely to prevent locking browser
      if (!authService.hasPermission(target.replace('/', ''))) {
        authService.logout();
        return router.createUrlTree(['/login']);
      }
      return false;
    }

    return router.createUrlTree([target]);
  }

  return true;
};
