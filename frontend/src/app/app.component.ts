import { Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth-service.service';
import { BnNgIdleService } from 'bn-ng-idle';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit,OnChanges{
  title = 'Phase03';
  constructor(private authService: AuthService) {
  }
  ngOnInit() {
   
    console.log("+++++++++++++++++++++");
    // this.authService.startInterval();
    // Call the resetIdleTimeout function of AuthService when the component initializes
    // this.startInterval();
     // Update every 1000 milliseconds (1 second)
  
  }
  ngOnChanges(changes: SimpleChanges): void {
      // console.log("On chnages event is called");
      
  }
  ngDoCheck() {
    
  }























  }
  




  

