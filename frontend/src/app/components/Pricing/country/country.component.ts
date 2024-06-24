import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { log } from 'console';
import { Observable } from 'rxjs';
import { VehicletypeService } from '../../../services/vehicletype.service';
import { match } from 'assert';
import { ToastrService } from 'ngx-toastr';
// import { noWhitespaceValidator } from '../vehicle-type/vehicle-type.component';
import { GetdataService } from '../../../services/getdata.service';
// import { ModalDirective } from 'ngx-bootstrap/modal';


interface Country {
  countryName: string;
  currency: string;
  countryCode: string;
  countryCallingCode: string;
}

@Component({
  selector: 'app-country',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule,FormsModule],
  templateUrl: './country.component.html',
  styleUrl: './country.component.css',
})
export class CountryComponent {
  countryfieldstatus:boolean;
  countryForm: FormGroup;
  selectedCountry: Country; // To store the selected country data
  savecountrydisable:boolean=true;
  searchedcountryData: any;
  disable:boolean=true;

  constructor(private fb: FormBuilder,private vs : VehicletypeService,
    private toaster:ToastrService,private getservice : GetdataService,
  
  
    ) { }
  cname:string;
  previousSearchValue:string;
  ngOnInit() {
    

    this.countryForm = this.fb.group({
      countryName: ['', [Validators.required]],
      currency: [''],
      countryCode: [''],
      countryCallingCode: [''],
    });
    
    this.disableFormControls()
    // this.countryForm.get('currency').disable();
    // this.countryForm.get('countryCode').disable();
    // this.countryForm.get('countryCallingCode').disable();
    this.getAllcountry({sterm:''});
  }

disableFormControls() {
  Object.keys(this.countryForm.controls).forEach(controlName => {
    this.countryForm.get(controlName).disable();
  });
}
  openform(){
    this.countryForm.reset();
    this.countryForm.get('countryName').enable();
  }

        searchdata(){
          console.log("------------ KEY PRESS --------------------------------------------------------");
          
          this.cname = this.countryForm.get('countryName').value.trim();
          console.log(this.cname);
          const len= this.cname.trim().length
          if(len>0){

            try {
              
              this.vs.getcountryname(this.cname,len).subscribe({
              next:(res:any)=>{

                if(res){
                  this.flag = res.flags.png;
                  this.tzone = res.timezones[0];

                  const data = res
                  console.log(res);
                
                  
                  //  console.log(data);
                  
                  //To get Country name
                  const cname = data.name.common
                  //To get the currency name
                  const currency = Object.keys(data.currencies)[0];
                  // console.log("First key:", currency);
                  
                  //calling code 
                  let callingcode;
                  if(data.idd.suffixes.length===1){
                   callingcode  = data.idd.root+data.idd.suffixes[0];
                  }
                  else{
                   callingcode  = data.idd.root;
                  }
                  console.log(callingcode);
                  
                  //country code
          const code = data.cca2
          ;
          // console.log(code);
          this.searchedcountryData = {
            countryName: cname,
            currency: currency,
            countryCode: code,
            countryCallingCode: callingcode,
          }
          this.countryForm.setValue(this.searchedcountryData);
          this.countryForm.get('countryName').disable();
          this.disablesearchbtn=true;
          this.savecountrydisable= false;
          console.log(this.countryForm);
          this.toaster.success('Country Found ','Success')
        }else{
          this.toaster.error('No Matching Country Found','! invalid Name') 
        }
        
      },
      error:(err)=>{
        
        this.toaster.error('Search server Error','!Server error') 
        
        
      },
      complete:()=>{
        console.log("COMPLETED  GETCOUNTRY ROUTE");
        // console.log(this.countryForm);
        
      }
    })
  } catch (error) {
    console.log("CATCH", error);
  }
}else{
  // this.disablesearchbtn=true;
  return
}
}
//--------------------------------------------------------------------------
disablesearchbtn:boolean=true;
// searchbtnstatus(){
//   const value = this.countryForm.get('countryName').value.trim().trim();
//   if(value.length >> 0){
//   this.disablesearchbtn=false
// }else{
//   this.disablesearchbtn=true
// }
// }
clearform(){

  this.countryForm.reset();
  this.countryForm.get('countryName').enable();
  this.savecountrydisable=true;
    }
    previousValue:string;
    searchfield(){
      // if(this.countryForm.get('countryName')){
      console.log("Searchfield----");
   
      if(this.countryForm.get('countryName').value){
        console.log("SOMETHING ENTERED --*-***-**-");
        this.disablesearchbtn=false;
        var value = this.countryForm.get('countryName').value.trim();
        
        
        if(value.length == 0)  {
          this.disablesearchbtn=true
          console.log('value.length == 0');
          
          return
        } ;
        
        if(value.length >> 0){ 
          if (this.previousValue !== value) {
            console.log("CHANGE-- IF--");
            this.disablesearchbtn=false;
            // console.log('User input has changed from:', this.previousValue, 'to:', value);
            this.previousValue = value;
            return
          }
        }
      }else{
        console.warn("No VALUE -----");
        this.disablesearchbtn=true;
      } 
    }
  
    compareObjects(obj1, obj2) {
      for (const key of Object.keys(obj1)) {
        if (obj1[key] !== obj2[key]) {
          return false;
        }
      }
      return true;
    }
  //--------------------------------------------------------------------------
  flag:string;
  tzone:string;
  onSubmit(){
    console.log('this.countryForm.value',this.countryForm.value);
    console.log('this.searchedcountryData',this.searchedcountryData);

    if(!this.compareObjects(this.countryForm.value, this.searchedcountryData)){
      console.log("inside manipulating the data-->>>>>>>>>>>>>>>>>>");
      
      this.toaster.warning("Dont manipulate the Data ","Read only data")
      this.countryForm.setValue(this.searchedcountryData);
      this.disableFormControls();
      return

    }
    
    console.log("CALLED SUBMIT-----");
    
    if(!this.countryForm.get('countryName').disabled){
      this.toaster.error('Please select the Country','Country not selected')
      return
    }
    console.log("--------INSIDE SUBMIT------------------------------");
    
    console.log('cname', this.countryForm.get('countryName').value.trim());
    console.log('ccurr', this.countryForm.get('currency').value);
    console.log('ccode', this.countryForm.get('countryCode').value);
    console.log('ccallcode', this.countryForm.get('countryCallingCode').value);
    
    console.log("--------INSIDE SUBMIT------------------------------");
    const cdata:{cname:string,ccurr:string,ccode:string,ccallcode:string,tzone:string,flag:string} = {
      cname : this.searchedcountryData.countryName,
      ccurr : this.searchedcountryData.currency,
      ccode : this.searchedcountryData.countryCode,
      ccallcode : this.searchedcountryData.countryCallingCode,
      tzone : this.tzone,
      flag:this.flag
    }
    console.log('cdata',cdata);
    

    // const formData = new FormData();
    // formData.append('cname', this.countryForm.get('countryName').value.trim());
    // formData.append('ccurr', this.countryForm.get('currency').value);
    // formData.append('ccode', this.countryForm.get('countryCode').value);
    // formData.append('ccallcode', this.countryForm.get('countryCallingCode').value);

      // Add country 
      this.vs.addcountry(cdata).subscribe({
        next:(res:any)=>{
          console.log(res);
          if(res.success===true){
            this.allcountries.push(res.data)
            this.closeModal();
            this.toaster.success('Country added Successfully to DB','Success')
          }else{
            this.toaster.error('Country not added Error','Error')
          }
        },
        error:(error:any)=>{
          console.log("Add new country Error",error);
        
          if (error.status === 409) {
            this.toaster.error(error.error.message,'Duplicate Entry')
            console.error('Country data already exists:', error.error.message);
          }else if(error.status ===500){
            this.toaster.error("Internal Server Error","Error 500")
          }
          else{
            this.toaster.error(error.message,error.statusText +' '+ error.status)
          }   
      },
      complete:()=>{
        console.log("Completed send data to addCountry");
      }
  })
  
  }
  searchvalue:string;

  
  //--------------GRID  VIEW SEARCH BUTTON-------------------------------------------------------------------------------------------------
  disOutSeabtn:boolean;
  getResult(){
    console.log("GET RESULT");
    
    const searchterm = this.searchvalue.trim().toLowerCase();

    //--------------------------------------------------------------------------
    if(searchterm.length === 0){
      console.log("null Trim no req");
      this.getAllcountry({ sterm: ''})
      return
    }  
        if (this.previousSearchValue !== searchterm) {
          console.log('this.previousSearchValue',this.previousSearchValue);
          console.log('searchterm',searchterm);
          
          
          console.log("CHANGE-- IF--");
          
          // console.log('User input has changed from:', this.previousValue, 'to:', value);
          this.previousSearchValue = searchterm;
          console.warn('NEW PREVIOUS SEARCHVALUE ', this.previousSearchValue);
          
          console.log('searchterm--',searchterm);
          // searchterm = { sterm:this.sterm.trim().toLowerCase()}
          const sdata = { sterm: searchterm}
          this.getAllcountry(sdata)
          return
        }
  }

  //---------------------------------------------------------------------------------------------------------------
  searchterm:{}={};
  allcountries:any[];
  sterm:string='';
  
  getAllcountry(searchdata:any){
   
    this.getservice.getcountry(searchdata).subscribe({
      next:(res:any)=>{
        console.log(res);
        if(res.data===null){
            this.toaster.error('No Matching result found','No result')
          this.allcountries=[];
          console.warn("Search --- COUNTRIES RECEIVED ")
          console.log(res.data);
          
        }
       
          this.allcountries=res.data;
          console.warn("ALL COUNTRIES RECEIVED SUCCESS")
        
      },
      error:(err:any)=>{
        console.log(err);
        
        console.log("GET ALL COUNTRIES ERROR--");
        
      },
      complete:()=>{

      }
    })
  }

  @ViewChild('closeButton') closeButton: ElementRef;
  closeModal() {
    if (this.closeButton && this.closeButton.nativeElement) {
      this.closeButton.nativeElement.click();
    }
  }














}

//----------GET DATA GRID VIEW------------------------
