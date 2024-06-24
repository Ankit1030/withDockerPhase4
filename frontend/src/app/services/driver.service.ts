import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { env } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class DriverService {

  constructor(private http:HttpClient) { }
  private mybackendUrl = env.backendUrl;
  get backendUrl(): string {
    return this.mybackendUrl;
  }
   newserverurl = `${this.backendUrl}/drivers/`
// 1 get_allusers  Usecase = [onpageload, search , sort , next , prev]
  get_alldriver(data:any){
    return this.http.post(`${this.newserverurl}get_drivers`,data)
  }
  
  //2 To save New User data
  saveDriver(data:FormData){
    return this.http.post(`${this.newserverurl}save_driver`,data)
    
  }
  
  updateDriver(data:FormData){
    return this.http.post(`${this.newserverurl}update_driver`,data)
    
  }
  
  deleteDriver(id:string){
    return this.http.post(`${this.newserverurl}delete_driver`,{_id:id})
  }

  addBankAccount(customerId:string,tokenId:string){
    return this.http.post(`${this.newserverurl}addBankAccount`,{customerid:customerId,tokenid:tokenId})
  }
}
