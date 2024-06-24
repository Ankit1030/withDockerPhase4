import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PricingForm  } from '../components/Pricing/vehicle-pricing/vehicle-pricing.component';
import { EditPricingForm  } from '../components/Pricing/vehicle-pricing/vehicle-pricing.component';
import { env } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class GetdataService {
  private backendUrl = env.backendUrl;
 
  constructor(private http:HttpClient) { }
   serverurl:string = this.backendUrl;
   countrynewserverurl:string = this.backendUrl+'/country';
   vehiclenewserverurl:string = this.backendUrl+'/vehicles/';

   //to get all Vehicles on component load
   getAllVehicles(){
    const geturl  = this.serverurl+'getvname'
    const newgeturl  = this.vehiclenewserverurl+'get_all_vehicles'
    // return this.http.post(geturl,{});
    return this.http.get(newgeturl);
  }

  // To get searched OR all countries 
  getcountry(searchterm:{}){
    const geturl  = this.countrynewserverurl+'/get_country'
    const data = this.http.post(geturl,searchterm);
    return data;
  }

  //Get allcitiesname after selecting country
  get_cities(countryid:string){
    return this.http.post(this.backendUrl+'/city/get_selected_cities', {_id: countryid})
  }

  // Save new City zone or Update the zone 
  saveCityZone(citydata:any){
    return this.http.post(this.backendUrl+'/city/save_zone', citydata)
  }
  
  // Verify the user searched city is allready exist in DB
  checkExistingCity(cityname: { city: string }){
    return this.http.post(this.backendUrl+'/city/check_existing_city', cityname)
  }

  getZonedCountries(){
    return this.http.post(this.backendUrl+'/vehiclepricing/get_zoned_country',{})
  }
  
  getAllreadyAddedPricingTable(){
    // this.http.post<any>(this.backendUrl+'/all_pricing_table', data)
    return this.http.get(this.backendUrl+'/vehiclepricing/get_pricing_table')
    
  }
  
  saveNewVehiclePricing(data:PricingForm){
    return this.http.post(this.backendUrl+'/vehiclepricing/save_new_pricing',data)
  }
  
  getRemainingVehiclesforPricing(city : string){
    return this.http.post(this.backendUrl+'/vehiclepricing/get_remaining_vehicles',{cityid:city})
  }
  
  updateVehiclePricing(data:EditPricingForm){
    console.log('serdata',data);

    
    return this.http.post(this.backendUrl+'/vehiclepricing/update_pricing',data)
    
  }
}
