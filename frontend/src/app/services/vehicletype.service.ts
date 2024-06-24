import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Observable, catchError, map, throwError } from 'rxjs';
import { env } from '../../environments/environment.development';

interface newVehicleData{
  vname:string,
  vimage:File
}
interface addnewCountry{
  
    cname: string;
    ccurr: string;
    ccode: string;
    ccallcode: string;
    tzone: string;
    flag: string;
  
}
@Injectable({
  providedIn: 'root',
})
export class VehicletypeService {
  private backendUrl = env.backendUrl;

  private router = inject(Router);
  private http = inject(HttpClient);
  private originalToken: any;
  toaster = inject(ToastrService);
  constructor() {}

  loginurl = this.backendUrl;

  newserverurl = this.backendUrl+'/vehicles/';

//-------------------NEW BACKEND URL------------------------------

getAllVehiclesData(): Observable<any>{
  return this.http.get(`${this.newserverurl}get_all_vehicles`)
}

addnewVehicle(data:FormData): Observable<any>{
  return this.http.post(`${this.newserverurl}add_new_vehicles`,data)
}
updateVehicle(url: string, id: string, data: FormData): Observable<any>{
  return this.http.put(`${this.newserverurl}`+url+id,data)
}



//---------------END----NEW BACKEND URL------------------------------


  // vehicletypeadd(url: string, user: any): Observable<any> {
  //   return this.http.post(this.loginurl + url, user);
  // }

  // updateVehicle(url: string, id: string, data: any): Observable<any> {
  //   console.log('UPDAte servicde is called');
  //   console.log(this.loginurl + url + id);

  //   return this.http.put(this.loginurl + url + id, data);
  // }

  getcountryname(data: string, length: number): Observable<any> {
    const cnames = this.http.get('https://restcountries.com/v3.1/all').pipe(
      map((res: any) => {
        console.log('GET COUNTRY NAME--SERVICE---');

        return res.find(
          (item: any) =>
            item.name.common.substring(0, length).toLowerCase() ===
            data.substring(0, length).toLowerCase()
        );
        // console.log(res.name.common);
      })
    );
    return cnames;
  }

  addcountry(dataa: addnewCountry) {
    return this.http.post(this.backendUrl+'/country/add_country', dataa);
  }
}