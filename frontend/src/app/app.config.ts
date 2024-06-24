  import { ApplicationConfig } from '@angular/core';
  import { provideRouter } from '@angular/router';

  import { routes } from './app.routes';
  import { provideClientHydration } from '@angular/platform-browser';
  // import { customInterceptor } from './services/custom.interceptor';
  import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
  import { provideToastr } from 'ngx-toastr';
  import { provideAnimations } from '@angular/platform-browser/animations';
// import { AuthInterceptor } from './interceptors/auth.interceptor';
import { tokenInterceptor } from './interceptors/token.interceptor';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { BnNgIdleService } from 'bn-ng-idle';
import { provideServerRendering } from '@angular/platform-server';

  
  // import { NgForm } from '@angular/forms';
  export const appConfig: ApplicationConfig = {
    providers: [provideRouter(routes), 
      provideToastr(),provideAnimations(),
      provideClientHydration(),
      provideHttpClient(withInterceptors([tokenInterceptor])), provideAnimationsAsync(),
      provideHttpClient(),
      BnNgIdleService, provideAnimationsAsync(), provideAnimationsAsync(),provideServerRendering(),provideHttpClient(withFetch())
      
    ]
  };
