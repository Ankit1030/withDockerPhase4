import { EventEmitter, Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { LoadingService_2 } from './helper' 

@Injectable({
  providedIn: 'root',
})


export class LoadingService {

  constructor(public darshan : LoadingService_2){}

  loader = false

  // public dataSubject = new BehaviorSubject<boolean>(false);
  // data$ = this.dataSubject.asObservable();

  startloading() {
    // console.log(this.loader)
    // console.log('this true')
    // this.loader = true;

    // console.log(this.loader)
    this.darshan.startloading()
    // this.dataSubject.next(true);
  }
  stoploading(){
    // console.log('this flase')
    // this.loader = false;
    this.darshan.stoploading()
    // this.dataSubject.next(false)
  }

  checkstatus(){
    return this.darshan.loader;
  }

  // mydata = new Subject<boolean>();
  // constructor() {}

  // dataemit(value:boolean){
  //   console.log("SET VALUE ",value);
    
  //   this.mydata.next(value)
  // }

  // private isLoadedSubject = new Subject<boolean>;
  // isLoaded$ = this.isLoadedSubject.asObservable();


  // startLoading(): void {
  //   console.log("START LOADING---------------------------------");
    
  //   this.isLoadedSubject.next(true);

  // }
  
  // stopLoading(): void {
  //   console.log("STOP LOADING*********************************************");
  //   this.isLoadedSubject.next(false);

  // }
}
