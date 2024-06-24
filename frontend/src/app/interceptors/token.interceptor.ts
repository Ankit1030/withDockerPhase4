import { HttpErrorResponse, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth-service.service';
import { Router } from '@angular/router';
import { catchError, tap, throwError } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { LoadingService } from '../services/loading.service';
import { LoadingService_2 } from '../services/helper';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  
  let loadingservice = inject(LoadingService)
  let darshan = inject(LoadingService_2)

  // console.log(loadingservice.loader_start())
  // loadingservice.loader_start()
  // loadingservice.dataSubject.next(true)
  console.warn("INTERCEPTOR SERVICE ISRUNNED ");
  // loadingservice.startloading();
  
  const as = inject(AuthService);
  const router = inject(Router)
  const toaster = inject(ToastrService)
  
  const token = as.getJwtToken();
  if (req.url.endsWith('/login')) {
    loadingservice.startloading();
    console.log("Interceptor bypased due to login page");
    // loadingservice.startLoading()
    return next(req);  // Pass through without token
  }
  if(token){
    loadingservice.startloading();
    console.log("TOKEN FOUND INSIDE INTERCEPTOR");
    
    const modifiedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  
    return next(modifiedRequest).pipe(
      tap(
        event => {
          if (event instanceof HttpResponse) {
            // Perform action when response is received
            console.log("RESPONSE TOKEN INTERCEPTOR STOPLOADING");
            
            
            // loadingservice.stopLoading()
            // setTimeout(()=>{

            // })
            loadingservice.stoploading();
          }
        },
        error => {
          // Handle errors if needed
        }

      ),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          if (error.error.message === 'Unauthorized: Token expired') {
            as.logout();
            router.navigate(['/login']);
            toaster.error(error.error.message,"Error")
            return null
            
            // Handle token expiration error
            // For example, redirect the user to the login page or renew the token
          } else if (error.error.message === 'Forbidden: Invalid token') {
            as.logout();
            router.navigate(['/login']);
            toaster.error(error.error.message,"Error")
            return null

            
            // Handle invalid token error
            // For example, redirect the user to the login page or clear invalid token
          }
          
        }
        // if (error.status === 401 && error.message === ('Forbidden: Invalid token' || 'Unauthorized: Token expired')) {
        //   // Perform logout and redirect to login page
        //   console.log("-----------------------------------------------------------------EXPIRE TOKEN---------------------------");
          
        
        //   toaster.error("Token Expired please login again","Error")
        //   // loadingservice.stopLoading()
        //   // return null
          
        // }
        
        loadingservice.stoploading();
        return throwError(error);
      })
    );
    
  }else{
    router.navigate(['login'])
    console.error("TOKEN NOT FOUND")
    return throwError(new Error('Unauthorized: Missing or expired token'));
    // return null
  }
};
 