import { Component } from '@angular/core';
import { SocketService } from '../../../services/socket.service';
import { RunningRequestService } from '../../../services/running-req/running-request.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { PushNotificationService } from '../../../services/push-notification/push-notification.service';
import { env } from '../../../../environments/environment.development';

// interface Ride {
//   _id: string;
//   fromLocation: string;
//   toLocation: string;
//   waypointsLocation: any[]; // Adjust type as per actual data structure
//   bookTime: string;
//   bookDate: string;
//   bookDateandTime: number;
//   ridestatus: number;
//   driverDetails: {
//       dname: string;
//       dphone: string;
//       assign: number;
//   };
//   userDetails: {
//       uname: string;
//       uimage: string;
//       uphone: string;
//   };
//   vehicleDetails: {
//       vname: string;
//       vimage: string;
//   };
// }
interface Ride {
  _id: string; 
  // oldDriver?:string;
  fromLocation: string;
  toLocation: string;
  waypointsLocation: string[]|null; 
  bookTime: string;
  bookDate: string;
  bookDateandTime: number;
  ridestatus: number;
  driverDetails?: {
    _id: string; 
    dname: string;
    demail: string;
    dimage: string;
    servicetype: string; 
    status: boolean;
    ccode: string; 
    dcity: string; 
    dphone: string;
    assign: number;
    __v: number;
  }|null;
  userDetails: {
    _id: string; 
    uname: string;
    uemail: string;
    uimage: string;
    ccode: string; 
    uphone: string;
    __v: number;
    customerid: string;
  };
  vehicleDetails: {
    _id: string; 
    vname: string;
    vimage: string;
    __v: number;
  };
}

@Component({
  selector: 'app-running-request',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './running-request.component.html',
  styleUrl: './running-request.component.css'
})
export class RunningRequestComponent {
  allRequestsArray:Ride[];
  constructor(private socketService:SocketService, 
    private runningRequestService: RunningRequestService,
    private _notificationService: PushNotificationService,
    private toaster:ToastrService){

  }
  private mybackendUrl = env.backendUrl;
  get backendUrl(): string {
    return this.mybackendUrl;
  }
  ngOnInit(): void {
    this.rejectRide()// Reject the single ride
    this.acceptRide() //To remove
    this.noDriverFound() // To remove Ride
    this.HoldRide() //To remove Hold Ride
    this.AssignDriverChrone()// Assign new Driver ROW
    this.getcurrentRunningRequest() //Specific Driver ASsign Ride



    this.getApprovalTime()//On Page LOAD To get the Settings Timeout seconds
    this.getAllRunningRequest();//On Page LOAD
    

    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    // this.checkCrone();
    // this.nearestCrone();
    // this.updateRidestatus()
  }
  getBackgroundClass(status: number): string {
    switch (status) {
      case 0:
        return 'bg-yellow';
      case 1:
        return 'bg-orange';
      case 2:
        return 'bg-green';
      case 3:
        return 'bg-blue';
      case 4:
        return 'bg-pink';
      default:
        return 'bg-dark';
    }
  }

  AssignDriverChrone(){
    this.socketService.listen('AssignDriverCrone').subscribe({next:(res:any)=>{
      // const index = this.findmyIndex(res._id)
      console.log('AssignDriverCrone-->',res);
      const index = this.findmyIndex(res._id)
      if(index !== -1){
        this.allRequestsArray[index] = res
      }else{
        this.allRequestsArray.push(res)
      }
      // if(index === -1){

      // }else{
      // }
    }})
  }

  noDriverFound(){
    this.socketService.listen('NoDriverFound').subscribe({next:(response:any)=>{
      console.log("noDriverFound eventt",response);
      const res = response.data;
      localStorage.setItem('Notification_counter',response.counter)
      this._notificationService.changeDashboardProperty(1);

      const index = this.findmyIndex(res._id)
      if(index !== -1){
        this.allRequestsArray.splice(index,1)
      }
      
    }})

  }

  findmyIndex(dataId:string){
    const match =  this.allRequestsArray.findIndex(item => {
    
              
      return item._id === dataId ; 
    });
    return match
  }

  acceptRide(){
    this.socketService.listen('acceptRide').subscribe({next:(res:any)=>{
      const index = this.findmyIndex(res._id)
      this.allRequestsArray.splice(index,1)
    }})
  }

  HoldRide(){
    this.socketService.listen('HoldRide').subscribe({next:(res:any)=>{
      const index = this.findmyIndex(res._id)
      if(index === -1){
        return
      }
      this.allRequestsArray.splice(index,1)
    }})
  }

  getcurrentRunningRequest(){
    this.socketService.listen('getcurrentRunningRequest').subscribe({
      next:(res:any)=>{
        console.log("EMITTED getcurrentRunningRequest RES",res);
        this.allRequestsArray.push(res)
      },
      error:(error:any)=>{
        console.log('Error getcurrentRunningRequest',error);
      },
      complete:()=>{},
    })
  }

  getAllRunningRequest(){
     this.runningRequestService.getAllRunningRequests('/getAllRunningRequests').subscribe({
      next:(res:any)=>{
        console.log("response getAllRunningRequests",res);
        if(res.success===true){
          this.allRequestsArray = res.data;
          // this.toaster.success(res.message,"Success")
        }
        
      },
      error:(error:any)=>{
        console.log("Erro /getAllRunningRequests",error);
        
      },
      complete:()=>{},
     })
  }

  acceptAction(rideid:string,driverid:string,index:number){
  
    this.runningRequestService.acceptThisRequest('/acceptRide',rideid,driverid).subscribe({
      next:(res:any)=>{
          console.log("acceptThisRequest RES",res);
          if(res.success===true){
            // this.allRequestsArray.splice(index, 1);

            this.toaster.success(res.message,"Success")
          }else{
            this.toaster.error(res.message,"Error")
          }
          
        },
        error:(error:any)=>{
          console.log("acceptThisRequest Error",error);
          this.toaster.error("FAILED TO ACCEPT RIDE error","Error")
        
      },
      complete:()=>{}
    })
  }

  rejectAction(rideid:string,index:number){
    this.runningRequestService.rejectThisRequest('/rejectRequest',rideid).subscribe({
      next:(res:any)=>{
        console.log("rejectRequest RES",res);
        if(res.success === true){
          // this.toaster.success(res.message,"Success")
          // this.allRequestsArray.splice(index,1)
        }else{
          this.toaster.error(res.message,"Error")
        }
      },
      error:(error:any)=>{
        console.log("Error rejectRequest",error);
        this.toaster.error("Internal server Error","Error")
      },
      complete:()=>{},
    })

  }

  updateRidestatus(){
    this.socketService.listen('updateRideStatus').subscribe({
      next:(res:any)=>{
        console.log("updateRideStatus EVENT",res);
        
        const index = this.findmyIndex(res._id)
     
        if(res.ridestatus !== 3){
          return
        }
        else{
          this.allRequestsArray.splice(index, 1);

        }
      },
      error:(error:any)=>{
        console.log("acceupdateRideStatus",error);
      },
      complete:()=>{},
    })
  }
  Timeout:number;
  getApprovalTime(){
    this.runningRequestService.getApprovalTime().subscribe({
      next:(res:any)=>{
        if(res.success=== true){
          this.Timeout = res.data;
        }
      },
      error:(error:any)=>{
        console.log("getApprovalTime Error",error);
        
      },
      complete:()=>{}
    })
  }

  rejectRide(){
    this.socketService.listen('rejectRide').subscribe({next:(res:any)=>{
      const index = this.findmyIndex(res._id)
      this.allRequestsArray.splice(index,1)
    }})
  }
}

