import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Socket, io } from 'socket.io-client';
import { env } from '../../environments/environment.development';


@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socketUrl = env.socketUrl;

  socket:Socket;
  uri:string = this.socketUrl ;

  constructor(){
    this.socket = io(this.uri)
    this.socket.on('connect', () => {
      console.log('---------++++-+++++++++ Socket connected successfully');
    });
  }
counter:number = 0;

ngOnInit(): void {

}


  listen(event:string):Observable<any>{
    return new Observable((subscriber)=>{
      this.socket.on( event,(data)=>{
        // console.log("SErvice data",data);
        console.log("Timer ",this.counter+1);
        subscriber.next(data);
      })
    })
   }

  emit(event:string,data:any){
    console.log("data to emit",data);
    this.socket.emit(event,data)
  }

}
