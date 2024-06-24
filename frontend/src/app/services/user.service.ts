import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { env } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private backendUrl = env.backendUrl;

  constructor(private http:HttpClient) { }

  newserverurl = this.backendUrl+'/users/'
// 1 get_allusers  Usecase = [onpageload, search , sort , next , prev]
  get_allusers(data:any){
    return this.http.post(`${this.newserverurl}get_users`,data)
  }
  
  //2 To save New User data
  saveUser(data:FormData){
    return this.http.post(`${this.newserverurl}save_user`,data)
    
  }
  
  updateUser(data:FormData){
    return this.http.post(`${this.newserverurl}update_user`,data)
    
  }
  
  deleteUser(id:string){
    return this.http.post(`${this.newserverurl}delete_user`,{_id:id})
    
  }
  
  // STRIPE SERVICES STARTS -------------------------
  
  getDefaultCardDetails(id:string){
    return this.http.post(`${this.newserverurl}get_defaultcard`,{customerid:id})
  }
  
  addCardToCustomer(customerid:string,tokenid:string){
    return this.http.post(`${this.newserverurl}add_card`,{customerid: customerid,tokenid: tokenid})
  }
  
  setDefaultCard(customerid:string,cardId:string){
    return this.http.post(`${this.newserverurl}set_defaultcard`,{customerid: customerid, cardId: cardId,})
  }
  
  deleteSourceCard(customerid:string,cardId:string){
    return this.http.post(`${this.newserverurl}delete_card`,{customerid: customerid,cardid: cardId,})
  }


}
