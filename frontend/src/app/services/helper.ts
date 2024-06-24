import { EventEmitter, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})

export class LoadingService_2 {
  loader:boolean
  ngOninit(){
    this.loader = false
  }


  startloading() {
    // console.log(this.loader)
    // console.log('this true')
    this.loader = true;

    console.log(this.loader)

    // this.dataSubject.next(true);
  }
  stoploading(){
    // console.log('this flase')
    this.loader = false;
    // this.dataSubject.next(false)
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
