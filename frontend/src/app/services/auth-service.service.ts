import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { BehaviorSubject, Observable, catchError, tap, throwError } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { isPlatformBrowser } from '@angular/common';
import { env } from '../../environments/environment.development';


@Injectable({
  providedIn: 'root',
})
export class AuthService implements OnInit {
  private readonly JWT_TOKEN = 'JWT_TOKEN';
  private loggedUser?: string;
  private router = inject(Router);
  private http = inject(HttpClient);
  toaster = inject(ToastrService)

  constructor() {}
  private mybackendUrl = env.backendUrl;
  get backendUrl(): string {
    return this.mybackendUrl;
  }
  ngOnInit(): void {    
  }

  // loginurl = 'http://localhost:3000/login';
  newloginurl = `${this.backendUrl}/login`;

  login(user: any): Observable<any> {
    return this.http
      .post(this.newloginurl, user)
      .pipe(
        tap((res: any) =>{
         console.log("SERVER",res);
         this.doLoginUser(res.token)          
        }))
  }

  private doLoginUser( token: any) {    
    console.log("With stringify token",token);
    console.log(typeof(token));
    this.storeJwtToken(token);
  }

  private storeJwtToken(jwt: string) {
    return localStorage.setItem(this.JWT_TOKEN, jwt);
  }

 getJwtToken(): any {
  console.log("sdadadsadsa");
    return localStorage.getItem(this.JWT_TOKEN);
  }

  logout() {
    localStorage.removeItem(this.JWT_TOKEN);
    this.router.navigate(['login']);
  }

  isLoggedIn() {
    if (typeof localStorage !== 'undefined' ) {
      return !!localStorage.getItem(this.JWT_TOKEN);
    } else {
      return false;
    }
  }
}