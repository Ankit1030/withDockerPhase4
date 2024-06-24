import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CreaterideService } from '../../../services/rides/createride.service';
import { tap } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
declare var google: any;
export interface Zone {
  lat: number;
  lng: number;
  _id: string;
}
export interface latlng {
  lat: number;
  lng: number;
}
export interface RideDetails {
  userid: string;
  cityid: string;
  // fromcoords:latlng,
  // tocoords:latlng,
  // currentWaypointcoords:latlng
  // WaypointscoordsArray:latlng[]
  fromLocation: string;
  toLocation: string;
  waypointsLocation: any[string] | null;

  vehicleid: string;
  paymentType: string;
  estimatedFarePrice: number;
  estimatedTime: string; //1hr 30min
  rideDistance: number;
  rideDuration: number;
  bookTime: string;
  bookDate: string;
  bookDateandTime: number;
}

interface Country {
  countryid: {
    _id: string;
    cname: string;
    ccurr: string;
    ccode: string;
    ccallcode: string;
    tzone: string;
    flag: string;
    __v: number;
  };
}

function NumberValidator(control: FormControl): { [key: string]: any } | null {
  const value = control.value;
  if (isNaN(value)) {
    return { notANumber: true };
  }
  return null;
}

@Component({
  selector: 'app-create-ride',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './create-ride.component.html',
  styleUrl: './create-ride.component.css',
})
export class CreateRideComponent {
  @ViewChild('mapContainer', { static: false }) mapContainer: ElementRef;
  @ViewChild('fromLocationRef') fromLocationInput: ElementRef | undefined;
  @ViewChild('toLocationRef') toLocationInput: ElementRef | undefined;
  @ViewChild('waypointLocationRef') waypointLocationInput:
    | ElementRef
    | undefined;
  hasCard: boolean = false;
  directionsService: any;
  directionsRenderer: any;
  isRoute: boolean;
  waypointsArray: string[] = [];
  selectedcity: string;
  selectedfromLocation: string;
  selectedToLocation: string;
  selectedWaypointLocation: string;
  map: any;
  options: any;
  waypointsForm: FormGroup;
  items: any[] = [];
  // LocationData: Array<LocationData> = [];

  completeRideDetails: RideDetails;

  Rideform: FormGroup;
  showUserDetails: boolean = false; // after search the value is showed after response
  // showPaymentoptions:boolean = false;
  defaultcode: string; // on pageload set default country call code
  userFound: {
    // object to show searched data
    uname: string;
    uemail: string;
    uphone: string;
  };
  callCodes: Country[]; // Response from onInit call codes
  selectedCountrycode: string;
  // selectedCountrycode: string = 'IN';
  constructor(
    private fb: FormBuilder,
    private createRideService: CreaterideService,
    private toaster: ToastrService
  ) {}
  place: { lat: number; lng: number };

  loadMap() {
    navigator.geolocation.getCurrentPosition((location) => {
      let result = location.coords;
      // console.log(result);
      const place = { lat: result.latitude, lng: result.longitude };
      this.place = place;
      this.map = new google.maps.Map(
        document.getElementById('map') as HTMLElement,
        {
          zoom: 5,
          center: place,
        }
      );
    });
    this.directionsService = new google.maps.DirectionsService();
    this.directionsRenderer = new google.maps.DirectionsRenderer();
  }
  ngAfterViewInit(): void {
    this.loadMap();
    console.log('Map has STARTED--------------------------------------');

    //Called after every check of the component's view. Applies to components only.
    //Add 'implements AfterViewChecked' to the class.
  }
  selectedCurrency: string;
  // selectedCurrency:string='INR';
  currentDate: any;
  selectedDate: any;
  selectedTime: any;
  // selectedTime: any = this.defaultTime() ;
  minTime: any;
  isDateandTimeValid: boolean;
  ngOnInit(): void {
    this.waypointsForm = this.fb.group({
      from: ['', Validators.required],
      to: ['', Validators.required],
      waypoint: [''],
    });

    this.BookingrideForm = this.fb.group({
      serviceType: ['', Validators.required],
      paymentOption: ['', Validators.required],
      bookingType: ['bookNow', Validators.required],
      DateTime: [],
      // date: ['', Validators.required],
      // time: ['', [Validators.required,this.pastTimeValidator]]
    });

    this.Rideform = this.fb.group({
      callCode: ['', Validators.required],
      phoneNumber: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[1-9]{1}[0-9]{9}$/),
          NumberValidator,
        ],
      ],
      // paymentOption:['']
    });
    this.createRideService
      .getCallCodes('/call_codes')
      .pipe(
        tap((res) => {
          this.callCodes = res.data;

          console.warn('RESPONSE ', res.data);
          this.selectedCurrency = res.data[0].countryid.ccurr;
          this.selectedCountrycode = res.data[0].countryid.ccode;
          this.defaultcode = res.data[0].countryid._id;
          this.Rideform.get('callCode').setValue(this.defaultcode);

          // console.log('this.defaultcode',this.callCodes);
          console.log('this.defaultcode', this.defaultcode);
        })
      )
      .subscribe();
  }
  // ------------------------------------FORMAT DATE AND TIME----------------------------------------//
  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }
  defaultTime() {
    const hour: number = 23,
      minutes: number = 59;
    return `${hour}:${minutes}`;
  }
  formatTime(date: Date): string {
    const updatedDate = new Date(date.getTime() + 60000);
    const hours = ('0' + updatedDate.getHours()).slice(-2);
    const minutes = ('0' + updatedDate.getMinutes()).slice(-2);
    return `${hours}:${minutes}`;
  }
  invalidInput: boolean = false;

  @ViewChild('mySelect') mySelect: ElementRef;
  onchange() {
    // console.log();
    const data = this.Rideform.get('callCode').value;
    console.log('https://github.com/prashantrrai/Eber-Admin-Panel', data);
  }
  PrevHomePage() {
    this.Rideform.get('phoneNumber').reset();
    this.showUserDetails = false;
  }
  onCountrySelect(event: any) {
    console.log(this.Rideform.get('phoneNumber').value);
    console.log(this.Rideform.get('phoneNumber').value.trim().length == 10);
    console.log(
      this.Rideform.get('phoneNumber').value &&
        this.Rideform.get('phoneNumber').value.trim().length == 10
    );
    if (
      this.Rideform.get('phoneNumber').value &&
      this.Rideform.get('phoneNumber').value.trim().length == 10
    ) {
      console.log('This is inside the TRUE condition');

      const confirm1 = confirm(
        'Are you sure you want to find User Again ? Doing this you have to follow all the steps from starting again !'
      );
      if (!confirm1) {
        this.Rideform.get('callCode').setValue(this.selectedCountryId);
        return;
      } else {
        this.waypointsForm.reset();
        this.BookingrideForm.reset();
        this.showUserDetails = false;
        this.showRideDetails = false;
        this.showPricingDetails = false;
        this.directionsRenderer.setMap(null);
        console.log('this.map', this.map);
        this.map.setCenter(this.place);
        this.map.setZoom(5);
        this.toaster.warning('Please Select Phone Number Again', 'Warning');
        return;
      }
      // this.onSubmit();
    }
    // to store country code
    // this.selectedCountrycode = 'IN'
    const selectedOption = event.target.selectedOptions[0];
    const currency = selectedOption.dataset
      ? selectedOption.dataset.currency
      : selectedOption.getAttribute('data-currency');
    this.selectedCurrency = currency;
    console.log('Currency value is-->', currency);

    const dataId = selectedOption.dataset
      ? selectedOption.dataset.id
      : selectedOption.getAttribute('data-id');
    console.log('onCountrySelect', dataId);
    this.selectedCountrycode = dataId;
  }

  onKeyPress(event: KeyboardEvent) {
    const charCode = event.charCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
      this.invalidInput = true;
    } else {
      this.invalidInput = false;
    }
  }
  markFormGroupTouched(formGroup: FormGroup) {
    formGroup.markAllAsTouched();
    // Object.values(formGroup.controls).forEach((control) => {
    //   control.markAsTouched();
    //   control.markAsDirty();

    //   if (control instanceof FormGroup) {
    //     this.markFormGroupTouched(control);
    //   }
    // });
  }

  onClear() {
    this.Rideform.reset();
    this.Rideform.get('callCode').setValue(this.defaultcode);
    console.log(this.Rideform.value);
    // const selectvalue = this.Rideform.get('paymentOption').value
    // console.log('selectvalue',selectvalue);
  }
  stopCount: number;
  selectedCountryId: string;
  onSubmit() {
    this.showUserDetails = false;
    this.showRideDetails = false;
    this.showPricingDetails = false;
    this.selectedCountryId = this.Rideform.get('callCode').value;
    // console.log('country', country);
    this.markFormGroupTouched(this.Rideform);
    if (!this.Rideform.valid) {
      this.toaster.warning('Please complete the Form', 'Incomplete form');
      return null;
    }

    this.createRideService
      .isUser(
        '/is_user',
        this.selectedCountryId,
        this.Rideform.get('phoneNumber').value
      )
      .subscribe({
        next: (res: any) => {
          console.log('search result', res);
          if (res.success === true && res.data.user !== null) {
            this.toaster.success(res.message, 'Success');
            this.userFound = res.data.user;
            this.stopCount = res.data.stopCount;
            this.userid = res.data.user._id;
            this.showUserDetails = true;
            this.hasCard = res.data.hasCard;
            // this.Rideform.get('phoneNumber').disable();
            // this.LocationData = res.data.LocationData;
            // console.log('this.LocationData', this.LocationData);

            // this.autocompleteFrom.setComponentRestrictions({
            //   country: this.selectedCountrycode,
            // });
            // this.autocompleteTo.setComponentRestrictions({
            //   country: this.selectedCountrycode,
            // });
            // this.autocompleteWaypoint.setComponentRestrictions({
            //   country: this.selectedCountrycode,
            // });
          }
          if (res.success === false) {
            this.toaster.warning(res.message, 'Unable to book');
          }
          // else {
          //   this.toaster.warning(
          //     'No Matching User Found',
          //     'Please verify again'
          //   );
          // }
        },
        error: (error: any) => {
          console.log('is_User Error', error);
          this.toaster.error(error.error.error, 'Invalid phone number');
        },
        complete: () => {
          // const selectedcountrycode
        },
      });
  }

  showRideDetails: boolean = false;

  okGotIt() {
    this.showUserDetails = false;
    this.showRideDetails = true;
    this.mapAutocomplete_init();
  }
  //-----------------------------------------------RIDE DETAULS --------------------------------
  autocompleteFrom: any;
  autocompleteTo: any;
  autocompleteWaypoint: any;
  isInsideZone: boolean = true;

  createAutocomplete(inputElement: any, where: string) {
    console.log(
      'Autocomplete works here ---------------',
      this.selectedCountrycode
    );
    const autocomplete = new google.maps.places.Autocomplete(inputElement);
    autocomplete.setComponentRestrictions({
      country: this.selectedCountrycode,
    });
    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      this.handlePlaceChange(place, where);
    });
  }

  mapAutocomplete_init() {
    console.log('this.selectedCountrycode', this.selectedCountrycode);
    const fromInput = document.getElementById('from') as HTMLInputElement;
    const toInput = document.getElementById('to') as HTMLInputElement;
    const waypointInput = document.getElementById(
      'waypoint'
    ) as HTMLInputElement;

    this.autocompleteFrom = this.createAutocomplete(fromInput, 'from');
    this.autocompleteTo = this.createAutocomplete(toInput, 'to');
    this.autocompleteWaypoint = this.createAutocomplete(
      waypointInput,
      'waypoint'
    );
  }
  allcoordinates: any[any];
  isLocationInside(data: { lat: number; lng: number }): any {
    this.createRideService
      .isLocationInsideZone('/isLocationInsideZone', data)
      .subscribe({
        next: (res: any) => {
          console.log('isLocationInsideZone RES', res);
          if (res.success === true) {
            this.toaster.success('WAAh bhai location is UNDER');
            this.isInsideZone = true;
            const fromValue = this.fromLocationInput?.nativeElement.value;
            this.selectedfromLocation = fromValue;
            this.selectedcity = res.cityid;
            return true;
          } else {
            this.toaster.error('SORRY BRO Baar che location');
            return false;
          }
        },
        error: (error: any) => {
          console.log('isLocationInsideZone Error', error);
          return false;
        },
        complete: () => {},
      });
  }
  handlePlaceChange(place: any, caller: string) {
    console.warn('place', place);

    if (!place.geometry) {
      console.log("No details available for input: '" + place.name + "'");
      this.waypointsForm.get('waypoint').setValue('');

      this.toaster.warning(
        'Please select place from given suggestions',
        'Invalid Input'
      );
      return;
    }

    //1 If caller is From location listener
    if (caller === 'from') {
      this.isInsideZone = false;
      const senddata = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      };

      console.log('senddata', senddata);
      // console.log();

      this.isLocationInside(senddata);
      //  console.log("this.isLocationInside(senddata)",this.isLocationInside(senddata));

      // return
      // console.log('this.LocationData', this.LocationData);
      // const newpolygon = this.LocationData.map((item) => ({
      //   zone: new google.maps.Polygon({
      //     paths: item.zone,
      //   }),

      // }))

      // return;

      // this.allcoordinates = this.LocationData.map((item) => ({
      //   _id: item._id,
      //   zone: new google.maps.Polygon({
      //     paths: item.zone,
      //   }),
      // }));
      // console.warn('this.allcoordinates', this.allcoordinates);

      // if (this.allcoordinates && this.allcoordinates.length > 0) {
      //   console.log('place.geometry.location', place.geometry.location);

      //   setTimeout(() => {
      //     for (let i = 0; i < this.allcoordinates.length; i++) {
      //       const polygon = this.allcoordinates[i].zone;
      //       console.log('polygon', polygon);

      //       // check = google.maps.geometry.poly.containsLocation(new google.maps.LatLng(lat,lng), polygon)
      //       // var rsul = google.maps.geometry.poly.containsLocation(new google.maps.LatLng(-12.043333, -77.028333), bermudaTriangle);
      //       // console.log(rsul);
      //       // if (google.maps.geometry.poly.containsLocation(new google.maps.LatLng(lat,lng), polygon)) {
      //       this.isInsideZone = false;

      //       if (
      //         google.maps.geometry.poly.containsLocation(
      //           place.geometry.location,
      //           polygon
      //         )
      //       ) {
      //         this.isInsideZone = true;
      //         console.warn('Waah bhai location UNDER j che', 'Success');
      //         // this.isInsideZone = false;
      //         const cityid = this.allcoordinates[i]._id;
      //         this.selectedcity = cityid;
      //         console.log('CITYID IS ', cityid);
      //         const fromValue = this.fromLocationInput?.nativeElement.value;
      //         this.selectedfromLocation = fromValue

      //         this.toaster.success('Waah bhai location UNDER j che', cityid);
      //         return
      //         break; // If the place is inside any zone, no need to continue checking
      //       }
      //     }
      //     console.log('OUTSIDE this.isInsideZone', this.isInsideZone);
      //     if (!this.isInsideZone) {
      //       console.log('FALSE -> this.isInsideZone', this.isInsideZone);
      //       console.warn('Sorry bhai location NATHI UNDER', 'Success');

      //       this.toaster.error(
      //         'Service is not available to that Location',
      //         'Invalid Place'
      //       );
      //       return;
      //     }
      //   }, 10);
      // }
    }
    if (caller === 'to') {
      const toValue = this.toLocationInput?.nativeElement.value;
      this.selectedToLocation = toValue;
    }
    if (caller === 'waypoint') {
      const waypointValue = this.waypointLocationInput?.nativeElement.value;
      this.selectedWaypointLocation = waypointValue;
    }
  }

  onCalculate() {
    this.markFormGroupTouched(this.waypointsForm);
    if (this.waypointsForm.invalid) {
      this.toaster.error('please Fill all Ride details', 'Incomplete Form');
      return null;
    }
  }

  addWaypoint() {
    const newwaypoint: any = 'sdasd';
    const waypointValue = this.waypointLocationInput?.nativeElement.value;
    if (
      waypointValue.trim() === '' ||
      this.selectedWaypointLocation !== waypointValue
    ) {
      this.toaster.warning(
        'Please select Waypoint from suggesstion',
        'Warning'
      );
      return;
    }

    if (this.waypointsArray.length >= this.stopCount) {
      this.toaster.warning('Max Stops Allready added', 'Stop Limit');
      this.waypointsForm.get('waypoint').setValue('');
      return;
    }

    this.waypointsArray.push(waypointValue);
    this.waypointsForm.get('waypoint').reset();
    console.log('waypoints', this.waypointsArray);
    this.selectedWaypointLocation = null;
    // this.Calculate();
  }

  // Method to remove a waypoint field
  removeWaypoint(index: number) {
    this.waypointsArray.splice(index, 1);
    console.log('waypoints', this.waypointsArray);
    this.directionsRenderer.setMap(null);
    // this.Calculate();
  }
  after_insidelocation(from: string, to: string) {
    console.log(from, to, this.waypointsArray);
    this.showRideDetails = false;

    this.directionsService.route(
      {
        origin: from,
        destination: to,
        waypoints: this.waypointsArray.map((waypoint: any) => ({
          location: waypoint,
          stopover: true,
          // location: waypoint
        })),
        // optimizeWaypoints: true,
        travelMode: google.maps.TravelMode.DRIVING,
        region: this.selectedCountrycode,
      },
      (response: any, status: string) => {
        console.log('RESPONSE', response);
        if (status === 'OK') {
          this.directionsRenderer.setMap(null);
          this.directionsRenderer = new google.maps.DirectionsRenderer({
            polylineOptions: {
              strokeColor: 'blue',
              strokeWeight: 4,
            },
          });

          this.getAllPricingdata(this.selectedcity, response);
        } else {
          if (status === 'ZERO_RESULTS') {
            this.isRoute = false;
            alert('No route found for given locations!');
            this.directionsRenderer.setMap(null);

            console.log('No route found for given locations! ' + status);
          } else {
            this.isRoute = false;
            alert('Select location from auto suggestion ');
            this.directionsRenderer.setMap(null);
            console.log('Select location from auto suggestion ' + status);
          }
        }
      }
    );
  }
  //on isUser
  availableServicetype: { vehiclename: string; vehicleid: string }[];
  BookingrideForm: FormGroup;
  userid: string;
  cityid: string;
  // After calculate successfull
  fromLocation: string;
  toLocation: string;
  waypointsLocation: any[string];
  //book now
  vehicleid: string;
  paymentType: string;
  estimatedFarePrice: number;
  estimatedTime: string; //1hr 30min
  rideDistance: number;
  rideDuration: number;
  bookTime: string;
  bookDate: string;
  bookDateandTime: number;
  showPricingDetails: boolean = false;
  rideTime: string;
  ServicePricing: any[any] = [];
  Calculate() {
    console.log('this.selectedCurrenct', this.selectedCurrency);

    this.markFormGroupTouched(this.waypointsForm);
    console.log('calculate is clicked');
    const fromValue = this.fromLocationInput?.nativeElement.value;
    const toValue = this.toLocationInput?.nativeElement.value;

    if (!this.isInsideZone) {
      this.toaster.warning(
        "Service is not available at this 'From' location",
        '! Invalid Input'
      );
      return null;
    }
    if (
      this.selectedToLocation !== toValue ||
      this.selectedfromLocation !== fromValue
    ) {
      this.toaster.warning(
        'Please select From: and To: from Auto-Suggestion',
        '! Invalid Input'
      );
      return null;
    }
    // console.log(fromValue, toValue, this.waypointLocation);

    if (
      !this.isInsideZone ||
      (fromValue === toValue &&
        (fromValue === this.waypointsArray[0] ||
          toValue === this.waypointsArray[this.waypointsArray.length - 1]))
    ) {
      this.toaster.warning(
        'Please select appropriate Location',
        '! Invalid From location'
      );
      return;
    }

    this.after_insidelocation(fromValue, toValue);

    // const geocoder = new google.maps.Geocoder();
    // console.log('geocoder',geocoder);
    // const alllocations = [fromValue, ...this.waypointsArray, toValue]
    // console.log('alllocations',alllocations);
    // for(let i = 0; i< alllocations.length;i++){

    // }
    // alllocations.forEach((item)=>{
    //   geocoder.geocode(
    //     { address: item },
    //     (results: any, status: any) => {
    //       console.log('results',results);

    //       if (status === "OK") {
    //         const country = results[0].address_components.find(item => item['short_name'] === this.selectedCountrycode)
    //         console.log('country data-> ',country);
    //         if(country){

    //           counter = counter + 1;
    //           console.log('counter',counter);
    //         }

    //       }})

    //     })
    // let isAllinsideIndia = true;
    // const promises = alllocations.map((item,i) => {
    //   return new Promise((resolve, reject) => {
    //     geocoder.geocode({ address: item }, (results: any, status: any) => {
    //       console.log("GEROCODE[]",i,results);

    //       if (status === "OK") {
    //         const country = results[0].address_components.find((component: any) => component['short_name'] === this.selectedCountrycode);
    //         if (country) {
    //           resolve(1); // Resolve with 1 if country is found
    //         } else {
    //           isAllinsideIndia = false;
    //           resolve(0); // Resolve with 0 if country is not found
    //         }
    //       } else {
    //         reject(new Error(`Geocoding request failed for ${item} with status ${status}`));
    //       }
    //     });
    //   });
    // });

    // Promise.all(promises)
    //   .then((results) => {
    //     // const counter = results.reduce((acc:number, curr:number) => acc + curr, 0);
    //     if(isAllinsideIndia){
    //       console.warn("Waah bhai badha under na j che");
    //       this.after_insidelocation()
    //     }else{
    //       // alert("Sorry bhai baar nu nikdu kok")
    //       this.toaster.error("Please select places from suggestion","No path available")
    //     }

    //   })
    //   .catch((error) => {
    //     console.error('Error:', error);
    //   });
  }

  getAllPricingdata(data: string, response: any[any]) {
    this.createRideService.getPricingData('/get_pricing', data).subscribe({
      next: (res: any) => {
        console.log('getAllPricingdata', res);
        if (res.success === 'true' && res.data.length > 0) {
          this.directionsRenderer.setMap(this.map);
          this.directionsRenderer.setDirections(response);
          // console.log(this.travelForm.value);
          this.isRoute = true;
          const allPricingArray = res.data;
          const RouteArray = response.routes[0].legs;
          console.log(RouteArray);
          const result = RouteArray.reduce(
            (acc: any, trip: any) => {
              return {
                distance: acc.distance + trip.distance.value,
                duration: acc.duration + trip.duration.value,
              };
            },
            { distance: 0, duration: 0 }
          );

          console.log('FINAL RESULT', result);

          let Totaldistance = result.distance;

          this.rideDistance = Number((Totaldistance / 1000).toFixed(2));
          this.rideDuration = result.duration / 60;

          let TotalTime = result.duration;
          console.log('TotalTime--->', TotalTime);
          const hours = Math.floor(TotalTime / 3600);
          const minutes = Math.floor((TotalTime % 3600) / 60);

          this.rideTime = `${hours} hr ${minutes} min`;

          // let distance,distanceforbaseprice = 1000, Unitdistanceprice = 5,Unittimeprice= 1,baseprice = 30,minFare = 35 ;
          const servicePricing = allPricingArray.map(
            ({
              vehicleData,
              distanceBasePrice,
              pricePerUnitDistance,
              pricePerUnitTime,
              basePrice,
              minFare,
            }) => {
              return {
                vehicleid: vehicleData._id,
                vehiclename: vehicleData.vname,
                Totalprice: this.TotalPrice(
                  Totaldistance,
                  TotalTime,
                  distanceBasePrice,
                  pricePerUnitDistance,
                  pricePerUnitTime,
                  basePrice,
                  minFare
                ),
                // distanceforbaseprice: distanceBasePrice,
                // Unitdistanceprice:pricePerUnitDistance ,
                // Unittimeprice:pricePerUnitTime ,
                // baseprice:basePrice ,
                // minFare:minFare ,
              };
            }
          );
          this.ServicePricing = servicePricing;
          console.log('NEW MAPPED ARRAY', typeof servicePricing);

          this.showPricingDetails = true;

          this.showRemainingForm(allPricingArray);
          // this.BookingrideForm.get('date').disable;
          // this.BookingrideForm.get('time').disable;
        } else {
          this.toaster.info(
            'No service Type available for this City',
            'Sorry for the inconvinience'
          );
          this.waypointsForm.reset();
          this.BookingrideForm.reset();
          this.showUserDetails = false;
          this.showRideDetails = false;
          this.showPricingDetails = false;
          this.directionsRenderer.setMap(null);
          // console.log("this.map",this.map);
          this.map.setCenter(this.place);
          this.map.setZoom(5);

          return;
        }
      },
      error: (error: any) => {
        console.log('get_pricing Error', error);
      },
      complete: () => {},
    });
  }

  TotalPrice(
    distance: number,
    duration: number,
    distanceforbaseprice: number,
    Unitdistanceprice: number,
    Unittimeprice: number,
    baseprice: number,
    minFare: number
  ) {
    let Totaldistance = distance / 1000;
    let TotalTime = duration / 60;
    // this.rideDistance = distance;
    // let tempdistance,distanceforbaseprice = 1000, Unitdistanceprice = 5,Unittimeprice= 1,baseprice = 30,minFare = 35 ;
    let tempdistance = 0;
    if (Totaldistance > distanceforbaseprice) {
      tempdistance = Totaldistance - distanceforbaseprice;
    }
    let TotalPricing =
      tempdistance * Unitdistanceprice + TotalTime * Unittimeprice + baseprice;
    console.log('INITIAL pricing', TotalPricing);

    if (TotalPricing < minFare) {
      TotalPricing = minFare;
    }

    console.log('TotalPricing', TotalPricing);
    return TotalPricing;
  }

  showRemainingForm(allPricingArray: any[]) {
    const minDate = new Date().toISOString().split('T')[0];
    const selectservicetype = allPricingArray.map(({ vehicleData }) => {
      return {
        vehiclename: vehicleData.vname,
        vehicleid: vehicleData._id,
      };
    });
    this.availableServicetype = selectservicetype;
    // assigning main ride details objects ( 4 )
    this.cityid = this.selectedcity;
    this.fromLocation = this.selectedfromLocation;
    this.toLocation = this.selectedToLocation;
    this.waypointsLocation = this.waypointsArray;
  }

  onchangeDateandTime() {
    const value = this.BookingrideForm.get('bookingType').value;
    const DateTime = this.BookingrideForm.get('DateTime');
    if (value === 'schedule') {
      DateTime?.setValidators([Validators.required, this.futureDateValidator]);
      console.log('DATE SELETED', DateTime.value);
    } else {
      DateTime?.clearValidators();
    }
    DateTime?.updateValueAndValidity();
  }

  futureDateValidator(control: any): { [key: string]: boolean } | null {
    const currentDate = new Date();
    const selectedDate = new Date(control.value);
    if (selectedDate <= currentDate) {
      return { pastDate: true };
    }
    return null;
  }

  setCurrentTime() {
    const dateTime = new Date();

    // Extract date components
    const year = dateTime.getFullYear();
    const month = ('0' + (dateTime.getMonth() + 1)).slice(-2);
    const day = ('0' + dateTime.getDate()).slice(-2);

    const hours = ('0' + dateTime.getHours()).slice(-2);
    const minutes = ('0' + dateTime.getMinutes()).slice(-2);

    const dateString = `${year}-${month}-${day}`;
    const timeString = `${hours}:${minutes}`;
    this.bookDate = dateString;
    this.bookTime = timeString;
    this.bookDateandTime = new Date().getTime();

    // Output the date and time components
    console.log('Date:', dateString); // Output: 06-05-2024
    console.log('Time:', timeString); // Output: 12:30:00
  }

  findVehicleById(vehicleid: any) {
    return this.ServicePricing.find(
      (vehicle) => vehicle.vehicleid === vehicleid
    );
  }

  onBackPage() {
    this.showUserDetails = false;
    this.showRideDetails = true;
    this.showPricingDetails = false;
    this.BookingrideForm.reset();
  }

  onSubmitRide(): void {
    const dateTimeControl = this.BookingrideForm.get('DateTime');
    this.paymentType = this.BookingrideForm.get('paymentOption').value;
    // if (!this.paymentType) {
    //   dateTimeControl.setValidators([Validators.required]);
    //   dateTimeControl.updateValueAndValidity();
    // }else{
    //   dateTimeControl.setValidators([Validators.required]);
    //   dateTimeControl.updateValueAndValidity();
    // }
    this.markFormGroupTouched(this.BookingrideForm);

    // Check if you need to add the required validator
    if (this.BookingrideForm.invalid) {
      this.toaster.error(
        'Please complete the all Form Details with Validations',
        'Invalid Form'
      );
      return;
    }
    // const BookTime = this.BookingrideForm.get('BookTime').value
    console.log('THIS sdata->', this.BookingrideForm.get('bookingType').value);
    let confirmation;
    // return
    if (this.BookingrideForm.get('bookingType').value === 'bookNow') {
      this.setCurrentTime();
      confirmation = confirm('Are you sure You want to book Ride now ?');
      if (!confirmation) {
        return;
      }
    } else {
      console.log(
        'this.BookingrideForm.getvalue',
        this.BookingrideForm.get('DateTime').value
      );

      if (this.BookingrideForm.get('DateTime').value) {
        const [currentDate, currentTime] =
          this.BookingrideForm.get('DateTime').value.split('T');
        this.bookDate = currentDate;
        this.bookTime = currentTime;

        this.bookDateandTime = new Date(
          `${this.bookDate}T${this.bookTime}`
        ).getTime();
        confirmation = confirm(
          'Are you sure You have Selected this Date : ' +
            this.bookDate +
            ' ' +
            this.bookTime
        );
      }
    }

    // Process form submission here
    console.log(this.BookingrideForm.value);
    console.log(this.waypointsForm.value);

    const toValue = this.toLocationInput?.nativeElement.value;
    const fromValue = this.fromLocationInput?.nativeElement.value;

    // if (this.fromLocation !== fromValue || this.toLocation !== toValue) {
    //   this.toaster.error(
    //     'Please Enter Valid Ride Details or Calculate Again',
    //     'Invalid Ride Details'
    //   );

    //   return;
    // }

    if (!confirmation) {
      return;
    }
    this.vehicleid = this.BookingrideForm.get('serviceType').value;
    console.log(this.setCurrentTime());

    const foundVehicle = this.findVehicleById(this.vehicleid);

    console.log('foundVehicle', foundVehicle);

    this.estimatedFarePrice = foundVehicle.Totalprice;
    console.log(
      '-----------------------------------------------------------------------'
    );
    console.log(Number(this.rideDistance.toFixed(2)));
    console.log(
      this.rideDistance,
      '-------------------------',
      this.rideDuration
    );

    console.log(
      '-----------------------------------------------------------------------'
    );

    const data = {
      userid: this.userid,
      cityid: this.cityid,
      vehicleid: this.vehicleid,
      fromLocation: this.fromLocation,
      toLocation: this.toLocation,
      waypointsLocation: this.waypointsLocation,
      bookDate: this.bookDate,
      bookTime: this.bookTime,
      rideDistance: this.rideDistance,
      rideDuration: Number(this.rideDuration.toFixed(2)),
      paymentType: this.paymentType,
      estimatedFarePrice: Number(this.estimatedFarePrice.toFixed(2)),
      estimatedTime: this.rideTime, //hr and min
      bookDateandTime: this.bookDateandTime,
    };
    console.log('ALLDATA', data);
    // return

    this.createRideService.booknewRide('/create_ride', data).subscribe({
      next: (res: any) => {
        console.log('Create Ride res', res);
        if (res.success === true) {
          this.toaster.success(res.message, 'Success');
          this.waypointsForm.reset();
          this.Rideform.get('phoneNumber').reset();
          this.BookingrideForm.reset();
          this.showUserDetails = false;
          this.showRideDetails = false;
          this.showPricingDetails = false;
          this.directionsRenderer.setMap(null);
          console.log('this.map', this.map);
          this.map.setCenter(this.place);
          this.map.setZoom(5);
        }
      },
      error: (error: any) => {
        console.log('booknewRide Error', error);
        this.toaster.error(error.error.message, 'Error');
      },
      complete: () => {},
    });
  }

  pastTimeValidator(control) {
    const currentTime = new Date();
    const selectedTime = new Date();

    const [hours, minutes] = control.value.split(':');
    selectedTime.setHours(+hours, +minutes, 0, 0);

    if (selectedTime < currentTime) {
      return { pastTime: true };
    }
    return null;
  }
}
