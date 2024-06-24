import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { env } from '../../../environments/environment.development';


@Injectable({
  providedIn: 'root'
})
export class RunningRequestService {
  private backendUrl = env.backendUrl;

  constructor(private http:HttpClient) { }
  serverurl:string = this.backendUrl+'/rides';

  getAllRunningRequests(url:string){
    const res = this.http.post(this.serverurl+url,'')
    return res;
  }
  

  rejectThisRequest(url:string,rideId:string){
    const res = this.http.post(this.serverurl+url,{rideid:rideId})
    return res;
    
  }
  acceptThisRequest(url:string,rideId:string,driverId:string){
    const res = this.http.post(this.serverurl+url,{rideid:rideId,driverid:driverId})
    return res;
  }
  // acceptThisRequest(url:string,rideId:string,driverId:string){
  //   const res = this.http.post(this.serverurl+url,{rideid:rideId,driverid:driverId})
  //   return res;
  // }
  getApprovalTime(){
    const res = this.http.post(this.serverurl+'/getApprovalTime',{})
    return res;

  }
}
