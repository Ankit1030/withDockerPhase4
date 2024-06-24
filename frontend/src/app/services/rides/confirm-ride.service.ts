import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AssignDriver, Ride, getAllDrivers } from '../../components/rides/confirmed-ride/confirmed-ride.component';
import { env } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class ConfirmRideService {
  private mybackendUrl = env.backendUrl;
  get backendUrl(): string {
    return this.mybackendUrl;
  }
  serverurl:string = this.mybackendUrl+'/rides';

  constructor(private http:HttpClient) {

   }
   getAllStatus(){
    return this.http.post(`${this.serverurl}/getAllConfirmedRideStatus`,{})
  }
   getAllRides(data:any){
    return this.http.post<Ride>(this.serverurl+'/getfilteredRides',data)
   }


   getAllfreeDrivers(url:string,data:getAllDrivers){
    return this.http.post(this.serverurl+url,data)
   }
   getAssignSpecificDriver(url:string,data:AssignDriver){
    return this.http.post(this.serverurl+url,data)

   }


   assignNearestDriver(url:string,rideId:string){
    return this.http.post(this.serverurl+url, {rideid:rideId})
   }
}
