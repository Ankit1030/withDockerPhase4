//---------------------------------------------------------------------------------------------------------------------------------------

import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { env } from '../../../../environments/environment.development';

import { VehicletypeService } from '../../../services/vehicletype.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { log } from 'console';
import { GetdataService } from '../../../services/getdata.service';

import { AbstractControl, ValidatorFn } from '@angular/forms';

function customPatternValidator(pattern: RegExp) {
  return (control:any) => {
    const isValid = pattern.test(control.value);
    return isValid ? null : { customPattern: true };
  };
}

@Component({
  selector: 'app-vehicle-type',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './vehicle-type.component.html',
  styleUrls: ['./vehicle-type.component.css'],
})
export class VehicleTypeComponent implements OnInit {
  vehicleForm: FormGroup;
  maxFileSize = 5 * 1024 * 1024; // 5 MB   --- 5 * 1024 * 1024
  allowedFileTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  fileSizeError = false;
  fileTypeError = false;
  vehicles: any;
  formData: FormData = new FormData();
  isimageupdated: boolean = false;
  selectedVehicle: any;
  updatebtnstatus: boolean;
  vehicle: any;
  index: any;
  // http://localhost:3200/uploads/defaultv.png
  defaultprofilesrc:string | ArrayBuffer=`${this.backendUrl}/uploads/defaultv.png`
    constructor(
      private fb: FormBuilder,
      private vehicleypeService: VehicletypeService,
      private toaster: ToastrService,
      private getdataservice: GetdataService,
      private elRef: ElementRef
    ) {}
    private mybackendUrl = env.backendUrl;
    get backendUrl(): string {
      return this.mybackendUrl;
    }
  ngOnInit(): void {
    console.log('ON INIT------------------------');
    this.vehicleForm = this.fb.group({
      vname: ['', [Validators.required, customPatternValidator(/^[a-zA-Z]{3}[a-zA-Z0-9]*$/) ]],
      vimage: [null],
    });
    this.getdata();
  }
  // customPattern:boolean
  // TypeScript code
  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();
      control.markAsDirty();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  editVehicle(vehicle: any) {
    this.isimageupdated = true;
    this.updatebtnstatus = true;
    this.selectedVehicle = vehicle;
    console.log('this.selectedVehicle', this.selectedVehicle);
    console.log('SLECTED IMAGE', this.selectedVehicle.vimage);
    this.selected_imagename = this.selectedVehicle.vimage;
    this.defaultprofilesrc= `${this.backendUrl}/uploads/vehicles/${this.selectedVehicle.vimage}` ;
    console.log(this.defaultprofilesrc);
    
    this.vehicleForm.patchValue({
      vname: this.selectedVehicle.vname,
    });
    this.index = this.vehicles.findIndex((v: any) => v._id === vehicle._id);
    console.log('index', this.index);
    console.log('Btn is clicked');
  }

  onFileInputClick() {
    this.isimageupdated = false;
    this.vehicleForm.touched;
    this.defaultprofilesrc=`${this.backendUrl}/uploads/defaultv.png`;
    console.log('--------------ONFILE CLICK------------');
  }
  selected_imagename:string;
  onFileChange(event: any) {
    console.log('--------------ONFILE CHANGE------------');
    this.formData = new FormData();
    // const filename = event.target.file
    const selectedFile = event.target.files[0];
    console.log(selectedFile);
    this.selected_imagename = selectedFile.name;
    
    // console.log(this.vehicleForm.get('vimage').value);
    


    if (selectedFile) {
      if (selectedFile.size > this.maxFileSize) {
        this.fileSizeError = true;
        return;
      }
      if (!this.allowedFileTypes.includes(selectedFile.type)) {
        this.fileTypeError = true;
        return;
      }
      const reader = new FileReader();

      reader.onload = () => {
        this.defaultprofilesrc = reader.result;
      };
      this.vehicleForm.get('vname').markAsDirty()
      reader.readAsDataURL(selectedFile);
      this.fileSizeError = false;
      this.fileTypeError = false;
      this.isimageupdated = true;
      this.formData.append('vimage', selectedFile);
    }
    return;
  }
  update() {
    this.isimageupdated = true;
    this.markFormGroupTouched(this.vehicleForm)
    if (this.selectedVehicle._id && this.selectedVehicle && this.vehicleForm.valid ) {
      this.formData.append('vname', this.vehicleForm.value.vname.toUpperCase().trim());
      console.log('this.isimageupdated', this.isimageupdated);

      // this.vehicleypeService.updateVehicle('updateVehicle/',
      this.vehicleypeService.updateVehicle('update_vehicle/',
          this.selectedVehicle._id,
          this.formData
        )
        .subscribe({
          next: (res: any) => {
            if (res.success === true) {
              this.toaster.success(res.message, 'Success');
              console.log(res);
              console.log(this.index);

              // Update the vehicle properties
              this.vehicles[this.index].vname = res.data.vname;
              this.vehicles[this.index].vimage = res.data.vimage;



              // Refresh vehicle data after successful update
            }
          },
          error: (error: any) => {
            console.warn('VEHICLE TYPE ERROR-------------------------');
            console.log(error);
            console.log(error.status);
            if (error.status === 401) {
              console.log('error 11000');
              this.toaster.error(error.error.message, 'Duplicate');
            }else if(error.status === 404){
              this.toaster.error(error.error.message, 'User not Found');
            }
             else {
              console.log('ELSE UPDATE error');
              console.log("Update error is ",error);
              this.toaster.error(error.message,error.statusText +' '+ error.status)
            }
            
            this.formData.delete('vname');
          },
          complete: () => {
            console.log('COMPLETED VEHICLE TYPE');
            this.resetForm();
            this.updatebtnstatus = false;
          },
        });
      }
      
    }
  // @ViewChild('fileInput') fileInput: ElementRef;
  resetForm() {
    this.vehicleForm.reset();
    this.formData = new FormData();
    const fileInput = this.elRef.nativeElement.querySelector('#vimage');
    fileInput.value = '';
    this.defaultprofilesrc =`${this.backendUrl}/uploads/defaultv.png`
    this.selected_imagename='Drag or drop image here'
  }

  onSubmit() {
    this.markFormGroupTouched(this.vehicleForm)
    if(!this.isimageupdated){
      this.toaster.error("please select the image file Before submit","Incomplete Form")
      return
    }
    // if (this.fileTypeError || this.fileSizeError) {
    //   this.toaster.error('Please select the valid image', 'File error');
    //   return;
    // }
    if (this.vehicleForm.valid && this.isimageupdated) {
      console.log('vname', this.vehicleForm.value.vname.trim().toUpperCase());
      console.log('vimage', this.vehicleForm.value.vimage);

      this.formData.append(
        'vname',
        this.vehicleForm.value.vname.trim().toUpperCase()
      );

      // ---------------------------------Add new vehicle service------------------------------

      this.vehicleypeService.addnewVehicle(this.formData)
      // this.vehicleypeService.vehicletypeadd('addvehicle', this.formData)
      .subscribe({
        next: (res: any) => {
          if (res.success === true) {
            this.vehicles.push(res.data);
            this.toaster.success(res.message, 'Success');
            this.resetForm();
          }
        },
        error: (error: any) => {
          console.log(error.status);
          
          if (error.status === 401) {
            console.log('error 11000');
            this.toaster.error(error.error.message, 'Duplicate');

          } else {
            console.log('ELSE error');
            this.toaster.error(error.error.message, 'Error');
          }
          this.formData.delete('vname');

        },
        complete: () => {
          console.warn('COMPLETED SUCCESSFULLY');
          this.isimageupdated = false;

        },
      });
      console.log('this.selectedimage',this.selected_imagename);
      
    } else {
      // if(this.vehicleForm.touched){
      this.toaster.error('Incomplete form fields', 'Invalid form');
      return;
    }
  }

  //--------------------------GRID VIEW-------------------------------------------------------------------------------------------------------------
  // ---------------------------------Get allready added vehicles------------------------------

  getdata() {
    console.log('this one');
    this.getdataservice.getAllVehicles().subscribe({
      next: (res: any) => {
        console.log('this one');
        console.log(res);

        if (res.success === true) {
          const data = res.data;
          console.log(data);
          this.vehicles = data;
        }
      },
      error: (error: any) => {
        console.log('Get all vehhicles error', error);
        this.toaster.error(error.error.message, 'Error');
      },
      complete: () => {
        console.log('Completed Getdata');
      },
    });
  }

  //---------------------------------------------------------------------------------------------------------------------------------------
}
