import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { env } from '../../../../environments/environment.development';
import {
  Component,
  TemplateRef,
  ViewChild,
  ElementRef,
  Renderer2,
} from '@angular/core';
// import { loadStripe } from '@stripe/stripe-js';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  NgForm,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogConfig,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { log } from 'console';
import { GetdataService } from '../../../services/getdata.service';
import { DriverService } from '../../../services/driver.service';
import { Stripe, loadStripe } from '@stripe/stripe-js';
interface allcodes {
  ccallcode: string;
  _id: string;
  ccode: string;
}

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    MatDialogModule,
    MatIconModule,
  ],
  templateUrl: './list.component.html',
  styleUrl: './list.component.css',
})
export class ListComponent {
  private stripe: Stripe | null = null;
  private stripePublishableKey =
  'pk_test_51PKFnuA9DbTl3x7cOh2yVgk4GLO2FUV8ozgk38gVI0vdDjx1gUWw4LiGMgnxAQsz90osPzQP1xkANmZzmnNRemG800RuF9gNST';
  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private toaster: ToastrService,
    public dialog: MatDialog,
    private getservice: GetdataService,
    private driverservice: DriverService,
    private elRef: ElementRef,
    private renderer: Renderer2
    ) {
      this.initializeStripe();
    }
    private mybackendUrl = env.backendUrl;
  get backendUrl(): string {
    return this.mybackendUrl;
  }
  private async initializeStripe() {
    this.stripe = await loadStripe(this.stripePublishableKey);
  }
  allcodes: any[];
  driverForm: FormGroup;
  defaultccode: string = 'select code';
  updateBtnStatus: boolean = false;
  formData: FormData;
  alldrivers: any[] = [];
  allcities: any[] = [];

  selected_countrycode: string;
  selected_city: string;
  selected_driver: any;
  flag: boolean = false;
  defaultcity: string = 'select city';
  options: number[] = [1, 2, 3, 4, 5, 6];
  selectedOption: number = 2;
  maxFileSize = 5 * 1024 * 1024; // 5 MB   --- 5 * 1024 * 1024
  allowedFileTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  fileSizeError = false;
  fileTypeError = false;
  allvehicles: any[];
  selected_vehicleid: string;
  clicked_driverid: string;
  selectedvehicle: any;
  state: string = 'Normal';

  //-------------------------------------------------

  selected_image: File;
  vehicleForm: FormGroup;
  isPrevButtonEnable: boolean;
  isNextButtonEnable: boolean;
  currentPage: number = 1;
  sortcol: string = 'dname';
  searchTerm: string = '';
  sortval: number = 0;
  previousval: string = '';
  dataPerPage: number = this.selectedOption;
  index: number;
  isimageupdated: boolean = false;
  isAddServiceModalOpen: boolean = false;
  // isApprovedMap: { [id: string]: boolean } = {};
  buttonTextMap: { [id: string]: string } = {};
  bankForm: FormGroup;
  //-------------------------------------------------
  ngOnInit(): void {
    this.driverForm = this.formBuilder.group({
      dname: ['', Validators.required],
      demail: [
        '',
        [Validators.required, Validators.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)],
      ],
      ccode: ['', Validators.required],
      dphone: [
        '',
        [Validators.required, Validators.pattern(/^[1-9]{1}[0-9]{9}$/)],
      ],
      dimage: [''],
      dcity: ['', Validators.required],
    });
    this.vehicleForm = this.formBuilder.group({
      vehicle: [''],
    });
    this.bankForm = this.formBuilder.group({
      accountHolderName: ['', Validators.required],
      bankAccountNumber: [
        '000123456789',
        [Validators.required, Validators.pattern(/^\d+$/)],
      ],
      routingNumber: [
        '110000000',
        [Validators.required, Validators.pattern(/^\d+$/)],
      ],
      country: ['US', Validators.required],
      currency: ['usd', Validators.required],
      accountHolderType: ['individual', Validators.required],
      // accountHolderType:['individual',Validators.required]
    });
    this.fetch_table_data({
      searchTerm: '',
      currentPage: this.currentPage,
      sortcol: this.sortcol,
      sortval: this.sortval,
      dataPerPage: this.selectedOption,
    });
    // this.get_all_vehicle();
    // this.getservice.getAllVehicles().subscribe((res:any)=>{
    //   const data = res.data
    //       console.log(data);

    // })
    this.get_country_callcodes();
  }
  async onBankDetailsSubmit() {
    if (this.bankForm.disabled) {
      this.closeModal();
      this.toaster.warning(
        'This Driver has allready added Bank Account',
        'Warning'
      );
      return;
    }
    if (!this.stripe) {
      this.toaster.error('Failed to load Stripe Error', 'Error');
    }
    if (!this.stripe) {
      this.toaster.error('Failed to load Stripe Error', 'Error');
    }
    // console.log("CLICKED SDRIVER",driver);

    const result = await this.stripe.createToken('bank_account', {
      country: this.bankForm.get('country').value,
      currency: this.bankForm.get('currency').value,
      account_holder_name: this.bankForm.get('accountHolderName').value,
      account_holder_type: this.bankForm.get('accountHolderType').value,
      account_number: this.bankForm.get('bankAccountNumber').value,
      routing_number: this.bankForm.get('routingNumber').value,
    });
    console.log('Resuilt -->', result);
    console.log('RESULT>TOKEN', result.token);
    const tokenid: string = result.token.id;
    console.log('RESULT>ID', result.token.id);
    this.driverservice
      .addBankAccount(this.clickedDriver.customerid, tokenid)
      .subscribe({
        next: (res: any) => {
          console.log('AddBankAccount Driver', res);
          if (res.success === true) {
            if (!res.data) {
              this.toaster.warning(res.message, 'Warning');
              return;
            }
            const index = this.alldrivers.findIndex((item) => {
              return item._id === this.clickedDriver._id;
            });
            console.log('index ', index);
            if (index !== -1) {
              console.log('11', this.alldrivers[index]);

              this.alldrivers[index].bankstatus = true;
              console.log('22', this.alldrivers[index]);
              this.toaster.success(res.message, 'Success');
              this.closeModal();
              return;
            }
            return;
          } else {
            this.toaster.error(res.message, 'Error');
          }
        },
        error: (error: any) => {
          console.log('AddBankAccount Error', error);
          this.toaster.error(error.message, 'Error');
        },
        complete: () => {},
      });

    if (result) {
      // const {_id}
    } else {
      this.toaster.error('Failed to create a Token ', 'Invalid Details');
    }
    console.log('BankForm Value->', this.bankForm.value);
  }
  clickedDriver: any;
  // bankformFlag :boolean= false;
  addBankDetails(driver: any) {
    this.bankForm.get('accountHolderName').setValue(driver.dname);
    this.clickedDriver = driver;

    const bankDetailsModel =
      this.elRef.nativeElement.querySelector('#bankdetailsmodel');
    if (driver.bankstatus) {
      this.bankForm.disable();
      const submitBtn = this.renderer.selectRootElement('#submitbtn', true);
      this.renderer.setStyle(submitBtn, 'display', 'none');
      return;
    } else {
      const submitBtn = this.renderer.selectRootElement('#submitbtn', true);
      this.renderer.setStyle(submitBtn, 'display', 'block');

      this.bankForm.enable();
    }
  }
  @ViewChild('closeButton1') closeButtonBank: ElementRef;
  closeModal() {
    if (this.closeButtonBank && this.closeButtonBank.nativeElement) {
      this.closeButtonBank.nativeElement.click();
    }
  }
  @ViewChild('closeButton') closeButtonServiceModal: ElementRef;
  closeModalServicetype() {
    if (this.closeButtonServiceModal && this.closeButtonServiceModal.nativeElement) {
      this.closeButtonServiceModal.nativeElement.click();
    }
  }
  onSelectPageSize() {
    console.log('CHANGE PAGE SIZE LIMIT ----------------->>>>>>>>>>>>>>');

    this.fetch_table_data({
      searchTerm: this.searchTerm,
      currentPage: 1,
      sortcol: this.sortcol,
      sortval: this.sortval,
      dataPerPage: this.selectedOption,
    });
  }

  clearmyform() {
    this.driverForm.reset();
    this.isimageupdated = false;
    this.driverForm.get('ccode').enable();
    this.defaultccode = 'select code';
    this.defaultcity = 'select city';
    this.driverForm.get('ccode').setValue('');
    this.driverForm.get('dcity').setValue('');
    this.selected_image = null;
    this.allcities = [];
  }
  //----------------------------Get country calling code on page load inside formfields----------------------------------------------------------

  get_country_callcodes() {
    this.getservice
      .getZonedCountries()
      // this.http.get('http://localhost:3000/getcallingcode')
      .subscribe({
        next: (res: any) => {
          console.warn(res);
          if (res.success === true) {
            this.allcodes = res.data;
            this.driverForm.get('ccode').setValue(res.data[0]._id)

            // this.toaster.success("country code received","success")
          }
        },
        error: (err: any) => {
          console.log('get_country_callcodes() error', err);
          this.toaster.error('Something went wrong Server Error', 'Error');
        },
        complete: () => {
          console.log('COMPLETED get_country_callcodes()');
        },
      });
  }

  // when driver clicks country calling code
  onCountrySelect() {
    if (this.updateBtnStatus) {
      return;
    }
    this.selected_countrycode = this.driverForm.get('ccode').value;
    this.get_selected_cities(this.driverForm.get('ccode').value);
  }

  // called by Parentt funaction onCountry select
  get_selected_cities(selectedCountryid: string) {
    this.getservice
      .get_cities(selectedCountryid)
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
              // this.toaster.success('Received all filtered Cites','All cities')
              return;
            } else {
              this.allcities = [];

              this.toaster.error(
                '! No Service available in this Country',
                'Invalid input !'
              );
              this.driverForm.get('ccallcode').setValue('');
              return;
            }
          }
          this.toaster.error('Server City get Error', 'Server Error');
        },
        error: (error: any) => {
          this.toaster.error(
            error.message,
            error.statusText + ' ' + error.status
          );
          console.log('get_selecred_cities Error', error);
          return;
        },
        complete: () => {
          console.log('COMPLETED ALL CITIES -> get_selected_cities');
        },
      });
  }

  //-------------------From Driver component.ts file------------------------------------------------------

  onFileChange(event: Event) {
    console.log('FILE CHANGE EVENT');
    const selectedFile: File = (event.target as HTMLInputElement).files[0];
    if (selectedFile) {
      if (!this.allowedFileTypes.includes(selectedFile.type)) {
        this.fileTypeError = true;
        return;
      }
      if (selectedFile.size > this.maxFileSize) {
        this.fileSizeError = true;
        return;
      }
      this.fileSizeError = false;
      this.fileTypeError = false;
      this.isimageupdated = true;
      this.selected_image = selectedFile;
    } else {
      this.isimageupdated = false;
    }

    // this.driverForm.patchValue({ dimage: selectedFile });
  }
  onFileInputClick() {
    this.isimageupdated = false;
    this.selected_image = null;
    // this.isimageupdated=false;
    console.log('--------------ONFILE CLICK------------');
    // this.driverForm.patchValue({ dimage: null });
  }
  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  submitDriverProfile() {
    this.markFormGroupTouched(this.driverForm);
    const dname = this.driverForm.get('dname').value;
    this.driverForm.get('dname').setValue(dname.trim());
    if (this.driverForm.invalid) {
      console.log(this.selected_driver);
      console.log(this.driverForm.value);
      // this.isimageupdated=false;

      this.toaster.error('Please complete the form', 'Invalid Form');
      return;
    }
    this.formData = new FormData();

    if (this.flag === true) {
      console.log(' inside flag true');

      this.formData.append('_id', this.selected_driver._id);

      console.log(this.selected_driver._id);
      if (this.selected_image) {
        this.formData.append('dimage', this.selected_image);
        console.log('update img ', this.selected_image);
      }
      this.formData.append('dname', this.driverForm.get('dname').value);
      this.formData.append('ccode', this.driverForm.get('ccode').value);
      this.formData.append('dphone', this.driverForm.get('dphone').value);
      this.formData.append('dcity', this.driverForm.get('dcity').value);
      this.formData.append('demail', this.driverForm.get('demail').value);
      // console.log(this.formData);
      const sample = {
        dname: this.driverForm.get('dname').value,
        dphone: this.driverForm.get('dphone').value,
        demail: this.driverForm.get('demail').value,
        dcity: this.driverForm.get('dcity').value,
        ccode: this.driverForm.get('ccode').value,
        // dimage: this.selected_image.name
      };
      console.log('sample->', sample);
      const keysArray: string[] = [];

      this.formData.forEach((value, key, i) => {
        keysArray.push(key);
        console.log(`${key}->}`, value);
      });
      console.log(keysArray);
      console.log(this.driverForm.value);
      this.update_data(this.formData);

      console.log('UPDATE REQUEST SENT TO SERVER');

      return;
    }
    //------------------------------------------------------------------------------------------------------------

    //------------------------------------------------------------------------------------------------------------
    console.warn('this.driverForm.valid', this.driverForm.valid);

    if (this.driverForm.valid && this.isimageupdated) {
      console.warn(
        '---------->>>NEW USER SUBMIT SECTION STARTS <<<<<<<--------------------'
      );

      console.log(this.driverForm.value);
      if (this.selected_image) {
        this.formData.append('dimage', this.selected_image);
      }
      this.formData.append('dataPerPage', this.selectedOption.toString());
      this.formData.append('currentPage', this.currentPage.toString());
      this.formData.append('dname', this.driverForm.get('dname').value);
      this.formData.append('ccode', this.driverForm.get('ccode').value);
      // this.formData.append('ccode', this.driverForm.get('ccode').value);
      this.formData.append('dphone', this.driverForm.get('dphone').value);
      this.formData.append('dcity', this.driverForm.get('dcity').value);
      this.formData.append('demail', this.driverForm.get('demail').value);
      console.log(this.formData);
      const sample = {
        dname: this.driverForm.get('dname').value,
        dphone: this.driverForm.get('dphone').value,
        demail: this.driverForm.get('demail').value,
        dcity: this.driverForm.get('dcity').value,
        ccode: this.driverForm.get('ccode').value,
        dimage: this.selected_image.name,
      };
      console.log('sample', sample);

      this.submit_data(this.formData);
      return;
    }
  }
  update_data(data: FormData) {
    // console.log(data);
    console.warn('UPDATE SERVICE CALL VISITED');

    this.driverservice
      .updateDriver(data)
      // this.http.post('http://localhost:3000/store_driver', data)
      .subscribe({
        next: (res: any) => {
          console.warn(res);

          if (res.success === true) {
            this.toaster.success(res.message, 'Success');
            this.clearmyform();
            this.driverForm.reset({ dimage: '' });
            //Update the Edit data
            console.log('Updated res inside store_driver');
            this.alldrivers[this.index] = res.data;
            this.updateBtnStatus = false;
            this.flag = false;

            // this.isimageupdated = false;
            // this.driverForm.get('ccode').enable();
            // this.defaultccode = 'select code';
            // this.defaultcity = 'select city';
            // this.driverForm.get('ccode').setValue('');
            // this.driverForm.get('dcity').setValue('');
            // this.selected_image = null;
            // this.allcities = [];
          }
        },
        error: (err: any) => {
          console.log('USER SUBMIT ', err);
          if (err.error.message === 'Phone number already exists') {
            this.toaster.error(err.error.message, 'Duplicate input');
            return;
          }
          if (err.status === 401) {
            console.log(err);
            // console.log(err.error.error.duplicateKeyDetails.dphone);

            if (err.error.error.duplicateKeyDetails.dphone) {
              this.toaster.error('Duplicate Phone number', 'Invalid number');
            }
            if (err.error.error.duplicateKeyDetails.demail) {
              this.toaster.error('Duplicate Email id ', 'Invalid email');
            }
            // this.toaster.error(err.error.duplicateKeyDetails,'Duplicate Entry')
            return;
          }
          if (err.status === 400) {
            console.error('Invalid search term:', err.error.message);
            this.toaster.error(err.error.message, 'No matching Found');
            // Display user-friendly error message (optional)
          }

          // this.toaster.error(err.message,"Error")
        },
        complete: () => {
          console.log('SUBMITTED COMPLETED');
        },
      });
  }
  submit_data(data: FormData) {
    console.warn('SUBMIT SERVICE CALL VISITED');

    this.driverservice
      .saveDriver(data)
      // this.http.post('http://localhost:3000/store_driver', data)
      .subscribe({
        next: (res: any) => {
          console.warn(res);

          if (res.success === true) {
            this.toaster.success(res.message, 'Success');
            this.clearmyform();
            this.driverForm.reset({ dimage: '' });

            //Submit the new data
            const { currentPage, totalCount } = res;
            if (currentPage === this.currentPage) {
              console.log('PUSH save inside store_driver');
              this.alldrivers.push(res.data);
              // const driver._id = this.selected_driver._id
              // this.isApprovedMap[res.data._id] = res.data.status;
              this.buttonTextMap[res.data._id] = res.data.status
                ? 'Approved'
                : 'Declined';
            } else {
              // this.currentPage = currentPage
              this.alldrivers = res.data;
              this.initializeButtonStatus(res.data);
            }
            this.check_btn_status(currentPage, totalCount);

            // this.isimageupdated = false;
            // this.driverForm.get('ccode').enable();
            // this.defaultccode = 'select code';
            // this.defaultcity = 'select city';
            // this.driverForm.get('ccode').setValue('');
            // this.driverForm.get('dcity').setValue('');
            // this.allcities = [];
            // this.selected_image = null;
          }
        },
        error: (err: any) => {
          console.log('USER SUBMIT ', err);
          if (err.error.message === 'Phone number already exists') {
            this.toaster.error(err.error.message, 'Duplicate input');
            return;
          }
          if (err.status === 401) {
            console.log(err);
            // console.log(err.error.error.duplicateKeyDetails.dphone);

            if (err.error.error.duplicateKeyDetails.dphone) {
              this.toaster.error('Duplicate Phone number', 'Invalid number');
            }
            if (err.error.error.duplicateKeyDetails.demail) {
              this.toaster.error('Duplicate Email id ', 'Invalid email');
            }
            // this.toaster.error(err.error.duplicateKeyDetails,'Duplicate Entry')
            return;
          }
          if (err.status === 400) {
            console.error('Invalid search term:', err.error.message);
            this.toaster.error(err.error.message, 'No matching Found');
            // Display user-friendly error message (optional)
          }

          // this.toaster.error(err.message,"Error")
        },
        complete: () => {
          console.log('SUBMITTED COMPLETED');
        },
      });
  }
  // cpage:number;// to store the latest current page value received from server
  initializeButtonStatus(alldrivers) {
    console.log('initializeButtonStatus() called------------------------');

    for (const driver of alldrivers) {
      console.log('driver status index', driver);

      // this.isApprovedMap[driver._id] = driver.status;
      this.buttonTextMap[driver._id] = driver.status ? 'Approved' : 'Declined';
    }
  }

  async fetch_table_data(data: any) {
    this.driverservice
      .get_alldriver(data)
      // return this.http.post('http://localhost:3000/get_alldrivers', data)
      .subscribe({
        next: (res: any) => {
          console.warn(res);

          // this.toaster.success('All Table drivers fetched',"Success")

          if (res.success === true) {
            if (res.data.length === 0) {
              this.alldrivers = [];
              this.toaster.warning('No matching data found', 'No matching');
              return;
            }
            console.warn('i am fetch table data-- >>>');
            this.alldrivers = res.data;
            this.initializeButtonStatus(res.data);

            const { currentPage, totalCount } = res;
            console.log(currentPage);

            this.check_btn_status(currentPage, totalCount);
          }
        },
        error: (error: any) => {
          console.log('FETCH TABLE ERRor', error);
          console.log('');

          this.toaster.error(error.message, error.statusText);
        },
        complete: () => {
          console.log('COMPLETED FETCH DATA TABLE');
        },
      });
  }

  deleteDriver(driver: any) {
    const confirmation = confirm(
      `Are you sure you want to delete driver have email ${driver.demail}`
    );
    if (confirmation !== true) {
      return;
    }
    this.index = this.alldrivers.findIndex((v: any) => v._id === driver._id);
    console.log({
      _id: driver._id,
      currentNumber: 1,
      searchTerm: this.searchTerm,
      sortcol: this.sortcol,
      sortval: this.sortval,
      dataPerPage: this.selectedOption,
    });

    const currentNumber = this.currentPage * this.selectedOption - 1;

    console.log(currentNumber);
    // return

    // Check if the user clicked OK

    let deletedata: any;
    console.log('this.isNextButtonEnable', this.isNextButtonEnable);

    if (this.isNextButtonEnable) {
      deletedata = {
        _id: driver._id,
        currentNumber: currentNumber,
        searchTerm: this.searchTerm,
        // currentPage:this.currentPage,
        sortcol: this.sortcol,
        sortval: this.sortval,
        dataPerPage: this.selectedOption,
      };
    } else {
      deletedata = { _id: driver._id };
    }
    console.log('DELETED USER ', driver._id);

    console.log('currentnumber', currentNumber);
    console.log({
      searchTerm: this.searchTerm,
      currentPage: this.currentPage,
      sortcol: this.sortcol,
      sortval: this.sortval,
      dataPerPage: this.selectedOption,
    });

    //  this.fetch_table_data({ searchTerm:'', currentPage:this.currentPage, sortcol:this.sortcol, sortval:this.sortval,dataPerPage:this.selectedOption})

    this.http
      // .post('http://localhost:3000/delete_driver', deletedata)
      .post(`${this.backendUrl}/drivers/delete_driver`, deletedata)
      .subscribe({
        next: (res: any) => {
          console.log('delete_driver', res);
          // return

          if (res.success === true) {
            this.toaster.success(res.message, 'Success');
            this.alldrivers.splice(this.index, 1);
            if (this.alldrivers.length === 0) {
              this.PrevBtn();
            }
            if (res.data.length !== 0) {
              this.alldrivers.push(res.data);
              this.check_btn_status(this.currentPage, res.totalCount);
            }
            return;
          } else {
            this.toaster.error('Something went wrong', 'Error');
            return;
          }
        },
        error: (err: any) => {
          console.log('DELETE ERR', err);

          this.toaster.error(err.message, 'Error');
        },
        complete: () => {
          console.log('COMPLETED DELETE ROUTE');
        },
      });
    // this.selected_driver = driver
  }
  editDriver(driver: any) {
    console.log(driver);
    this.driverForm.get('ccode').disable();
    this.flag = true; //my custom update flag
    this.updateBtnStatus = true;
    this.isimageupdated = true;

    this.selected_driver = driver;
    console.warn(this.selected_driver);
    this.index = this.alldrivers.findIndex((v: any) => v._id === driver._id);
    console.warn(this.index, '_id us ', this.selected_driver._id);

    // this.alldrivers.splice(i,1)
    console.log('Edit pricing is clicked here');
    // this.defaultccode = this.selected_driver.ccode;
    console.log(this.selected_driver.ccode._id);

    this.get_selected_cities(this.selected_driver.ccode._id);
    // this.defaultcity=this.selected_driver.dcity;
    this.driverForm.patchValue({
      ccode: this.selected_driver.ccode._id,
      dname: this.selected_driver.dname,
      dphone: this.selected_driver.dphone,
      demail: this.selected_driver.demail,
      dcity: this.selected_driver.dcity._id,
    });
    return;
  }
  //----------------------------------------------SORTING STARTS-----------------------------

  searchBtn_clicked() {
    const searchdata = this.searchTerm;
    // const pattern = /^[a-zA-Z0-9 ]*$/;
    // console.log(
    //   pattern.test(searchdata),
    //   '----------------------------------------------'
    // );
    // if (!pattern.test(searchdata)) {
    //   this.toaster.error(
    //     'Please enter alphabet or letters only',
    //     'Invalid input'
    //   );
    //   return;
    // }
    this.currentPage = 1;
    console.warn(searchdata);

    if (searchdata == '') {
      // console.log('searchdata=============>',searchdata);

      this.fetch_table_data({
        searchTerm: '',
        currentPage: this.currentPage,
        sortcol: this.sortcol,
        sortval: this.sortval,
        dataPerPage: this.selectedOption,
      });
    }
    if (searchdata !== this.previousval) {
      console.warn(
        ' LLAAALALALALALALALALAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'
      );

      this.fetch_table_data({
        searchTerm: this.searchTerm,
        currentPage: this.currentPage,
        sortcol: this.sortcol,
        sortval: this.sortval,
        dataPerPage: this.selectedOption,
      });
      const previousval = searchdata;
    }
  }
  NextBtn() {
    this.currentPage++;
    this.fetch_table_data({
      searchTerm: this.searchTerm,
      currentPage: this.currentPage,
      sortcol: this.sortcol,
      sortval: this.sortval,
      dataPerPage: this.selectedOption,
    });
    console.log('NEXT BTN CLICKED');
  }
  PrevBtn() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.fetch_table_data({
        searchTerm: this.searchTerm,
        currentPage: this.currentPage,
        sortcol: this.sortcol,
        sortval: this.sortval,
        dataPerPage: this.selectedOption,
      });
    }
    console.log('PRIVIOUS BTN CLICKED');
  }

  check_btn_status(currentPage: number, totalCount: number): void {
    this.currentPage = currentPage;
    console.log('this.currentPage', currentPage);
    console.log('totalCount', totalCount);

    // currentPage === 1 ? this.isPrevButtonEnable=false:this.isPrevButtonEnable=true;
    this.isPrevButtonEnable = currentPage !== 1;
    // console.warn('this.isPrevButtonEnable ',this.isPrevButtonEnable );
    this.isNextButtonEnable = currentPage * this.selectedOption < totalCount;
    console.log('Prevbtn is ', this.isPrevButtonEnable);
    console.log('Nextbtn is ', this.isNextButtonEnable);
    // console.warn('this.isNextButtonEnable ',this.isNextButtonEnable );
  }

  async toggleState(caller: string) {
    if (caller === this.sortcol) {
      // Toggle the state based on the current state
      if (this.sortval === 0) {
        this.state = 'Ascending';
        this.sortval = 1;
      } else if (this.sortval === 1) {
        this.state = 'Descending';
        this.sortval = -1;
      } else if (this.sortval === -1) {
        this.state = 'Normal';
        this.sortval = 0;
      }

      console.log('----IF----' + this.sortcol + ' ' + this.sortval);
    } else {
      this.sortval = 1;
      this.sortcol = caller;
      this.state = 'Ascending';
      console.log('*--ELSE----*' + this.sortcol + ' ' + this.sortval);
    }

    console.warn('sortcol', this.sortcol, this.sortval);
    this.currentPage = 1;
    this.fetch_table_data({
      searchTerm: this.searchTerm,
      currentPage: this.currentPage,
      sortcol: this.sortcol,
      sortval: this.sortval,
      dataPerPage: this.selectedOption,
    });
  }

  //----------------------POPUP MODAL----------------------------------------
  findmyIndex(dataId: string) {
    const match = this.alldrivers.findIndex((item) => {
      return item._id === dataId;
    });
    return match;
  }

  onSelectVehicle(vehicleId: string) {
    console.log('selected vid is ', vehicleId);
    if (this.selectedvehicle === vehicleId) {
      this.selectedvehicle = null;
    } else {
      this.selectedvehicle = vehicleId;
    }
    this.vehicleForm.get('vehicle').setValue(this.selectedvehicle);
    this.selected_vehicleid = vehicleId;
    const data = {
      driverid: this.clicked_driverid,
      vehicleid: this.selectedvehicle,
    };
    console.log('send selected vehicle ', data);

    this.http
      // .post('http://localhost:3200/drivers/select_service', data)
      .post(`${this.backendUrl}/drivers/select_service`, data)
      // this.http.post('http://localhost:3000/on_select_vehicle', data)
      .subscribe({
        next: (res: any) => {
          console.log('Selected vehicle id res', res);
          if (res.success === true) {
            const index = this.findmyIndex(this.clicked_driverid);
            console.log('index of driver', index);

            if (index !== -1) {
              // console.log("BEFORE",this.alldrivers[index]);

              this.alldrivers[index].servicetype = res.data;
              // console.log("After",this.alldrivers[index]);
            }
            if (this.selectedvehicle !== null) {
              this.toaster.success(res.message, 'Success');
            } else {
              this.toaster.warning('No service is selected', 'Warning');
            }
            this.vehicleForm.get('vehicle').setValue(vehicleId);
            this.closeModalServicetype();
          }
        },
        error: (error: any) => {
          console.log('on_select_vehicle error', error);
        },
        complete: () => {
          console.log('Completed the on_select_vehicle');
        },
      });
  }

  clicked_driver_status(driverId: string) {
    this.allvehicles = [];
    // this.get_all_vehicle();
    console.log('Clicked driver id is ', driverId);
    this.clicked_driverid = driverId;

    this.http
      // .post('http://localhost:3200/drivers/available_service', {_id: this.clicked_driverid,})
      .post(`${this.backendUrl}/drivers/available_service`, {_id: this.clicked_driverid,})
      // .post('http://localhost:3000/clicked_driver_status', {_id: this.clicked_driverid})
      .subscribe({
        next: (res: any) => {
          console.log('Selected vehicle id res', res);

          if (res.success === true) {
            this.allvehicles = res.allvehicles;
            this.isAddServiceModalOpen = true;
            // this.toaster.success("Siccess")

            if (this.allvehicles.length !== 0) {
              if (res.data.servicetype === null) {
                this.selectedvehicle = 'null';
                this.vehicleForm.get('vehicle').setValue('null');
                return;
              }
              this.selectedvehicle = res.data.servicetype;
              this.vehicleForm.get('vehicle').setValue(res.data.servicetype);
            } else {
              this.toaster.warning(res.message, 'Service Unavailable');
            }
          }
        },
        error: (error: any) => {
          console.log('clicked_driver_status error', error);
        },
        complete: () => {
          console.log('Completed the clickeddriverstatus');
        },
      });
  }

  toggleButton(driver: any) {
    console.log(driver);
    this.http
      // .post('http://localhost:3200/drivers/update_status', { driverid: driver._id, status: !driver.status })
      .post(`${this.backendUrl}/drivers/update_status`, { driverid: driver._id, status: !driver.status })
      // this.http.post('http://localhost:3000/driver_status', data)
      .subscribe({
        next: (res: any) => {
          if (res.success === true) {
            this.toaster.success(res.message, 'Success');
            driver.status=!driver.status
            return;
          } else {
            this.toaster.success('Server Error', 'Error');
          }
        },
        error: (error: any) => {
          this.toaster.error(error.message,"Error")
          console.log('ToggleButton status', error);
        },
        complete: () => {
          console.log('Complete toggleButtonstatus');
        },
      });
    return;

    // this.updatestatus_driverid = driverId;
    // this.isApproved = !this.isApproved;
    // this.buttonText = this.isApproved ? 'Approved' : 'Declined';
    // this.onClick(this.isApproved);
  }

  getButtonText(driverId: string): string {
    return this.buttonTextMap[driverId];
  }


}
