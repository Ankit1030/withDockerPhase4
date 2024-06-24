import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { env } from '../../../../environments/environment.development';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import {
  AbstractControl,
  Form,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { Ride, Vehicle } from '../confirmed-ride/confirmed-ride.component';
import { RidehistoryService } from '../../../services/rides/ridehistory.service';
import { GetdataService } from '../../../services/getdata.service';
import { ToastrService } from 'ngx-toastr';
import { log } from 'node:console';
declare var google: any;
@Component({
  selector: 'app-ride-history',
  standalone: true,
  providers: [],
  imports: [
    ReactiveFormsModule,
    MatIconModule,
    MatDatepickerModule,
    MatFormFieldModule,
    // NgxDaterangepickerMd,
    MatSelectModule,
    MatInputModule,
    MatNativeDateModule,
    MatButtonModule,
    CommonModule,
    FormsModule,
  ],
  templateUrl: './ride-history.component.html',
  styleUrl: './ride-history.component.css',
})
export class RideHistoryComponent {
  dateForm: FormGroup;
  ride: any;
  showpopup: boolean;
  polyline: any;
  markerArray: any = [];
  geocoder: any;
  feedbackForm: FormGroup;
  allRideArray: Ride[];
  selected: { startDate: any; endDate: any };
  allVehicles: Vehicle[];
  allStars: string[] = ['1', '2', '3', '4', '5'];
  allStatus: any = [
    // {_id:0},
    { _id: 6 },
    { _id: 7 },
  ];
  map: any;
  @ViewChild('closeButton') closeButton: ElementRef;
  private mybackendUrl = env.backendUrl;
  // geocoder:any
  get backendUrl(): string {
    return this.mybackendUrl;
  }
  // dates:any;
  constructor(
    private fb: FormBuilder,
    private ridehistoryService: RidehistoryService,
    private toaster: ToastrService,
    private getDataService: GetdataService
  ) {
    this.dateForm = this.fb.group({
      fromDate: [''],
      toDate: [''],
      vehicleid: [''],
      ridestatus: [''],
      searchfield: [''],
    });
    this.feedbackForm = this.fb.group({
      rideid: [''],
      rating: ['', Validators.required],
      feedback: ['', Validators.required],
    });
  }
  closeModal() {
    if (this.closeButton && this.closeButton.nativeElement) {
      this.closeButton.nativeElement.click();
    }
  }
  findInvalidControls(): boolean {
    const invalidControls = [];
    const controls = this.dateForm.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalidControls.push(name);
      }
    }
    invalidControls.forEach((element) => {
      this.toaster.error(
        'Invalid Form Field  ' + `"${element}"`,
        'Incomplete Form Details'
      );
    });
    if ((invalidControls.length = 0)) {
      return true;
    } else {
      return false;
    }
    console.log('Invalid Controls: ', invalidControls);
  }

  ngAfterViewInit() {
    navigator.geolocation.getCurrentPosition((location) => {
      let result = location.coords;
      // console.log(result);
      const place = { lat: result.latitude, lng: result.longitude };
      // this.place = place
      this.map = new google.maps.Map(
        document.getElementById('map') as HTMLElement,
        {
          zoom: 10,
          center: { lat: result.latitude, lng: result.longitude },
        }
      );
      this.geocoder = new google.maps.Geocoder();
    });
  }

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.getAllHistoryRide(this.dateForm.value);
    this.getAllServiceTypes();
  }
  // { validator: this.dateLessThan('fromDate', 'toDate') }
  dateLessThan(fromDateKey: string, toDateKey: string): ValidatorFn {
    return (formGroup: AbstractControl): { [key: string]: any } | null => {
      const fromDateControl = formGroup.get(fromDateKey);
      const toDateControl = formGroup.get(toDateKey);

      if (!fromDateControl || !toDateControl) {
        return null; // Return null if the controls are not found
      }

      const fromDate = fromDateControl.value;
      const toDate = toDateControl.value;

      if (!fromDate || !toDate) {
        return null; // Return null if any of the dates are not provided
      }

      if (new Date(fromDate) > new Date(toDate)) {
        return { dates: true }; // Return an error if the date range is invalid
      }

      return null; // Return null if the date range is valid
    };
  }
  dateLessThan1(from: string, to: string) {
    return (group: FormGroup): { [key: string]: any } => {
      let f = group.controls[from];
      let t = group.controls[to];
      if (f.value > t.value) {
        console.log('++++++++++++++VALIDATOR FROM DATE FLAG IS On---------');
        return {
          dates: 'From Date should be less than To Date',
        };
      }
      console.log('NO ERROR ', this.dateForm.valid);

      return {};
    };
  }
  getAllServiceTypes() {
    this.getDataService.getAllVehicles().subscribe({
      next: (res: any) => {
        if (res.success === true) {
          this.allVehicles = res.data;
        }
        // this.removeDateLessThanValidator()
      },
      error: (error: any) => {},
      complete: () => {},
    });
  }

  getAllHistoryRide(data: any) {
    this.ridehistoryService.getAllStatus(data).subscribe({
      next: (res: any) => {
        console.log('getAllRides-->', res);
        if (res.success) {
          if (res.data.length > 0) {
            this.allRideArray = res.data;
          } else {
            if (this.dateForm.pristine) {
              return;
            }
            // this.allRideArray =[]
            this.toaster.warning('No Matching Data Found', 'Warning');
          }
        }
      },
      error: (error: any) => {
        console.log('rideHistory-->', error);
      },
      complete: () => {},
    });
  }
  clearForm(){
    if(this.dateForm.touched || this.dateForm.dirty){
      this.dateForm.reset();
      this.removeDateLessThanValidator()
      this.getAllHistoryRide(this.dateForm.value);
    }

  }
  applyDateLessThanValidator() {
    const fromDate = this.dateForm.get('fromDate').value;
    const toDate = this.dateForm.get('toDate').value;

    if (fromDate || toDate) {
      // Clear Validators if either fromDate or toDate is not empty
      this.dateForm.clearValidators();
      this.dateForm.get('fromDate').clearValidators();
      this.dateForm.get('toDate').clearValidators();

      // Apply Validators.required if either fromDate or toDate is filled
      console.log('VEFORE CHECK ', this.dateForm.valid);
      this.dateForm.get('fromDate').setValidators([Validators.required]);
      this.dateForm.get('toDate').setValidators([Validators.required]);
      this.dateForm.setValidators(this.dateLessThan('fromDate', 'toDate'));

      console.log('AFTER CHECK ', this.dateForm.valid);
      // Apply dateLessThan validator
    } else {
      // Clear Validators if both fromDate and toDate are empty
      this.dateForm.clearValidators();
      this.dateForm.get('fromDate').clearValidators();
      this.dateForm.get('toDate').clearValidators();
    }

    // Update the value and validity of the controls
    this.dateForm.updateValueAndValidity();
    this.dateForm.get('fromDate').updateValueAndValidity();
    this.dateForm.get('toDate').updateValueAndValidity();
    console.log('FINAL CHECK ', this.dateForm.valid);
  }

  removeDateLessThanValidator() {
    this.dateForm.get('fromDate').clearValidators();
    this.dateForm.get('toDate').clearValidators();
    this.dateForm.clearValidators(); // This clears the form-level validator

    // Update the value and validity of the controls
    this.dateForm.get('fromDate').updateValueAndValidity();
    this.dateForm.get('toDate').updateValueAndValidity();
    this.dateForm.updateValueAndValidity();
  }

  formatDate(inputDate: string) {
    console.log('INPUT DATE--->>>>', inputDate);

    const date = new Date(inputDate);

    // Extract the year, month, and day
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed, so add 1
    const day = String(date.getDate()).padStart(2, '0');
    console.log('RETURN ', `${year}-${month}-${day}`);

    // Format the date as YYYY-MM-DD
    return `${year}-${month}-${day}`;
  }

  onSubmit() {
    this.applyDateLessThanValidator();
    console.log('this.dateForm.valid', this.dateForm.valid);
    console.log('FromDATE--->', this.dateForm.get('fromDate').valid);
    console.log('ToDAte--->', this.dateForm.get('toDate').valid);

    // if (!this.findInvalidControls()) {
    //   return;
    // }
    if (this.dateForm.invalid) {
      this.toaster.warning('Invalid From and To Date Range ');
      return;
    }
    if (
      this.dateForm.get('fromDate').value ||
      this.dateForm.get('fromDate').value
    ) {
      this.dateForm.markAsTouched();
      console.log(
        'UPDATE VALUE',
        this.dateForm.get('fromDate').value.toString()
      );

      this.dateForm
        .get('fromDate')
        .setValue(
          this.formatDate(this.dateForm.get('fromDate').value.toString())
        );
      this.dateForm
        .get('toDate')
        .setValue(
          this.formatDate(this.dateForm.get('toDate').value.toString())
        );
    }
    if (this.dateForm.valid) {
      this.getAllHistoryRide(this.dateForm.value);
      console.log('Form Submitted!', this.dateForm.value);
    } else {
      console.log('Form is invalid');
    }
  }

  exportToCsv(): void {
    if (this.allRideArray.length == 0) {
      this.toaster.warning('Empty File cannot be download', 'Warning');
      return;
    }
    // UserName: ride.userDetails ? ride.userDetails.uname: 'No Driver',
    // const data = this.allRideArray
    const data = this.allRideArray.map((ride) => ({
      rideId: ride.ride_no,
      UserName: ride.userDetails.uname,
      DriverName: ride.driverDetails ? ride.driverDetails.dname : 'No Driver',
      // DriverName : ride.driverDetails.dname,
      ServiceType: ride.vehicleDetails.vname,
      PickupLocation: ride.fromLocation,
      DropoffLocation: ride.toLocation,
      Waypoints:
        ride.waypointsLocation.length > 0
          ? ride.waypointsLocation
          : 'No Waypoints',
      RideDate: ride.bookDate + ' ' + ride.bookTime,
      Status: ride.ridestatus == 6 ? 'Completed' : 'Cancelled',
      // Add more properties as needed
    }));
    // const data = [
    //   { name: 'John', age: 30, city: 'New York' },
    //   { name: 'Alice', age: 25, city: 'Los Angeles' },
    //   { name: 'Bob', age: 35, city: 'Chicago' }
    // ];

    const csvContent = this.convertArrayToCsv(data);
    console.log('csvContent', csvContent);

    this.downloadCsv(csvContent, 'example');
  }

  private convertArrayToCsv(data: any[]): string {
    const csvRows = [];
    const keys = Object.keys(data[0]);

    // Header row
    csvRows.push(keys.join(','));

    // Data rows
    for (const row of data) {
      const values = keys.map((key) => this.escapeCsvValue(row[key]));
      csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
  }

  private escapeCsvValue(value: any): string {
    if (value == null) return '';
    if (typeof value === 'string') return '"' + value.replace(/"/g, '""') + '"';
    return value.toString();
  }

  private downloadCsv(csvContent: string, fileName: string): void {
    const blob = new Blob([csvContent], { type: 'text/csv' });

    // Create download link
    const link = document.createElement('a');
    link.setAttribute('href', window.URL.createObjectURL(blob));
    link.setAttribute('download', fileName + '.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);

    // Trigger download
    link.click();

    // Clean up
    document.body.removeChild(link);
  }

  openFeedbackModal(ride: any) {
    this.ride = ride;
  }

  openInfoModal(ride: any) {
    this.showpopup = true;
    console.log('OPEN RIDEDETAILS', ride);
    this.ride = ride;
    if (ride.waypointsLocation && ride.waypointsLocation.length > 0) {
      this.showthisMap([
        ride.fromLocation,
        ...ride.waypointsLocation,
        ride.toLocation,
      ]);
    } else {
      this.showthisMap([ride.fromLocation, ride.toLocation]);
    }
  }
  FeedBackFormSubmit() {
    this.feedbackForm.markAllAsTouched()
    if (this.feedbackForm.invalid) {
      this.toaster.error('Please fill the form Details', 'Incomplete Form');
      return;
    }
    console.log('-------++++++++++++-----------++++++++++++');
    this.feedbackForm.get('rideid').setValue(this.ride._id);
    console.log('this.feedbackForm.value', this.feedbackForm.value);
    this.ridehistoryService
      .submitFeedbackform(this.feedbackForm.value)
      .subscribe({
        next: (res: any) => {
          console.log('Feedback form ', res);
          if (res.success) {
            this.toaster.success(res.message, 'Success');
            const match = this.allRideArray.findIndex((item) => {
              return item._id === this.ride._id;
            });
            this.allRideArray[match].feedback = res.data; 
          } else {
            this.toaster.error(res.message, 'Error');
          }
          this.closeModal()
        },
        error: (error: any) => {
          console.log('Feedback Error', error);
          this.toaster.error(error.message, 'Errpr');
        },
        complete: () => {},
      });
  }
  validateFeedback(control) {
    const value = control.value.trim();
    const words = value.split(/\s+/);
    const onlyAlphabets = /^[a-zA-Z\s]*$/;

    if (words.length < 5) {
      return { minLength: true };
    }

    if (!onlyAlphabets.test(value)) {
      return { onlyAlphabets: true };
    }

    return null;
  }

  addMarkers( coords: { lat: number; lng: number }[]): void {
    const labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    // const bounds = new google.maps.LatLngBounds();
    coords.forEach((coord:{ lat: number; lng: number }, index:number) => {
      const marker = new google.maps.Marker({
        position: coord,
        map: this.map,
        label: labels[index % labels.length],
        color: 'white', // Set the font color to white
        fontWeight: 'bold',
      });
      // console.log("BOUND before extend",index, bounds);
      // bounds.extend(coord);
      // console.log("BOUND after extend",index, bounds);
      
      this.markerArray.push(marker);
    });
    // this.map.fitBounds(bounds);
    console.log('111Current Zoom Level:', this.map.getZoom());
    // const center = bounds.getCenter();
    // map.setCenter(center);
    // map.fitBounds(bounds);
  }
  async showthisMap(data: string[]) {
    console.log('DRAW THIS POLYLINE', data);

    if (this.markerArray.length > 0) {
      this.markerArray.forEach((marker) => marker.setMap(null));
      this.markerArray = [];
    }
    if (this.polyline) {
      this.polyline.setMap(null);
      this.polyline = null;
    }
    const places = data;
    // const geocoder = new google.maps.Geocoder();
    const coordinates = await this.convertPlacesToLatLng(data);
    console.log("ALL COORDINATEDS--->>>> ",coordinates);
    
    this.drawPolyline(coordinates);
    this.addMarkers(coordinates);
    this.adjustBounds(coordinates);
    
    this.polyline.setMap(this.map);
  }

  drawPolyline(coordinates: any[]): void {
    this.polyline = new google.maps.Polyline({
      path: coordinates,
      // geodesic: true,
      strokeColor: '#FF0000',
      strokeOpacity: 1.0,
      strokeWeight: 2,
    });

    // this.polyline.setMap(this.map);
  }

  adjustBounds(coordinates:{ lat: number; lng: number }[]): void {
    const bounds = new google.maps.LatLngBounds();
    coordinates.forEach((marker:{ lat: number; lng: number }) => {
      bounds.extend(marker);
    });
    this.map.fitBounds(bounds,50);
    console.log('22Current Zoom Level:', this.map.getZoom());

  }

  // async convertPlacesToLatLng(places: string[]): Promise<any[]> {
  //   const coordinates: any[] = [];

  //   // Wrap each geocode call in a Promise
  //   const geocodePromises = places.map((place, index) => {
  //     return new Promise<void>((resolve, reject) => {
  //       this.geocoder.geocode({ address: place }, (results: any, status: any) => {
  //         if (status === google.maps.GeocoderStatus.OK) {
  //           const location = results[0].geometry.location;
  //           coordinates[index] = { lat: location.lat(), lng: location.lng() };
  //         } else {
  //           console.error(
  //             'Geocode was not successful for the following reason: ' + status
  //           );
  //           coordinates[index] = null; // Handle errors or set default coordinates
  //         }
  //         resolve();
  //       });
  //     });
  //   });

  //   // Wait for all geocode operations to complete
  //   await Promise.all(geocodePromises);

  //   // Filter out any null coordinates
  //   const validCoordinates = coordinates.filter((coord) => coord !== null);

  //   console.log('RETURN ', validCoordinates);
  //   return validCoordinates;
  // }
  async convertPlacesToLatLng(places: string[]): Promise<any[]> {
    const coordinates: any[] = [];
  
    // Function to perform geocoding for a single place
    const geocodePlace = async (place: string): Promise<any | null> => {
      return new Promise<void>((resolve:any) => {
        this.geocoder.geocode({ address: place }, (results: any, status: any) => {
          if (status === google.maps.GeocoderStatus.OK) {
            const location = results[0].geometry.location;
            resolve({ lat: location.lat(), lng: location.lng() });
          } else {
            console.error('Geocode was not successful for the following reason: ' + status);
            resolve(null); // Handle errors or set default coordinates
          }
        });
      });
    };
  
    // Map each place to a geocoding promise
    const geocodePromises = places.map(async (place) => await geocodePlace(place));
  
    // Execute all geocoding promises concurrently and await all of them
    const results = await Promise.all(geocodePromises);
  
    // Filter out any null results (failed geocodings)
    const validCoordinates = results.filter((coord) => coord !== null);
  
    console.log('RETURN ', validCoordinates);
    return validCoordinates;
  }
  
}
