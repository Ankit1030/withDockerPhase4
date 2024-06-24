import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth-service.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { BnNgIdleService } from 'bn-ng-idle';
import { interval } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  providers:[AuthService],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit{
  
  constructor(private router : Router,
              private authService : AuthService,
        
              ){}
  ngOnInit(): void {

  }

  toaster = inject(ToastrService)
  username = new FormControl("admin",
  [
    Validators.required,
    Validators.minLength(3), 
    Validators.maxLength(20),

  ]);
  password = new FormControl("111111",
  [
    Validators.required,
    Validators.minLength(6),
  ])
  
  loginForm = new FormGroup({
    username : this.username,
    password : this.password
  })

  login() {
    if(this.loginForm.invalid){
      this.toaster.error("Please fill username and password","! Incomplete form")
      return
    }
    const data = this.loginForm.value;
    console.log(`Login`);
    console.log(data);
    this.authService.login(data).subscribe((res) => {
        console.log(res);
        if(res.success===true){

          this.toaster.success('Tu sahi hai bro', "Success"); 
          this.router.navigate(['dashboard']);
          console.log("Dashborard route success");
        }else{
          this.toaster.error(res.message,)
        }
      },
      (err)=>{
        console.log("LOGIN ERROR",err);
        
        this.toaster.error(err.message,"! Invalid credentials")
      }
  )
}
}