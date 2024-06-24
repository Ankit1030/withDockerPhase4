import { inject } from '@angular/core';
import { CanActivateFn, Router} from '@angular/router';
import { AuthService } from './auth-service.service';

export const authGuard: CanActivateFn = (route, state) => {
  let authService = inject(AuthService);
  let routerService = inject(Router);
  if (!authService.isLoggedIn()) {
    console.log("RETURNED FROM AUTHGUARD");
    
    routerService.navigate(['login']);
    return false;
  }
  console.log("Success FROM AUTHGUARD");
  return true;
};