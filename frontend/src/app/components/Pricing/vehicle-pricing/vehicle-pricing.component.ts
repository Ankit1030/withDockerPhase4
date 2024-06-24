import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { GetdataService } from '../../../services/getdata.service';
import { TemplateBindingParseResult } from '@angular/compiler';
import { log } from 'console';

export interface PricingForm {
  countryid: string;
  cityid: string;
  vehicleid: string;
  driverProfit: number;
  minFare: number;
  distanceBasePrice: number;
  basePrice: number;
  pricePerUnitDistance: number;
  pricePerUnitTime: number;
  maxSpace: number;
}
export interface EditPricingForm {
  _id:string;
  driverProfit: number;
  minFare: number;
  distanceBasePrice: number;
  basePrice: number;
  pricePerUnitDistance: number;
  pricePerUnitTime: number;
  maxSpace: number;
}

@Component({
  selector: 'app-vehicle-pricing',
  standalone: true,
  imports: [ReactiveFormsModule,CommonModule,FormsModule],
  templateUrl: './vehicle-pricing.component.html',
  styleUrl: './vehicle-pricing.component.css'
})
export class VehiclePricingComponent {
  pricingForm: FormGroup;
  countries:any;
  allcities:any[]=[]
  allvehicles:any;
  alldata:any[]; //from server tabledata and submit data
  updateBtnStatus:boolean=false;
  cityvalue:string;
  countryvalue:string;
  vehiclevalue:string;
  defaultcountry:string= 'Select Country'
  defaultcity:string= 'Select City'
  defaultvehicle:string = 'Select Vehicle'


  constructor(private formBuilder: FormBuilder,private http: HttpClient,
    private toaster:ToastrService,private getservice : GetdataService) { }

  ngOnInit(): void {
    this.pricingForm = this.formBuilder.group({
      countryid: ['', Validators.required],
      cityid: ['', Validators.required],
      vehicleid: ['', Validators.required],
      driverProfit: ['', [Validators.required,Validators.pattern('^(0?[1-9]|[1-9][0-9])$'),this.combineValidators()]], // Add driverProfit FormControl
      minFare: ['', Validators.required], // Add minFare FormControl
      distanceBasePrice: ['', Validators.required], // Add distanceBasePrice FormControl
      basePrice: ['', Validators.required], // Add basePrice FormControl
      pricePerUnitDistance: ['', Validators.required], // Add pricePerUnitDistance FormControl
      pricePerUnitTime: ['', Validators.required], // Add pricePerUnitTime FormControl
      maxSpace: ['2', Validators.required]
    });
    this.fetchCountries();
    this.get_pricing_table();
  }
  isValidInput(event: KeyboardEvent): boolean {
    // Get the value of the input field
    const inputValue = (event.target as HTMLInputElement).value;

    // Check if the key pressed is a dot and if there is already a dot in the input
    if (event.key === '.' && inputValue.includes('.')) {
      event.preventDefault(); // Prevent the dot from being entered
      return false;
    }

    // Allow numbers (0-9) and the first dot
    return (event.key >= '0' && event.key <= '9') || event.key === '.';
  }
  fetchCountries() {
    this.getservice.getZonedCountries()
    // this.http.get<any>('http://localhost:3000/selectedcountry')
    // this.http.post<any>('http://localhost:3000/selectedcountry',{})
    .subscribe({
      next:(res:any)=>{
        const allcountries = res.data;
        console.warn(allcountries);
        this.countries = allcountries;
        this.toaster.success('Received all countries','All_Countries')
        
        },
        error:(error:any)=>{
          
          if(error.status === 400){
            console.log("400 Error",error);
            this.toaster.warning(error.error.message,error.error)
          }
          this.toaster.error(error.error.message,'Error')
        },
        complete:()=>{
          
          console.log("COMPLETED FETCH SELECTED COUNTRIES"); 
        }
        
      });
    } 
    combineValidators() {
      return (control) => {
        const value = control.value;
        if (!/^\d+(\.\d{1,2})?$/.test(value)) { // Check if input is numeric with at most 2 digits after decimal
          return { numeric: true };
        }
        const numberValue = parseFloat(value);
        if (isNaN(numberValue) || numberValue < 0 || numberValue > 100) { // Check if number is within range
          return { invalidNumber: true };
        }
        return null;
      };
    }

onCountrySelect(){
  if(!this.pricingForm.get('countryid').valid){
    this.toaster.warning("Please select appropriate Input option")
    return
  }
  this.pricingForm.get('cityid').setValue('')
  this.pricingForm.get('vehicleid').setValue('')
  const selectedCountry_id = this.pricingForm.get('countryid').value
  console.warn('selectedcountryid is ',selectedCountry_id)
  this.get_selected_cities(selectedCountry_id);
}
get_selected_cities(selectedCountryid:string){

  this.getservice.get_cities(selectedCountryid)
  // this.http.post('http://localhost:3000/get_selected_cities',{_id:selectedCountryid})
  .subscribe({
    next:(res:any)=>{
      if(res.success===true){
        console.log('get_selected_cities RES ',res);
        if(res.data.length !== 0 ){
          this.allcities = res.data;
          this.toaster.success('Received all filtered Cites','All cities')
          return
      }else{
        this.allcities=[];
        this.toaster.error('No Zone created in this country','! Select other country')
        this.pricingForm.get('countryid').setValue('');
        this.defaultcountry= 'Select Country';
        // this.toaster.error('Please select other country','Error')
        return
      }
    }
    this.toaster.error('Server City get Error','Server Error')
  },
  error:(err:any)=>{
    console.log("get_selected_cities Error",err);
    
    this.toaster.error(err.error,'Error')
    return
    },
    complete:()=>{

    }
  })

}
selected_cityid:string;
onCitySelect(){
  if(!this.pricingForm.get('cityid').valid){
    this.toaster.warning("Please select appropriate Input option")
    return
  }
  console.log("oncity select");
  this.pricingForm.get('vehicleid').setValue('')
  this.selected_cityid = this.pricingForm.get('cityid').value
console.log('this.selected_cityid',this.selected_cityid);

  // this.get_all_vehicle()
  this.get_remaining_vehicles(this.pricingForm.get('cityid').value)
}
onVehicleSelect(){
  if(!this.pricingForm.get('vehicleid').valid){
    this.toaster.warning("Please select appropriate Input option")
    return
  }
}
editcountry:string='Kuchbhi'




//--------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------



get_remaining_vehicles(city:string){

  // const selectedCountryId = (document.getElementById('country') as HTMLSelectElement).selectedOptions[0].getAttribute('data-value');
  // console.warn(selectedCountryId);

  
  //   // this.selected_country = selectedCountryId;
  console.log("get_remaining_vehicles() is called");
  
  const selectedCity_id = this.pricingForm.get('cityid').value
  const selectedCountry_id = this.pricingForm.get('countryid').value
  // countryid : selectedCountry_id,
  const data = {
    cityid : selectedCity_id
  }
  this.getservice.getRemainingVehiclesforPricing(city)
  // this.getservice. getRemainingVehiclesforPricing(selectedCity_id)
  // this.http.post('http://localhost:3000/get_remain_vehicles',data)
  .subscribe({
    next:(res:any)=>{
      if(res.success===true){

        if(res.data.length == 0){
          this.toaster.success("This city has already added all vehicles",'No vehicles')
          return
        }
        console.log(res);
        this.allvehicles = res.data;
          console.log('Received remaining vehicles','get_remaining_vehicles')
          this.toaster.success('Received remaining vehicles','Vehicles')
          return
    }else{
      this.toaster.error('get_remaining_vehicles','Server Error')
      return
    }
  },
  error:(err:any)=>{
    console.log("get_remain_vehicl ",err);
    
    this.toaster.error('get_remaining_vehicles','SERVER ERROR')
    return
    },
    complete:()=>{

    }
  })
  // console.log(selectedCity_name+' --> '+selectedCountry_id);
  
  // console.warn([selectedCountry_name, selectedCountry_id]);
  
}





//--------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------


onSubmit(): void {
    //------------------------------------------
    this.current_country = (document.getElementById('country') as HTMLSelectElement).selectedOptions[0].getAttribute('data-value');
    this.current_city = (document.getElementById('city') as HTMLSelectElement).selectedOptions[0].getAttribute('data-value');
    this.current_vehicle = (document.getElementById('vehicletype') as HTMLSelectElement).selectedOptions[0].getAttribute('data-value');
    
  console.log('this.pricingForm-->>>',this.pricingForm.value);
  
    //------------------------------------------
    if (this.pricingForm.invalid) {
      this.pricingForm.markAllAsTouched();
      this.pricingForm.markAsDirty();
      // this.markFormGroupTouched(this.pricingForm)
      
      this.toaster.error("Please complete the all form fields","Incomplete Form")
      return;
    }
    console.warn("PRICING FORM",this.pricingForm.value)
    
    this.send_data_to_server(this.pricingForm.value)

// if(!data){ return}

}
current_country : string;
current_city : string;
current_vehicle : string;
get_pricing_table(){
    this.getservice.getAllreadyAddedPricingTable()
    // this.http.post<any>('http://localhost:3000/all_pricing_table', data)
    .subscribe({
       next:(res:any)=> {
        console.log('Response oaftern SUBMIT', res);
        console.log(res);
          if(res.success===true){
            this.alldata = res.alldata;
            return
          }
      },
      error:(err:any) => {
        console.error('Get Pricing Table Errpr', err);
        // this.toaster.error("Error saving vehicle","Submit error")
        // Handle error, e.g., display error message
      },
      complete:()=>{
        console.log("COMPLETED SENDING FORM DATA");
        
      }
});

  }
  send_data_to_server(data:any){
    this.getservice.saveNewVehiclePricing(data)
    // this.http.post<any>('http://localhost:3000/all_pricing_table', data)
    .subscribe({
       next:(res:any)=> {
        console.log('Response oaftern SUBMIT', res);
        console.log(res);
       
          if(res.success===true){
            const _id = res._id  // id recieved from response
            this.add_current_formdata(_id,false);
            this.toaster.success("Vehicle saved successfully","Submit success");
            this.Resetform()
            return
          }
      },
      error:(err:any) => {
        if (err.status === 401) {
          this.toaster.error(err.error.message, 'Duplicate');
          return
        }
        console.error('Error ONSUBMIT data:', err);
        this.toaster.error("Error saving vehicle","Submit error")
        // Handle error, e.g., display error message
      },
      complete:()=>{
        console.log("COMPLETED SENDING FORM DATA");
        
      }
});

  }
  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
  Resetform(){
    this.pricingForm.reset({countryid:'',cityid:'',vehicleid:''});  
    this.allcities = []
    this.allvehicles = []
  }

  //To add current formdata to table without refresh after submit clicked
 async add_current_formdata(id:any,update:boolean){
   
     
     const addcurrentdata = {
       "_id": id,
       "driverProfit": this.pricingForm.get('driverProfit').value,
       "minFare": this.pricingForm.get('minFare').value,
       "distanceBasePrice": this.pricingForm.get('distanceBasePrice').value,
       "basePrice": this.pricingForm.get('basePrice').value,
       "pricePerUnitDistance": this.pricingForm.get('pricePerUnitDistance').value,
       "pricePerUnitTime": this.pricingForm.get('pricePerUnitTime').value,
      "maxSpace": this.pricingForm.get('maxSpace').value,
      "countryid": this.current_country,
      "cityid": this.current_city,
      "vehicleid": this.current_vehicle
    }
    console.warn('addcurrentdata',addcurrentdata);
    await this.alldata.push(addcurrentdata)
   
    return
  }

  selectedRow:any;
  index:number; //index to updte

  //to update the current table when user edits the data
  editpricing(data:any){
    this.updateBtnStatus = true; 
    this.selectedRow = data;
    console.log("Edit pricing is clicked here");
    
  //  console.log('this.selectedVehicle',this.selectedVehicle);
  //  console.log('SLECTED IMAGE',this.selectedVehicle.vimage );
  this.pricingForm.get('countryid')?.disable();
this.pricingForm.get('cityid')?.disable();
this.pricingForm.get('vehicleid')?.disable();

  // this.pricingForm.disable({countryid:true,cityid:true,vehicleid:true})
  this.defaultcountry = this.selectedRow.countryid,
  this.defaultcity =this.selectedRow.cityid,
  this.defaultvehicle =this.selectedRow.vehicleid,
  // console.log('this.selectedRow.countryid',this.selectedRow.countryid);
  // this.pricingForm.get('countryid').setValue(this.selectedRow.countryid);
  // this.pricingForm.get('cityid').setValue(this.selectedRow.cityid);
  //  this.pricingForm.get('countryid').patchValue(this.selectedRow.countryid)
  //  this.pricingForm.get('cityid').patchValue(this.selectedRow.cityid)
  //  this.pricingForm.get('vehicleid').patchValue(this.selectedRow.vehicleid)
   this.pricingForm.patchValue({
    driverProfit: this.selectedRow.driverProfit,
    minFare: this.selectedRow.minFare,
    distanceBasePrice: this.selectedRow.distanceBasePrice,
    basePrice: this.selectedRow.basePrice,
    pricePerUnitDistance: this.selectedRow.pricePerUnitDistance,
    pricePerUnitTime: this.selectedRow.pricePerUnitTime,
   maxSpace: this.selectedRow.maxSpace,
  });
  // this.pricingForm.patchValue({ country: preselectedCountry.ccode + ' ' + preselectedCountry._id })
  this.index = this.alldata.findIndex((v:any) => v._id === data._id);
  console.warn('_id us ',this.selectedRow._id);
  
  
   console.warn("index->",this.index);

  }
  update(){


    const updateddata = {
      _id: this.selectedRow._id,
      driverProfit:this.pricingForm.get('driverProfit').value,
      minFare : this.pricingForm.get('minFare').value,
      distanceBasePrice : this.pricingForm.get('distanceBasePrice').value,
      basePrice : this.pricingForm.get('basePrice').value,
      pricePerUnitDistance : this.pricingForm.get('pricePerUnitDistance').value,
      pricePerUnitTime : this.pricingForm.get('pricePerUnitTime').value,
      maxSpace : this.pricingForm.get('maxSpace').value,

    }
    console.warn('updateddata',updateddata);

    

    this.getservice.updateVehiclePricing(updateddata)
    // this.http.post<any>('http://localhost:3000/edit_pricing_table',updateddata)
    .subscribe({
      next:(res:any)=>{
        console.log(res);
        if(res.success==='updated'){
          this.toaster.success("Pricing Updated Successfully","Success")
          this.updateBtnStatus = false; 
          this.pricingForm.get('countryid').enable();
          this.pricingForm.get('cityid').enable();
          this.pricingForm.get('vehicleid').enable();
           this.defaultcountry= 'Select Country';
            this.defaultcity= 'Select City';
            this.defaultvehicle= 'Select Vehicle';
          this.pricingForm.reset({countryid:'',cityid:'',vehicleid:''}); 

          this.update_table_data(res.updateddata)
          return
        }else{
          this.toaster.error("Failed to update data","Error")
          return
        }
        
      },
      error:(err:any)=>{
        console.log("update pricing error",err);
        
        this.toaster.error("Failed to update data","Error")

      },
      complete:()=>{
        console.log("COMPLETED UPDATE DATA REQUEST");
        
      }
    })
  

  }
  update_table_data(data:any){
    const index = this.alldata[this.index]
    index.driverProfit = data.driverProfit;
    index.minFare = data.minFare;
    index.distanceBasePrice = data.distanceBasePrice;
    index.basePrice = data.basePrice;
    index.pricePerUnitDistance = data.pricePerUnitDistance;
    index.pricePerUnitTime = data.pricePerUnitTime;
    index.maxSpace = data.maxSpace;
  }

}
