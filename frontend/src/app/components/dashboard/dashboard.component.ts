import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component } from '@angular/core';
// import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterOutlet,RouterLink,RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth-service.service';
import { BnNgIdleService } from 'bn-ng-idle';
import { warn } from 'console';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LoadingService } from '../../services/loading.service';
import { Subscription } from 'rxjs';
import { LoadingService_2 } from '../../services/helper'
import { PushNotificationService } from '../../services/push-notification/push-notification.service';
import { SocketService } from '../../services/socket.service';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterOutlet,RouterLink,RouterLinkActive,CommonModule,MatProgressSpinnerModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  providers:[LoadingService]
})
export class DashboardComponent {
  notificationCount:number ;
    namber:number=0;
  notificationNumnber:number ;
  isLoaded: boolean = false ;
  private subscription: Subscription;
  constructor(public loadingService: LoadingService,private router:Router,
    private authservice: AuthService,private bnIdle: BnNgIdleService,
    private cdr: ChangeDetectorRef,
    public darshan : LoadingService_2,
    public pushNotificationService: PushNotificationService,
    private socketService: SocketService,
    ){;
  
}

NotificationCounter(){
  this.socketService.listen('NoDriverFound').subscribe({
    next:(res:any)=>{
      console.log("notificatipn---> NODRIVER number",res);

      // console.log(typeof(res));
      this.pushNotificationService.dashboardProperty$.subscribe((value:any) => {
        console.log("type od res",typeof(value));
        console.log("DASHBOARD PUSH NOTITIFICATION service is called ",value);
        this.notificationNumnber = value;
      });
      
      // this.notificationNumnber = res.counter
    }
  })
}
  ngOnInit(): void {
    this.getNotificationCount()
    this.darshan.loader = false
    // console.log(this.loadingService)
 
    // this.loadingService.data$.subscribe(data => {
    //   this.isLoaded = data;
    //   console.warn("ONInit is called--> ",data);

    // });
    
    console.log("isloaded",this.isLoaded);
    
    console.warn("Timer Started Listening");
    
    this.bnIdle.startWatching(20*20*60).subscribe((isTimedOut: boolean) => {
      if (typeof document !== 'undefined') {
        if (isTimedOut) {
          console.log("------------------------------------------------------------------------------------------------------------------------");
          this.authservice.logout();
          this.bnIdle.stopTimer();
          console.warn('session expired');
          console.log("------------------------------------------------------------------------------------------------------------------------");
        }
       
      }
    });
  }
  // ngOnDestroy(): void {
  //   console.warn("UNSUBSCRIbing the behaviour subject");
    
  //   this.subscription.unsubscribe();
  // }
  notify(body: string) {
    let data: Array<any> = [];
    data.push({
      title: 'Driver not Found',
      alertContent: 'For the Ride ' + body,
    });
    this.pushNotificationService.generateNotification(data);
  }
  Logout(){
    this.authservice.logout()

  }

  getNotificationCount(){

    this.socketService.emit('getNotification','');

    this.socketService.listen('setNotification').subscribe({next:(res:any)=>{
      console.log("COUNTER SETNOTIFICATION-->>>>>>>",res);
      this.notify('No Driver Found for the Ride')
      this.notificationNumnber = res;
    }})
  }

  startloading(){
    // this.loadingService.loader_start();
    this.loadingService.startloading();
  }
  stoploading(){
    this.loadingService.stoploading();
  }

  // isloaded : boolean= false;

}
