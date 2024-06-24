import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, ViewChild, inject } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { log } from 'console';
import { ToastrService } from 'ngx-toastr';
import { GetdataService } from '../../../services/getdata.service';
declare const google: any;

interface country {
  cname: string;
  _id: string;
  ccode: string;
}
interface LatLngLiteral {
  lat: number;
  lng: number;
}
@Component({
  selector: 'app-city',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './city.component.html',
  styleUrl: './city.component.css',
})
export class CityComponent {
  cityForm: FormGroup;
  countries: country[] = [];
  map: any;
  update_status: boolean = false;
  drawingManager: any;
  selectedShape: any;
  polygon: any;
  selected_city_zone: any; //user selected zone
  selected_city_name: string;
  updated_city_name: string;
  selected_country = null;
  marker:any;
  // selected_latlng : {lat: number, lng: number};
  updated_city_zone: any;
  geometry_location: { lat: number; lng: number };
  to_update_id: string;
  // Submitbtn_status:boolean=true;
  buttonName: string = 'Add city'; // Initial button name
  isAddMode: boolean = true;
  selected_country_id: string;
  allcities: any[]=[];
  showBtn: boolean = false;
  // selected_place_id:string
  place:any;
  autocompleteCity = null;
  toaster = inject(ToastrService);

  constructor(
    private http: HttpClient,
    private router: Router,
    private formBuilder: FormBuilder,
    private getservice: GetdataService
  ) {}
  loadMap() {

    navigator.geolocation.getCurrentPosition((location) => {
      let result = location.coords;
      // console.log(result);
      const place = { lat: result.latitude, lng: result.longitude };
      this.place = place
      this.map = new google.maps.Map(
        document.getElementById('map') as HTMLElement,
        {
          zoom: 5,
          center: place,
        }
      );
    });
   
  }
  fetchCountries() {
    this.cityForm.get('mycity').disable();
      this.getservice.getcountry({}).subscribe({
        next:(res:any)=>{
          console.log(res);
          if(res.data===null){
            this.countries=[];
            return
          }
            this.countries=res.data;
            console.warn("ALL COUNTRIES RECEIVED SUCCESS")
        },
        error:(err:any)=>{
          console.log('fetchCountries',err);
          
          this.toaster.error(err.err.message,"Error")
          
          console.log("GET ALL COUNTRIES ERROR--");
          
        },
        complete:()=>{
  
        }
      })
    

    // this.getservice
    //   .getcountry({})

    //   // this.http.get<any>('http://localhost:3000/selectedcountry')
    //   // this.http.post<any>('http://localhost:3000/selectedcountry',{})
    //   .subscribe({
    //     next: (res: any) => {
    //       const allcountries = res.data;
    //       // const allcountries = res.data;
    //       console.log(allcountries);
    //       console.log('asdadssad----------------------------asdasdsad');
    //       this.countries = allcountries;
    //     },
    //     error: (err: any) => {
    //       this.toaster.error(err.error.message, 'Error');
    //     },
    //     complete: () => {
    //       console.log('COMPLETED FETCH SELECTED COUNTRIES');
    //     },
    //   });
  }

  //-------------------------------------------------------------------------------------------
  ngOnInit() {
    this.cityForm = this.formBuilder.group({
      country: ['', Validators.required],
      mycity: ['', Validators.required],
      city: [''],
    });
    this.map_init();
    this.loadMap(); //
    this.fetchCountries();
    this.cityForm.get('city').disable();
  }
  markFormGroupTouched(formGroup: FormGroup) {
    console.log(
      'markformGroup works-------------------------------------------------'
    );

    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
  toggleButtonMode() {
    this.isAddMode = !this.isAddMode;
    this.buttonName = this.isAddMode ? 'Add city' : 'Update city';
  }
  loadmap(place: any) {
    this.selected_city_name=null;
    console.log('place->>',place);
    const place_id = place.place_id;
    const lat = place.geometry.location.lat();

    const lng = place.geometry.location.lng();

    const location = {
      lat: lat,
      lng: lng,
    };
    this.geometry_location = location;
  console.log("searched gemoetry location",this.geometry_location);
  

    const cityname = place.formatted_address;
    this.selected_city_name = place.formatted_address;
    console.warn('PLACE>NAME', this.selected_city_name);

    if(this.marker){
      this.marker.setMap(null);
      this.marker = null
    }
  
    this.check_existing({ city: this.selected_city_name });

    // this.map = new google.maps.Map(document.getElementById('map'), {
    //   center: { lat: 0, lng: 0 },
    //   zoom:12
    // });
    // this.map.setCenter(this.geometry_location);
    // console.warn('place.geometry.location',place.geometry.location);

    // If existing country found then show that country
    // this.check_existing({city:this.selected_city_name}).subscribe({
    // this.http.post<any>('http://localhost:3000/cityzone',cityname ).subscribe({
    // next:(res:any)=>{
    //   console.log('SUCCESS CITY CHECK -> 6',res);
    //   if(res.success===true){
    // this.Submitbtn_status=true;
    //     if(this.buttonName==='Add city'){
    //       this.toggleButtonMode();

    //     }
    // this.Submitbtn_status=false;
    //     this.update_status=true;
    //     this.to_update_id= res.data._id;
    //     this.toaster.success('City with Map Already found','CityName')
    //     // this.map.setCenter(res.data.latlng);
    //     this.draw_existing_polygon(res.data.zone)
    //     // this.cityForm.get('country').disable()

    //   }else{
    // this.Submitbtn_status=true;
    //     if(this.buttonName==='Update city'){
    //       this.toggleButtonMode();

    //     }
    //     // this.map.setCenter(place.geometry.location);
    //     // this.buttonName = 'Add city'; // Initial button name
    //     // this.isAddMode = true;
    //     console.warn("DRAW NEW CITY POLYGON IS CALLED");

    //       this.draw_new_polygon();
    //   }

    // },
    // error:(err:any)=>{
    //   if(err.status==205){

    //     console.warn('Inernal server CIty request error',err.error );

    //   }
    //   console.log(err);

    // },
    // complete:()=>{
    //   console.log("COMPLETED GETING ALREADY EXISTED ZONE ");
    // this.Submitbtn_status=true;
    //   return

    // }
    // });
  }
  resetMap() {
    const mapElement = document.getElementById('map');
    if (mapElement) {
      // mapElement.style.display = 'none'; // Hide the map
      if (this.polygon) {
        this.polygon.setMap(null);
        this.polygon = null
      }
      this.map.setCenter(this.place)      
      this.map.setZoom(5)
      this.marker.setMap(null); /// This will affect the AUTOCOMPLETE Suggestions
      if(this.drawingManager){
        this.drawingManager.setMap(null);
      }
      this.drawingManager=null;

      this.geometry_location = null

    }
  }
  onallreadySelectCity() {
    this.cityForm.get('mycity').setValue('')
    this.selected_city_name = this.cityForm.get('city').value;
    console.log('onallreadySelectCity()', this.cityForm.get('city').value);
    if(this.marker){
      this.marker.setMap(null);
      this.marker = null
    }
    if(this.drawingManager){
      this.drawingManager.setMap(null);
    }
    this.drawingManager=null;
    this.check_existing({ city: this.cityForm.get('city').value });
  }

  map_init() {
    // ON initialization

    const cityInput = document.getElementById('city') as HTMLInputElement;

    let options = {
      // added on init
      types: ['(cities)'],
    };


    this.autocompleteCity = new google.maps.places.Autocomplete(
      cityInput,
      options
    );

    this.autocompleteCity.addListener('place_changed', () => {
      const place = this.autocompleteCity.getPlace();
      console.warn('place', place);

      if (!place.geometry) {
        console.error("No details available for input: '" + place.name + "'");
        this.toaster.error(
          'Please select city from suggestions',
          'Invalid City Input'
        );
        return;
      }

      this.cityForm.get('city').setValue('');
      this.loadmap(place);
    });
  }

  draw_new_polygon() {
    console.log('this.drawingManager->>',this.drawingManager);
    this.map.setZoom(11)

    if(!this.drawingManager){
      console.log("/////////////   ----------- NEW DRAWING MANAGER DRAWN----------------****************************************");
      
      this.drawingManager = new google.maps.drawing.DrawingManager({
        drawingMode: google.maps.drawing.OverlayType.POLYGON,
        drawingControl: true,
        drawingControlOptions: {
          position: google.maps.ControlPosition.TOP_CENTER,
          drawingModes: ['polygon'],
        },
        polygonOptions: {
          strokeColor: '#000000',
          strokeOpacity: 0.8,
        strokeWeight: 4, 
        fillColor: '#000000',
        fillOpacity: 0.4, 
        editable: true,
        draggable: true,
      },
    });
    
  }
  
  this.drawingManager.setMap(this.map); //Edit krvani baaki che
  console.log("this.drawingManager.getDrawingMode()",this.drawingManager.getDrawingMode());

    console.log('-----------------------DRAWING AREA----------------');

    
    this.drawingManager.setMap(this.map); //Edit krvani baaki che

    google.maps.event.addListener(
      this.drawingManager,
      'overlaycomplete',
      (event: any) => {
  
    
        // console.warn("");
        if (event.type == google.maps.drawing.OverlayType.POLYGON) {
          
          if (this.polygon) {
            console.log("this.polygon", this.polygon);
            this.polygon.setMap(null);
            this.polygon = null;
          }
      

          // this.selectedShape = event.overlay;
          
          // this.polygon = this.serializePolygon(event.overlay.getPath());
          // this.polygon.setEditable(true);
          // console.log();
          this.polygon = event.overlay
          console.log('event.overlay - > ',this.polygon);
          this.selected_city_zone = event.overlay.getPath().getArray()

          google.maps.event.addListener(event.overlay.getPath(), 'set_at', () => {
            console.log("SET AT ");
            
            this.onPolygonChanged(event.overlay,this.selected_city_zone);
          });
          
          google.maps.event.addListener(event.overlay.getPath(), 'insert_at', () => {
            console.log("INSERT AT ");
            this.onPolygonChanged(event.overlay,this.selected_city_zone);
          });
          
          google.maps.event.addListener(event.overlay.getPath(), 'remove_at', () => {
            console.log("REMOVE AT ");
            this.onPolygonChanged(event.overlay,this.selected_city_zone);
          });
          // this.polygon = event.overlay.getPath().getArray()
          if(this. isMarkerInsidePolygon(this.geometry_location,this.selected_city_zone) === false){
            alert("the zone is outside the City ")
            return null;
          }
      
          this.polygon.setMap(this.map);
        
        
          console.log('----------------------------------------------------');
          console.log(this.polygon);
          console.log('----------------------------------------------------');

         
          
          // this.selected_city_zone = this.polygon;
          // log
        }
      }
    );


 
  }
  serializePolygon(path: any): any[] {
    return path.getArray().map((latLng: any) => {
      return { lat: latLng.lat(), lng: latLng.lng() };
    });
  }

  post_city_data(citydata: any) {
    // this.Submitbtn_status=false;
    this.getservice.saveCityZone(citydata)
    // this.http.post<any>('http://localhost:3000/cityzone', citydata)
    .subscribe({
      next: (res: any) => {
        console.log(res);
        if (res.success === true) {
          console.warn('Sucess updated the data ');
          this.toaster.success(res.message, 'Success Zone');
        }
      },
      error: (error) => {
        if (error.status === 401) {
          console.log('DUplicate Error ');
          this.toaster.error(error.error.message, 'Server error');
          return;
        }
        this.toaster.error(error.error.message, 'Server error');
        console.error('Error sending polygon data to server:', error);
      },
      complete: () => {
        console.log('COMPLETED = sendPolygonDataToServer()');
        this.resetMap();
        // this.cityForm.reset();
        // this.cityForm.get('mycity').disable();
        // this.allcities=[];
        this.selected_city_zone = null;
        this.selected_city_name = null;
        this.update_status = false;
        this.cityForm.get('mycity').reset('');
        this.cityForm.get('city').reset('');
      },
    });
  }

  showMap() {
    const mapElement = document.getElementById('map');
    if (mapElement) {
      mapElement.style.display = 'block'; // Show the map
      // this.map=null
    }
  }

  isMarkerInsidePolygon(markerCoords: LatLngLiteral, zoneCoords: LatLngLiteral[]): boolean {
    const markerLatLng = new google.maps.LatLng(markerCoords.lat, markerCoords.lng);
    const zonePolygon = new google.maps.Polygon({
      paths: zoneCoords
    });

    return google.maps.geometry.poly.containsLocation(markerLatLng, zonePolygon);
  }

  sendPolygonDataToServer() {

    console.log('**--  >>> zone', this.selected_city_zone);
    console.log('name', this.selected_city_name);
    

    
    if (this.update_status === true && this.to_update_id) {
      console.warn('this.update_status===true && this.selected_city_name');
      if (this.updated_city_zone) {
        console.warn('UPDATED ZONE', this.updated_city_zone);
      }

      if(this. isMarkerInsidePolygon(this.geometry_location,this.updated_city_zone) === false){
        alert("the zone is outside the City ")
        return null;
      }
      
      // console.warn('UPDATED ZONE', this.updated_city_zone);
      const UpdateZoneArray = this.updated_city_zone.map((coord:any) => [coord.lng(),coord.lat()]);
      UpdateZoneArray.push(UpdateZoneArray[0])
      console.log('UpdateZoneArray--->',UpdateZoneArray);
      
      const update_data = {
        _id: this.to_update_id,
        zone: [UpdateZoneArray],
      };
      console.log('update_data ->>> ',update_data);
      
      this.post_city_data(update_data);
      this.to_update_id = null;
      // this.updated_city_zone = null

      return null;
    }

    if (this.selected_city_zone && this.selected_city_name) {
      if(this. isMarkerInsidePolygon(this.geometry_location,this.selected_city_zone) === false){
        alert("the zone is outside the City ")
        return null;
      }

      const SelectedZoneArray = this.selected_city_zone.map(coord => [coord.lng(),coord.lat()]);
      SelectedZoneArray.push(SelectedZoneArray[0])

      console.log('SelectedZoneArray-->>>',SelectedZoneArray);
      
      const city_data = {
        zone: [SelectedZoneArray],
        countryid: this.selected_country_id,
        city: this.selected_city_name,
        location: this.geometry_location,
        // place_id : 
      };
      console.warn('city_data', city_data);
      this.post_city_data(city_data);
      console.log(this.selected_city_name);
      const city = {
        city: this.selected_city_name,
      };
      console.log('CURREBT CITY ', city);
      console.log('this.allcities push', this.allcities);

      this.allcities.push(city);
      return null;
    } else {
      this.markFormGroupTouched(this.cityForm);
      return this.toaster.error('Please complete the form ', 'Empty Field');
    }
  }

  onCountrySelect() {
    const selectedValue = this.cityForm.get('country').value;
    const [ccode, id] = selectedValue.split(' ');
    this.cityForm.get('city').enable();
    this.get_selected_cities(id);
    // Now you can assign these values to separate variables
    this.selected_country = ccode;
    this.selected_country_id = id;
    console.warn(selectedValue);
    this.cityForm.get('mycity').reset('');
    this.autocompleteCity.setComponentRestrictions({
      country: this.selected_country,
    });
    this.resetMap()
    // this.geometry_location = null;
    // this.map = new google.maps.Map(document.getElementById('map'), {
    //   center: { lat: 0, lng: 0 },
    //   zoom: 12,
    // });
    // this.map.setZoom(5)

    // this.cityForm.get('country').disable()
    return;
  }

  //to verify existing data
  check_existing(cityname: { city: string }) {
    this.getservice.checkExistingCity(cityname)
    // return this.http.post<any>('http://localhost:3000/cityzone', cityname)
      .subscribe({
        next: (res: any) => {
          console.log('----------------------------------------------------------------------------');
          
          console.log('SUCCESS CITY CHECK -> 6', res);
          console.log('----------------------------------------------------------------------------');
          // Remove the polygon from the map
            if (this.polygon) {
              this.polygon.setMap(null);
              this.polygon = null
            }
            
            this.map.setZoom(11)
          if (res.success === true) {

            // this.Submitbtn_status=true;
            if (this.buttonName === 'Add city') {
              this.toggleButtonMode();
            }
            this.update_status = true;
            this.to_update_id = res.data._id;
            this.geometry_location = res.data.location;
            console.log("Allready gemoetry location",this.geometry_location);

            // this.map = new google.maps.Map(document.getElementById('map'), {
            //   center: { lat: 0, lng: 0 },
            //   zoom: 12,
            // });
            this.map.setCenter(res.data.location);
            
            // this.marker = null
            
            
            this.marker =  new google.maps.Marker({
              position: res.data.location,
              map: this.map,
              // title:cityname,
              // icon: {
                //   url: `http://maps.google.com/mapfiles/ms/icons/green-dot.png`,
                
                
              //   scaledSize: new google.maps.Size(35, 35)
              // }
              // Optional: Add a title to the marker
            });
            const geoJsonCoordinates = res.data.zone.coordinates[0];

            console.log("geoJsonCoordinates-->",geoJsonCoordinates);
            
         

            let polygonCoords = geoJsonCoordinates.map(coord => ({ lat: coord[1], lng: coord[0] }));
            polygonCoords.pop();
            console.log("--------------------------------------------------------");
            console.log("polygonCoords CONVERTED",polygonCoords);
            console.log("--------------------------------------------------------");
            
            

            this.draw_existing_polygon(polygonCoords);

            // this.toaster.success('City with Map Already found','CityName')
            // this.map.setCenter(res.data.latlng);
            // this.cityForm.get('country').disable()
          } else {
            // this.Submitbtn_status=true;
              console.log("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
              // this.marker = null
              console.log("ELSE this.geometry_location",this.geometry_location);
              
              this.map.setCenter(this.geometry_location);
              // this.map.setZoom(5)

        
              this.marker =  new google.maps.Marker({
                position: this.geometry_location,
                map: this.map,
                // title:place.formatted_address
              // Optional: Add a title to the marker
              });
          
              console.log();
              
              console.log("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");

              
            if (this.buttonName === 'Update city') {
              this.toggleButtonMode();
            }
            this.update_status = false;
            // this.map.setCenter(place.geometry.location);
            // this.buttonName = 'Add city'; // Initial button name
            // this.isAddMode = true;
            console.warn('DRAW NEW CITY POLYGON IS CALLED');
          
              // if (this.selectedShape) {
              //         // this.selectedShape.setEditable(false);
              //         this.selectedShape.setMap(null);
              //         this.selectedShape = null;
              //       }
            this.draw_new_polygon();
          }
        },
        error: (err: any) => {
          console.warn(err);
          this.toaster.error(err.message, err.statusText);
        },
        complete: () => {
          console.log('COMPLETED GETING ALREADY EXISTED ZONE ');
          // this.Submitbtn_status=true;
          // this.showMap();

          return;
        },
      });
  }

  get_selected_cities(selectedCountryid: string) {
    this.getservice.get_cities(selectedCountryid)
    // this.http
    //   .post('http://localhost:3000/get_selected_cities', {
    //     _id: selectedCountryid,
    //   })
      .subscribe({
        next: (res: any) => {
          if (res.success === true) {
            console.log(res);
            if (res.data.length !== 0) {
              this.allcities = res.data;
              console.log('this.allcities', this.allcities);
              return;
            } else {
              this.allcities = [];
              return;
            }
          }
          this.toaster.error('Server City get Error', 'Server Error');
        },
        error: (error: any) => {
          console.log('get_selected_cities error', error);
          this.toaster.error(error.statusText , error.status)
          // this.toaster.error(error, 'Server Error');
          return;
        },
        complete: () => {
          console.log('Completed get_selected_cities');
          this.cityForm.get('mycity').enable();

          // this.showMap()
        },
      });
  }

  draw_existing_polygon(data: any[]) {
    console.log('DRAWING EXISTING MAPP__>');

    const polygonCoords: any[] = data;

    this.polygon = new google.maps.Polygon({
      paths: polygonCoords,
      strokeColor: '#FF0000',
      strokeOpacity: 0.8,
      strokeWeight: 4,
      fillColor: '#FF0000',
      fillOpacity: 0.35,
      editable: true,
  
    });

    // let previous;
    this.updated_city_zone = this.polygon.getPath().getArray();
    console.log();
    
    google.maps.event.addListener(this.polygon.getPath(), 'set_at', () => {
      this.onPolygonChanged(this.polygon,this.updated_city_zone);
    });
    
    google.maps.event.addListener(this.polygon.getPath(), 'insert_at', () => {
      this.onPolygonChanged(this.polygon,this.updated_city_zone);
    
      
    });
    
    google.maps.event.addListener(this.polygon.getPath(), 'remove_at', () => {
      this.onPolygonChanged(this.polygon,this.updated_city_zone);
 
      
    });
    
    // this.map.setZoom(11)
    this.polygon.setMap(this.map);

  }
  
  onPolygonChanged(polygon:any,newpolygon:any) {
    console.log('this.newpolygon',newpolygon);
    const newPolygonCoords = polygon.getPath().getArray();
    newpolygon = newPolygonCoords;
    // if(!this. isMarkerInsidePolygon(this.geometry_location,newpolygon)){
    //   alert("the zone is outside the City ")
    //   console.log('return false onPolugonChanged');
    //   return false
    // }
    return true
    // console.log("EDITEND THE CURRENT POLYGON GOT NEW COORDINATED");
    
    
  }
  
}

//-----------------------THE END OF CODE --------------------------------------------------------------
