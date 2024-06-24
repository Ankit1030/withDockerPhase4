import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth-service.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notfound',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notfound.component.html',
  styleUrl: './notfound.component.css'
})
export class NotfoundComponent {
  constructor(private router : Router,private authservice:AuthService){}


  homepage(){
    this.router.navigate(['login'])
    this.authservice.logout();
  }
}
