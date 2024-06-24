import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { tap } from 'rxjs';
import { RideDetails } from '../../components/rides/create-ride/create-ride.component';
import { env } from '../../../environments/environment.development';

interface ApiResponse {
  success: boolean;
  data: any[];
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class CreaterideService {
  private backendUrl = env.backendUrl;

  serverurl:string = this.backendUrl+'/rides';

  constructor(private http:HttpClient) {

   }

   getCallCodes(url:string){
    return this.http.get<ApiResponse>(this.serverurl+url)
  }
  
  isUser(url:string,countryid:string,phonenumber:string){
    return this.http.post(this.serverurl+url,{countryid:countryid, phone: phonenumber})
    
  }
  
  getPricingData(url:string, cityid:string){
     return this.http.post(this.serverurl+url,{id:cityid})
   }

  booknewRide(url:string,data:RideDetails){
    return this.http.post(this.serverurl+url,data)
  }

  isLocationInsideZone(url:string, data:{lat:number,lng:number}){
    return this.http.post(this.serverurl+url,data)
  }

}
