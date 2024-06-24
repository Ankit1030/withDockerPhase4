import { Component, ElementRef, ViewChild, inject } from '@angular/core';
import { Router} from '@angular/router';

import { Observable } from 'rxjs';
// import { Socket } from 'socket.io';
import { Socket, io } from 'socket.io-client';
import { SocketService } from '../../../services/socket.service';
import { ConfirmRideService } from '../../../services/rides/confirm-ride.service';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { log } from 'console';
import { PushNotificationService } from '../../../services/push-notification/push-notification.service';
import { RunningRequestService } from '../../../services/running-req/running-request.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GetdataService } from '../../../services/getdata.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { env } from '../../../../environments/environment.development';

// Define an interface for vehicle details

export interface VehicleDetails {
  _id: string;
  vname: string;
  vimage: string;
  __v: number;
}


export interface getAllDrivers {
  city: string;
  vehicle: string;
}
// Define an interface for user details
export interface UserDetails {
  _id: string;
  uname: string;
  uemail: string;
  uimage: string;
  ccode: string;
  uphone: string;
  __v: number;
  customerid: string;
}

export interface driverData {
  _id: string;
  profile: string;
  name: string;
  email: string;
  phone: string;
}
// Define an interface for the ride data
export interface Ride {
  ride_no:number;
  cityid: string;
  cityname: string;
  fromLocation: string;
  toLocation: string;
  waypointsLocation: string[];
  estimatedFarePrice: number;
  estimatedTime: string;
  rideDistance: number;
  bookTime: string;
  bookDate: string;
  bookDateandTime: number;
  vehicleDetails: VehicleDetails;
  userDetails: UserDetails;
  _id: string;
  callcode: string;
  ridestatus: number;
  driverDetails?: any | null | undefined;
  feedback?: any | null | undefined;
}

export interface AssignDriver {
  rideid: string;
  driverid: string;
}
export interface Vehicle {
  _id: string; // Object ID represented as a string
  vname: string; // Name of the vehicle (e.g., SUV)
  vimage: string; // Image filename of the vehicle
  __v: number; // Version number (likely for internal tracking)
}


@Component({
  selector: 'app-confirmed-ride',
  standalone: true,
  imports: [CommonModule,FormsModule,ReactiveFormsModule],
  templateUrl: './confirmed-ride.component.html',
  styleUrl: './confirmed-ride.component.css',
})


export class ConfirmedRideComponent {
  // @ViewChild('showDriverDetails') myModal: ElementRef;
  @ViewChild('closeButton') closeButton!: ElementRef;
  @ViewChild('assignButton') assignButton!: ElementRef;
  @ViewChild('statusButton') statusButton!: ElementRef;
  alldetailsofDriver: driverData[]; //Assign button click to get all drivers
  ride: Ride = null; // clicked ride details
  allRideArray: Ride[]; // on page load all rides details
  assignBtn: string = 'Assign';
  private mybackendUrl = env.backendUrl;
  get backendUrl(): string {
    return this.mybackendUrl;
  }

  allStatus:any=[
    {_id:0},
    {_id:1},
    {_id:3},
  ] ;

  constructor(
    private socketService: SocketService,
    private confirmRideService: ConfirmRideService,
    private runningRequestService: RunningRequestService,
    private toaster: ToastrService,
    private _notificationService: PushNotificationService,
    private getDataService :GetdataService,
    private router : Router,
    private http: HttpClient,
    private formBuilder: FormBuilder
  ) {
    this._notificationService.requestPermission();
  }


  filterForm: FormGroup;
  ngOnInit(): void {


    this.getAllServiceTypes();
    //- ALL EVENTS ARE BELOW
    this.addNewRide(); //After User Creates New Ride it will be added via socket 
    this.rejectRide()// Reject the single ride
    this.acceptRide()// Accept the single ride
    this.HoldRide()
    this.AssignDriverChrone()
    this.noDriverFound()//No driver found update 
    this.UpdateSpecificRow(); //after click on assign me UPDATE DRIVER NAME
    this.updateNearestDriver();
    this.updateRidestatus();
    this.filterForm = this.formBuilder.group({
      idandname: [''],
      bookDate: [''],
      ridestatus: [''],
      vehicleid: ['']
    });
    this.getAllRides(this.filterForm.value);// On Page Load API

//-- All Click event API
//1AssignCall(ride,index) method API name -> [/getAllfreeDrivers]
//2 UpdateAction(ride._id,ride.ridestatus,ride.driverDetails) API -> [/completeRide, /pickupRide, /arriveRide,/cancelRide]
//3 AssignMe(driverdetail) API to assign specific driver API -> [/assignSpecificDriver]
//4 NearestDriver(ride._id) API to update nearest TRUE API -> [/assignNearestDriver]
//5 

    // this._notificationService.requestPermission();
    // this.assignAgain();
    console.log('ON socket connection data');

  }
  allVehicles:Vehicle[];
  getAllServiceTypes(){
    this.getDataService.getAllVehicles().subscribe({
      next:(res:any)=>{
        if(res.success === true){
          this.allVehicles = res.data
        }
      },
      error:(error:any)=>{},
      complete:()=>{},
    })
  }
  Clear(){
    // if()
    this.filterForm.reset()
  
    this.getAllRides(this.filterForm.value)
  }
  onSubmit(){
    this.getAllRides(this.filterForm.value)
    // this.confirmRideService.getAllRides(this.filterForm.value).subscribe({
    // // this.http.post('http://localhost:3200/rides/getfilteredRides',this.filterData).subscribe({
    // // this.http.post('http://localhost:3200/rides/sampletesting',this.filterData).subscribe({
    //   next:(res:any)=>{
    //     console.log("Filter data",res);
        
    //     if(res.success=== true){
    //       if(res.data.length > 0){
    //         this.allRideArray = res.data
    //       }else{
    //         this.allRideArray =[]
    //         this.toaster.warning("No Matching Data Found","Warning")
    //       }
    //     }
    //   },
    //   error:(error:any)=>{
    //     console.log("Filter Ride error",error);
        
    //   },
    //   complete:()=>{},
    // })
    
  }
  //-----------------------------------------------------------------------------------------------------
  notify(body: string) {
    let data: Array<any> = [];
    data.push({
      title: 'Driver not Found',
      alertContent: 'For the Ride ' + body,
    });
    this._notificationService.generateNotification(data);
  }
  //-----------------------------------------------------------------------------------------------------
  AssignDriverChrone(){
    this.socketService.listen('AssignDriverCrone').subscribe({next:(res:any)=>{
      // const index = this.findmyIndex(res._id)
      console.log('AssignDriverCrone-->',res);
      
      this.updateButtonname(res._id,res.ridestatus,res.driverDetails)
      // if(index === -1){

      // }else{
      // }
    }})
  }
  addNewRide() {
    console.log('ETTESTING Is running----------------------------');

    this.socketService.listen('addNewRide').subscribe({
      next: (res: any) => {
        console.log(' TEST ME RESPONSE FROM SOCKET RAAJU');
        console.log('-->>>', res);
        this.allRideArray.push(res);
      },
    });
  }
  findmyIndex(dataId: string) {
    const match = this.allRideArray.findIndex((item) => {
      return item._id === dataId;
    });
    return match;
  }
  updateRidestatus() {
    this.socketService.listen('updateRideStatus').subscribe({
      next: (res: any) => {
        const index = this.findmyIndex(res._id);
        if (index === -1) {
          return;
        }
        if (res.ridestatus === 6 ||(res.ridestatus === 7)) {
          this.allRideArray.splice(index, 1);
          return;
        } else {
         
          this.allRideArray[index].ridestatus = res.ridestatus;
        }
      },
      error: (error: any) => {
        console.log('acceupdateRideStatus', error);
      },
      complete: () => {},
    });
  }
  // assignAgain() {
  //   this.socketService.listen('crone').subscribe({
  //     next: (res: any) => {
  //       console.log('assignAgain CRONE EMIT ', res);
  //       const array = res.data;
  //       array.forEach((item) => {
  //         const _id = item;
  //         const index = this.allRideArray.findIndex((item) => {
  //           console.log('Valie', _id);
  //           console.log('item.reqid', item._id);
  //           return item._id === _id;
  //         });
  //         if (index != -1) {
  //           this.notify(_id);
  //           const arr = this.allRideArray[index];
  //           arr.ridestatus = 0;
  //           arr.driverDetails = null;
  //         }
  //       });
  //     },
  //     error: (error: any) => {
  //       console.log('Error assignAgain', error);
  //     },
  //     complete: () => {},
  //   });
  // }

  AssignDriverCrone(){
    this.socketService.listen('AssignDriverCrone').subscribe({next:(res:any)=>{
      this.updateButtonname(res._id,res.ridestatus,res.driverDetails)
    }})
  }
  noDriverFound(){
    this.socketService.listen('NoDriverFound').subscribe({next:(response:any)=>{
      console.log("noDriverFound event",response);
      const res = response.data
      this._notificationService.changeDashboardProperty(response.counter);
      // const index = this.findmyIndex(res._id)
      this.updateButtonname(res._id,res.ridestatus,res.driverDetails)
    }})

  }

  HoldRide(){
    this.socketService.listen('HoldRide').subscribe({next:(res:any)=>{
      const index = this.findmyIndex(res._id)
      console.log("HOLD EVENT ",res);
     
      this.updateButtonname(res._id,res.ridestatus,res.driverDetails)
    }})
  }
  acceptRide(){
    this.socketService.listen('acceptRide').subscribe({next:(res:any)=>{
      console.log("UPDATE ride event is called");
      
      this.updateButtonname(res._id,res.ridestatus,res.driverDetails)
    }})
  }
  updateNearestDriver() {
    this.socketService.listen('crone1').subscribe({
      next: (res: any) => {
        console.log('CRONE1111!!', res);
        const data = res.data[0]
        this.updateButtonname(data._id, data.ridestatus, data.driverDetails);
      },
      error: (error: any) => {
        console.log('crone1', error);
      },
      complete: () => {},
    });
  }
  NearestDriver(rideid: string) {
    this.confirmRideService
      .assignNearestDriver('/assignNearestDriver', rideid)
      .subscribe({
        next: (res: any) => {
          console.log('AssignNearestDriver rES', res);
          if (res.success === true) {
            this.toaster.success('NEAREST ASSIGNED', 'SUCCESS');
          }
        },
        error: (error: any) => {
          console.log('/assignNearestDriver Error', error);
        },
        complete: () => {},
      });

    // this.socketService.emit("getAllfreeDrivers",senddata)

    this.clickCloseButton();
  }

  clickCloseButton() {
    // Check if the button reference exists
    if (this.closeButton) {
      console.log('CLOSE BTN CALLED');
      this.showpopup = false;
      // Access the nativeElement and trigger the click event
      this.closeButton.nativeElement.click();
    }
  }

  AssignMe(driver: any) {
    const data = driver;
    // console.log('1 data',data);
    const alldata = {
      rideid: this.ride._id,
      driverid: driver._id,
    };
    // this.socketService.emit("AssignDriver",alldata)
    this.confirmRideService
      .getAssignSpecificDriver('/assignSpecificDriver', alldata)
      .subscribe({
        next: (res: any) => {
          console.log('assignSpecificDriver RES', res);
          if (res.success === true) {
            this.toaster.success(res.message, 'Success');
          }
        },
        error: (error: any) => {
          console.log('Error assignSpecificDriver', error);
          this.toaster.error('Erro assignSpecificDriver', error);
        },
        complete: () => {},
      });
    this.showpopup = false;
  }

  updateButtonname(value: string, status: number, driver: any) {

    const index = this.findmyIndex(value)
    if(index === -1){
      return
    }
    // if (status === 0) {
    //   this.notify(value);
    // }
    console.log("THIs RIDE is ",this.allRideArray[index]);
    
    console.log('INDEX', index, 'name', status, 'driver', driver);

    this.allRideArray[index].ridestatus = status;
// if(driver){

  this.allRideArray[index].driverDetails = driver;
  // }
    console.log('ARRAY NEW afterchanged',this.allRideArray[index]);
    
  }
  getNextStatus(status: number): string {
    switch (status) {
      case 0:
        return 'bg-cancel';
      case 1:
        return 'bg-grey';
      case 2:
        return 'bg-green';
      case 3:
        return 'bg-blue';
      case 4:
        return 'bg-orange';
      case 5:
        return 'bg-success';
      default:
        return 'bg-default';
    }
  }
  getBackgroundClass(status: number): string {
    switch (status) {
      case 0:
        return 'bg-yellow';
      case 1:
        return 'bg-assigning';
      case 2:
        return 'bg-blue';
      case 3:
        return 'bg-green';
      case 4:
        return 'bg-pink';
      case 5:
        return 'bg-grey';
      default:
        return 'bg-default';
    }
  }
  // Assign Nearest all drivers
  UpdateSpecificRow() { // to show the driver name 
    this.socketService.listen('getcurrentRunningRequest').subscribe({
      next: (res: any) => {
        console.log('11 UpdateSpecificRow() res', res);
        this.updateButtonname(res._id, res.ridestatus, res.driverDetails);
        this.clickCloseButton();
      },
      error: (error: any) => {
        console.log('Error getcurrentRunningRequest', error);
      },
      complete: () => {},
    });
  }

  showpopup: boolean = false;

  // Click Assign button  EMIT-> "getAllfreeDrivers" LISTEN-> "receiveAllfreeDrivers"
  AssignCall(data: Ride, index: number) {
    // const modalElement: any = this.myModal.nativeElement;
    // $(modalElement).modal('show');

    console.log('FFFFFFFFFF', this.allRideArray[index]);

    if (this.allRideArray[index].ridestatus !== 0) {
      console.log(
        '---------AAAAAAAAAAAA----------------------CLOSE BTN CONDITION IS TRUE-------------------------------'
      );

      return;
    } else {
      this.showpopup = true;
    }

    console.log('AssignCall', data);
    this.ride = data;
    const senddata = { city: data.cityid, vehicle: data.vehicleDetails._id };

    this.confirmRideService
      .getAllfreeDrivers('/getAllfreeDrivers', senddata)
      .subscribe({
        next: (res: any) => {
          console.log('getAllfreeDrivers RESPONSE', res);
          if (res.success === true) {
            this.alldetailsofDriver = res.data;
            this.toaster.success(res.message, 'Success');
          } else {
            this.clickCloseButton();

            this.toaster.error(res.message, 'Failure');
          }
        },
        error: (error: any) => {
          console.log('getAllfreeDrivers Error', error);
        },
        complete: () => {},
      });
  }

   compareObjects(obj1: { [key: string]: any }, obj2: { [key: string]: any }): boolean {
    const keys1 = Object.keys(obj1);
  // Check if all key-value pairs are the same
    for (const key of keys1) {
      if (obj1[key] !== obj2[key]) {
        return false;
      }
    }
  
    return true;
  }

  // On Component load all Rides Table details
  getAllRides(data:any) {
    // this.confirmRideService.getAllRides('/getfilteredRides').subscribe({
    this.confirmRideService.getAllRides(data).subscribe({
      next: (res: any) => {
        console.log('getfilteredRides', res);
        if (res.success === true) {
        

          if(res.data.length > 0){
            this.allRideArray = res.data
          }else{
            if(this.filterForm.pristine){
              return
            }
            // this.allRideArray =[]
            this.toaster.warning("No Matching Data Found","Warning")
          }
          // this.allRideArray = res.data;
          // console.log('this.allRideArray', this.allRideArray);
        }
      },
      error: (error: any) => {
        console.log('getfilteredRides', error);
      },
      complete: () => {},
    });
  }

  


  InfoModalData(ride:any):void {
    // event.stopPropagation();
    this.ride = ride;
  }

  UpdateAction(rideid: string, ridestatus: number, driver: any) { //API to update the RIDE status
    // event.stopPropagation();
    let result: string = null;
    console.log('ridestatus to update->', ridestatus);
    let driverid:string='';

    switch (ridestatus) {
      case 0:
        result = 'cancel';
        break;
      case 3:
        result = 'arrive';
        driverid = driver._id;
        break;

      case 4:
        result = 'pickup';
        driverid = driver._id;

        break;

      case 5:
        result = 'complete';
        driverid = driver._id;

        break;
    }
    
 if(ridestatus == 0){
  let confirmation = confirm('Are you sure You want to cancel this Ride : '+rideid);
    if(!confirmation){
      return
    }
 }
    console.log('driver-->>>', driverid);
    if (result === null) {
      console.warn('RETURNED DUE TO INVALID CLICKK------------');
      return;
    }
    console.log("CANCEL--->>>>RIDEID",rideid, "DRIVERID",driverid,"RESULT",result);
    
    this.updateStatus(result,rideid,driverid)
   
  }

  updateStatus(apiPreName:string,rideid:string,driverid:string){ //submethod to call Service required inside UpdateAction
    this.runningRequestService
    .acceptThisRequest('/' + apiPreName + 'Ride', rideid, driverid)
    .subscribe({
      next: (res: any) => {
        console.log('COMPLETE PAYMENT REQUEST RES', res);
        if (res.success === true  && res.data) {
          // if(res.data.userPayment){

            if(res.data.userPayment.status === 2   ){
              // window.open(res.data.userPayment.link, '_blank');
              window.location.replace(res.data?.userPayment.link);
            }else if(res.data?.userPayment.status  && res.data?.driverPayment.status){
              this.toaster.success(res.message, 'Success');
              // this.router.navigate(['ride-history']);
              this.router.navigate(['dashboard/ride-history']);
          }else{
            if(res.data?.userPayment.status === 3 ){
              this.toaster.error("Payment Failed To Debit from User", 'Error');
            }else if(res.data?.driverPayment.status == 3){
              this.toaster.error("Payment Failed To Driver", 'Error');

            }
          }
        // }
        // this.toaster.success(res.message, 'Error');
        } else if(res.success == false ) {
          this.toaster.error(res.message, 'Error');
        }
      },
      error: (error: any) => {
        console.log('acceptThisRequest Error', error);
        this.toaster.error('FAILED TO ACCEPT RIDE error', 'Error');
      },
      complete: () => {},
    });
  }
  rejectRide(){
    this.socketService.listen('rejectRide').subscribe({next:(res:any)=>{
      const index = this.findmyIndex(res)
      console.log("rejectRide res-->>>",res);
      
      this.updateButtonname(res._id,res.ridestatus,res.driverDetails)
    }})
  }

}
