import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { env } from '../../../environments/environment.development';


@Injectable({
  providedIn: 'root'
})
export class RidehistoryService {
  private backendUrl:string = env.backendUrl;

  serverurl:string = this.backendUrl+'/rides/';
  constructor(private http:HttpClient) { }

  getAllStatus(data:any){
    return this.http.post(this.serverurl+'/getfilteredRidesHistory',data)
  }

  submitFeedbackform(data:any){
    return this.http.post(this.serverurl+'/feedbackForm',data)
  }
}
