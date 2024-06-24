import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { env } from '../../../environments/environment.development';

import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { log } from 'console';
import { ToastrService } from 'ngx-toastr';
import { EventEmitter } from 'stream';
import { GetdataService } from '../../services/getdata.service';
import { UserService } from '../../services/user.service';
declare var Stripe: any;

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css',
})
export class UsersComponent {
  userForm: FormGroup;
  formData: FormData;
  selected_image: File;
  defaultccode: string = 'select code';
  allusers: any;
  // sr_no:number;
  cardForm: FormGroup;
  isPrevButtonEnable: boolean;
  isNextButtonEnable: boolean;
  currentPage: number = 1;
  sortcol: string = 'uname';
  searchTerm: string = '';
  sortval: number = 0;
  previousval: string = '';
  dataPerPage: number = 3;
  index: number;
  updateBtnStatus: boolean = false;
  flag: boolean = false;
  selected_user: any;
  isimageupdated: boolean = false;
  allcodes: [any];
  state: string = 'Normal';
  maxFileSize = 5 * 1024 * 1024; // 5 MB   --- 5 * 1024 * 1024
  allowedFileTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  fileSizeError = false;
  fileTypeError = false;
  loadpage: boolean = false;
  handler: any = null;
  selected_customerid: string;
  selected_tokenid: string;
  default_card: string;
  mytotalCount: number;
  private mybackendUrl = env.backendUrl;
  get backendUrl(): string {
    return this.mybackendUrl;
  }
  isAddCountryModalOpen: boolean = false;
  cardDetails: any[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private toaster: ToastrService,
    private getservice: GetdataService,
    private userservice: UserService
  ) {
    // this.stripe = Stripe('your_stripe_public_key');
  }
  // ngOnDestroy(){
  //   alert("Are you sure you want to live this page")
  // }

  ngOnInit(): void {
    this.loadStripe();
    this.userForm = this.formBuilder.group({
      uname: ['', Validators.required],
      uemail: [
        '',
        [Validators.required, Validators.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)],
      ],
      ccode: ['', Validators.required],
      uphone: [
        '',
        [Validators.required, Validators.pattern(/^[1-9]{1}[0-9]{9}$/)],
      ],
      uimage: [''],
    });
    this.cardForm = this.formBuilder.group({
      selectedCard: new FormControl(''),
    });
    console.log('1 this.loadpage', this.loadpage);

    this.fetch_table_data({
      searchTerm: '',
      currentPage: this.currentPage,
      sortcol: this.sortcol,
      sortval: this.sortval,
      dataPerPage: this.dataPerPage,
    });
    console.log('2 this.loadpage', this.loadpage);

    console.log('3 this.loadpage', this.loadpage);

    // this.fetch_table_data({ searchdata:this.searchTerm, currentPage:this.currentPage, sortcol:this.sortcolumn, sortval:this.sortval});
    this.get_country_callcodes();
  }

  get_country_callcodes() {
    // this.http.get('http://localhost:3000/getcallingcode')
    this.getservice.getZonedCountries().subscribe({
      next: (res: any) => {
        console.warn(res);
        if (res.success === true) {
          this.allcodes = res.data;

          this.toaster.success('country code received', 'success');
        }
      },
      error: (err: any) => {
        console.log('get_country_callcodes() error', err);
      },
      complete: () => {
        console.log('COMPLETED get_country_callcodes()');
      },
    });
  }
  onFileChange(event: Event) {
    console.log('FILE CHANGE EVENT');
    const selectedFile: File = (event.target as HTMLInputElement).files[0];

    if (!this.allowedFileTypes.includes(selectedFile.type)) {
      this.fileTypeError = true;
      return;
    }
    if (selectedFile) {
      if (selectedFile.size > this.maxFileSize) {
        this.fileSizeError = true;
        return;
      }
      this.fileSizeError = false;
      this.fileTypeError = false;
      this.isimageupdated = true;
      this.selected_image = selectedFile;
    } else {
      console.log('IMAGE SELECCT NAHI KIYAHAI BHAI-----------------------');
    }

    // this.userForm.patchValue({ uimage: selectedFile });
  }
  onFileInputClick() {
    this.isimageupdated = false;
    console.log('--------------ONFILE CLICK------------');
    this.selected_image = null;
  }
  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  submitUserProfile() {
    this.markFormGroupTouched(this.userForm);
    const uname = this.userForm.get('uname').value;
    this.userForm.get('uname').setValue(uname.trim());
    if (this.userForm.invalid) {
      this.toaster.error('Please complete the form', 'Invalid Form');
      return;
    }
    this.formData = new FormData();

    if (this.flag === true) {
      console.log(' inside flag true');

      this.formData.append('_id', this.selected_user._id);
      if (this.selected_image) {
        this.formData.append('uimage', this.selected_image);
      }
      this.formData.append('uname', this.userForm.get('uname').value);
      this.formData.append('ccode', this.userForm.get('ccode').value);
      this.formData.append('uphone', this.userForm.get('uphone').value);
      this.formData.append('uemail', this.userForm.get('uemail').value);
      console.log(this.formData);
      console.log(this.selected_user._id);
      console.log(this.userForm.value);

      this.update_data(this.formData);
      return;
    }

    console.warn('this.userForm.valid', this.userForm.valid);

    if (this.userForm.valid && this.isimageupdated) {
      console.warn('---------->>><<<<<<<--------------------');

      console.log(this.userForm.value);
      if (!this.selected_image) {
        this.toaster.warning('Please select the User Profile');
        return;
      }
      this.formData.append('uimage', this.selected_image);
      this.formData.append('uname', this.userForm.get('uname').value);
      this.formData.append('ccode', this.userForm.get('ccode').value);
      this.formData.append('uphone', this.userForm.get('uphone').value);
      this.formData.append('uemail', this.userForm.get('uemail').value);
      this.formData.append('dataPerPage', this.dataPerPage.toString());
      this.formData.append('currentPage', this.currentPage.toString());
      console.log(this.formData);
      this.submit_data(this.formData);
      return;
    }
  }
  update_data(data: any) {
    this.userservice
      .updateUser(data)
      // this.http.post('http://localhost:3000/store_user', data)
      .subscribe({
        next: (res: any) => {
          console.warn(res);

          if (res.success === true) {
            this.toaster.success(res.message, 'Success');
            this.userForm.reset({ uimage: '' });

            //Update the Edit data
            console.log('Updated res inside store_user');
            this.allusers[this.index] = res.data;
            this.updateBtnStatus = false;
            this.flag = false;

            this.isimageupdated = false;
          }
        },
        error: (err: any) => {
          console.log('DUPLICATE ERROR ', err);
          if (err.error.message === 'Phone number already exists') {
            this.toaster.error(err.error.message, 'Duplicate input');
            return;
          }
          if (err.status === 401) {
            if (err.error.error.duplicateKeyDetails.uphone) {
              this.toaster.error('Duplicate Phone number', 'Invalid number');
            }
            if (err.error.error.duplicateKeyDetails.uemail) {
              this.toaster.error('Duplicate Email id ', 'Invalid email');
            }
            // this.toaster.error(err.error.duplicateKeyDetails,'Duplicate Entry')
            return;
          }
          if (err.status === 404) {
            this.toaster.error(err.error.message, 'Failed to update');
            this.userForm.get('ccode').enable();
            this.userForm.reset();
            this.defaultccode = 'select code';
            this.userForm.get('ccode').setValue('');
            this.selected_image = null;
            return;
          }
          console.log('USER SUBMIT ', err);
          this.toaster.error(err.message, 'Error');
        },
        complete: () => {
          console.log('SUBMITTED COMPLETED');
          this.userForm.get('ccode').enable();
          this.userForm.reset();
          this.defaultccode = 'select code';
          this.userForm.get('ccode').setValue('');
          this.selected_image = null;
        },
      });
  }

  submit_data(data: any) {
    this.userservice
      .saveUser(data)
      // this.http.post('http://localhost:3000/store_user', data)
      .subscribe({
        next: (res: any) => {
          console.warn(res);

          if (res.success === true) {
            this.toaster.success(res.message, 'Success');
            this.userForm.reset({ uimage: '' });
            if (this.flag === true) {
              //Update the Edit data
              console.log('Updated res inside store_user');
              this.allusers[this.index] = res.data;
              this.updateBtnStatus = false;
              this.flag = false;
            } else {
              //Submit the new data
              const { currentPage, totalCount } = res;
              if (currentPage === this.currentPage) {
                console.log('PUSH save inside store_user');
                this.allusers.push(res.data);
                this.searchTerm = '';
                this.sortval = 0;
              } else {
                // this.currentPage = currentPage
                this.allusers = res.data;
              }
              this.check_btn_status(currentPage, totalCount);
              // this.sr_no++;
            }
            // this.defaultccode='+(00)';
            this.isimageupdated = false;
          }
        },
        error: (err: any) => {
          console.log('DUPLICATE ERROR ', err);
          if (err.error.message === 'Phone number already exists') {
            this.toaster.error(err.error.message, 'Duplicate input');
            return;
          }
          if (err.status === 401) {
            if (err.error.error.duplicateKeyDetails.uphone) {
              this.toaster.error('Duplicate Phone number', 'Invalid number');
            }
            if (err.error.error.duplicateKeyDetails.uemail) {
              this.toaster.error('Duplicate Email id ', 'Invalid email');
            }
            // this.toaster.error(err.error.duplicateKeyDetails,'Duplicate Entry')
            return;
          }
          if (err.status === 404) {
            this.toaster.error(err.error.message, 'Failed to update');
            this.userForm.get('ccode').enable();
            this.userForm.reset();
            this.defaultccode = 'select code';
            this.userForm.get('ccode').setValue('');
            this.selected_image = null;
            return;
          }
          console.log('USER SUBMIT ', err);
          this.toaster.error(err.message, 'Error');
        },
        complete: () => {
          console.log('SUBMITTED COMPLETED');
          this.userForm.get('ccode').enable();
          this.userForm.reset();
          this.defaultccode = 'select code';
          this.userForm.get('ccode').setValue('');
          this.selected_image = null;
        },
      });
  }
  // cpage:number;// to store the latest current page value received from server
  clearmyForm() {
    this.userForm.get('ccode').enable();
    this.userForm.reset();
    this.defaultccode = 'select code';
    this.userForm.get('ccode').setValue('');
    this.selected_image = null;
  }

  async fetch_table_data(data: any) {
    this.userservice
      .get_allusers(data)
      // return this.http.post('http://localhost:3000/get_allusers', data)
      .subscribe({
        next: (res: any) => {
          console.warn(res);

          // this.toaster.success('All Table users fetched',"Success")

          if (res.success === true) {
            this.allusers = res.data;
            console.log(
              '-------------------------------------------------------------------------------------'
            );

            console.log(
              '(res.data.length === 0 && this.loadpage)',
              this.loadpage
            );
            console.log(
              '-------------------------------------------------------------------------------------'
            );

            if (res.data.length === 0 && this.loadpage) {
              console.log('--------------->>>>>>>>>>>res.data', res.data);

              this.toaster.warning('No matching data found', 'No matching');
              return;
            }
            console.warn('i am fetch table data-- >>>');
            const { currentPage, totalCount } = res;
            console.log(currentPage);
            // if(this.searchTerm ===''){
            //   // this.cpage =currentPage
            //   // this.sr_no = totalCount+1;
            //   // if(this.currentPage===1){ // Load page has '' search value
            //   //   console.warn('TOTAL COUNTR SR NO IS ',this.sr_no);
            //   // }
            // }

            this.check_btn_status(currentPage, totalCount);
            this.loadpage = true;
          }
        },
        error: (error: any) => {
          console.log('FETCH TABLE ERR', error);
          this.toaster.error(error.error.message, error.statusText);
        },
        complete: () => {
          console.log('COMPLETED FETCH DATA TABLE');
        },
      });
  }

  deleteUser(user: any) {
    console.log('kuchbhi--------------------');
    const confirmation = confirm(
      `Are you sure you want to delete User have email ${user.uemail}`
    );
    if (confirmation !== true) {
      return;
    }
    console.log('kuchbhi--------------------');
    // console.log('DELETED USER ', user._id);
    // // alert(`Are you sure you want to delete ${user.uname} ?`)
    // var confirmation = confirm(
    //   `Are you sure you want to delete user with email ${user.uemail}}`
    // );

    // // Check if the user clicked OK
    // if (confirmation !== true) {
    //   return;
    // }
    // const customerid = user.customerid;
    // const id = { _id: user._id, customerid: customerid };
    // this.index = this.allusers.findIndex((v: any) => v._id === user._id);
    //---------------------------------------------------------------------------
    this.index = this.allusers.findIndex((v: any) => v._id === user._id);
    console.log({
      _id: user._id,
      currentNumber: 1,
      searchTerm: this.searchTerm,
      // currentPage:this.currentPage,
      sortcol: this.sortcol,
      sortval: this.sortval,
      dataPerPage: this.dataPerPage,
    });

    const currentNumber = this.currentPage * this.dataPerPage - 1;

    console.log(currentNumber);
    // return

    // Check if the user clicked OK
    let deletedata: any;
    console.log('this.isNextButtonEnable', this.isNextButtonEnable);

    if (this.isNextButtonEnable) {
      deletedata = {
        _id: user._id,
        currentNumber: currentNumber,
        searchTerm: this.searchTerm,
        // currentPage:this.currentPage,
        sortcol: this.sortcol,
        sortval: this.sortval,
        dataPerPage: this.dataPerPage,
      };
    } else {
      deletedata = { _id: user._id };
    }
    console.log('deletedata', deletedata);
    // return

    //---------------------------------------------------------------------------
    this.userservice
      .deleteUser(deletedata)
      // this.http.post('http://localhost:3000/delete_user', deletedata)
      .subscribe({
        next: (res: any) => {
          console.log(res);

          if (res.success === true) {
            this.toaster.success(res.message, 'Success');
            this.allusers.splice(this.index, 1);
            if (this.allusers.length === 0) {
              this.PrevBtn();
            }
            if (res.data.length !== 0) {
              this.allusers.push(res.data);
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
    // this.selected_user = user
  }
  editUser(user: any) {
    this.userForm.get('ccode').disable();
    this.flag = true;
    this.updateBtnStatus = true;
    this.isimageupdated = true;

    this.selected_user = user;
    console.warn(this.selected_user);
    this.index = this.allusers.findIndex((v: any) => v._id === user._id);
    console.warn(this.index, '_id us ', this.selected_user._id);
    console.log(
      this.selected_user.ccode.ccallcode,
      '--------------------------------'
    );

    // this.allusers.splice(i,1)
    console.log('Edit pricing is clicked here');
    // this.defaultccode = this.selected_user.ccode.ccallcode;
    this.userForm.patchValue({
      ccode: this.selected_user.ccode._id,
      uname: this.selected_user.uname,
      uphone: this.selected_user.uphone,
      uemail: this.selected_user.uemail,
    });
    return;
  }
  //----------------------------------------------SORTING STARTS-----------------------------

  searchBtn_clicked() {
    const searchdata = this.searchTerm;
    console.log('SEARCHBTN CLICKED');

    const pattern = /^[a-zA-Z0-9 ]*$/;
    console.log(
      pattern.test(searchdata),
      '----------------------------------------------'
    );
    if (!pattern.test(searchdata)) {
      this.toaster.error(
        'Please enter alphabet or letters only',
        'Invalid input'
      );
      return;
    }
    this.currentPage = 1;
    console.warn(searchdata);

    if (searchdata == '') {
      // console.log('searchdata=============>',searchdata);

      this.fetch_table_data({
        searchTerm: '',
        currentPage: this.currentPage,
        sortcol: this.sortcol,
        sortval: this.sortval,
        dataPerPage: this.dataPerPage,
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
        dataPerPage: this.dataPerPage,
      });
    }
  }
  NextBtn() {
    if (this.currentPage < this.mytotalCount / this.dataPerPage) {
      this.currentPage++;
      this.fetch_table_data({
        searchTerm: this.searchTerm,
        currentPage: this.currentPage,
        sortcol: this.sortcol,
        sortval: this.sortval,
        dataPerPage: this.dataPerPage,
      });
      console.log('NEXT BTN CLICKED');
    } else {
      this.toaster.warning(
        'No data available to show',
        'You are already on Last Page'
      );
    }
  }
  PrevBtn() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.fetch_table_data({
        searchTerm: this.searchTerm,
        currentPage: this.currentPage,
        sortcol: this.sortcol,
        sortval: this.sortval,
        dataPerPage: this.dataPerPage,
      });
    } else {
      this.toaster.warning(
        'No previous record available',
        'You are already on First Page'
      );
    }
    console.log('PRIVIOUS BTN CLICKED');
  }

  check_btn_status(currentPage: number, totalCount: number): void {
    this.currentPage = currentPage;
    this.mytotalCount = totalCount;
    this.isPrevButtonEnable = currentPage !== 1;
    this.isNextButtonEnable = currentPage * this.dataPerPage < totalCount;
  }

  async toggleState(caller: string) {
    if (caller === this.sortcol) {
      if (this.sortval === 0) {
        this.state = 'Ascending';
        this.sortval = 1;
      } else if (this.sortval === 1) {
        this.state = 'Descending';
        this.sortval = -1;
      } else if (this.sortval === -1) {
        this.sortval = 0;
        this.state = 'Normal';
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
      dataPerPage: this.dataPerPage,
    });
  }

  //--------------------------------------STRIPE CARD SECTION-------------------------------------------------------------------------------------------------------

  @ViewChild('closeButton') closeButton: ElementRef;
  closeModal() {
    if (this.closeButton && this.closeButton.nativeElement) {
      this.closeButton.nativeElement.click();
    }
  }

  //--------------------------------------------------------------STRIPE INTENT CODE----------------------------------------------------- ---------------------
  defaultemail: string;
  customerid(user: any) {
    this.isAddCountryModalOpen = false;
    this.defaultemail = user.uemail;
    this.cardDetails = [];
    console.log(user);
    this.selected_customerid = user.customerid;
    const customerdetails = { customerid: this.selected_customerid };
    this.userservice
      .getDefaultCardDetails(user.customerid)
      // this.http.post<any>('http://localhost:3000/get_default_carddetails',customerdetails)
      .subscribe({
        next: (res: any) => {
          console.log('GET CARD DETAILS', res);
          if (res.success === true) {
            this.cardDetails = res.cardDetails;
            this.default_card = res.default_card;
            this.cardForm.get('selectedCard').setValue(this.default_card);
            console.log('NO CARD ADDEWD ', this.default_card);

            if (this.cardDetails.length !== 0 && this.default_card !== null) {
              this.isAddCountryModalOpen = true;
              console.log('KYA KUCH BHI--------------------------------');
              console.log(
                this.isAddCountryModalOpen,
                'if(this.cardDetails.length === 0 ){---------------------------'
              );

              return;
            }
            if (this.default_card === 'not found') {
              this.isAddCountryModalOpen = true;
            }
            // this.openModal();
          }
        },
        error: (error: any) => {
          console.log(
            '----------ERROR-------get_default_carddetails--------------------'
          );
          console.log(error);
        },
        complete: () => {},
      });
    console.log(this.selected_customerid, '-----------------------');
  }
  stripe_publickey =
    'pk_test_51PKFnuA9DbTl3x7cOh2yVgk4GLO2FUV8ozgk38gVI0vdDjx1gUWw4LiGMgnxAQsz90osPzQP1xkANmZzmnNRemG800RuF9gNST';
  submit() {
    // this.isAddCountryModalOpen = false;
    console.log('SUBMIT CLICKEDD');

    console.log(this.selected_customerid, '-----------------------');
    var handler = (<any>window).StripeCheckout.configure({
      email: this.defaultemail,
      key: this.stripe_publickey,
      locale: 'auto',
      token: (token: any) => {
        if (token) {
          this.selected_tokenid = token.id;
          console.log('this.selected_tokenid', this.selected_tokenid);
          console.log('called send card details ');

          this.send_carddetails();
          console.log('called send card details ');
        }
      },
    });

    handler.open({
      name: 'Card Details',
      panelLabel: 'Add Card',
    });
  }

  send_carddetails() {
    console.log('send_carddetails(){');
    console.log(this.selected_customerid);
    const stripedata = {
      customerid: this.selected_customerid,
      tokenid: this.selected_tokenid,
    };
    console.log(stripedata);
    this.userservice
      .addCardToCustomer(this.selected_customerid, this.selected_tokenid)
      // this.http.post('http://localhost:3000/addcardToCustomer', stripedata)
      .subscribe({
        next: (res: any) => {
          console.log('Response from addcardToCustomer', res);
          if (res.success === true) {
            const card = res.data;
            const cardobj = {
              id: card.id,
              card: { brand: card.brand, last4: card.last4 },
            };
            this.cardDetails.push(cardobj);
            console.log('this.cardDetails.length', this.cardDetails.length);
            if (this.cardDetails.length === 1) {
              this.cardForm.get('selectedCard').setValue(card.id);
            }
          }
          // this.isAddCountryModalOpen = true;
        },
        error: (error: any) => {
          console.log('Update catd details', error);

          this.toaster.error('Something went wrong', 'Error');
        },
        complete: () => {
          console.log('Token Created!!');
        },
      });
  }

  loadStripe() {
    if (!window.document.getElementById('stripe-script')) {
      var s = window.document.createElement('script');
      s.id = 'stripe-script';
      s.type = 'text/javascript';
      s.src = 'https://checkout.stripe.com/checkout.js';
      s.onload = () => {
        this.handler = (<any>window).StripeCheckout.configure({
          key: this.stripe_publickey,
          locale: 'auto',
          token: function (token: any) {
            console.log(token);
            alert('Payment Success!!');
          },
        });
      };

      window.document.body.appendChild(s);
    }
  }

  //sample aarray
  onSelectCard(cardId: string): void {
    console.warn('selected card id is ', cardId);
    console.warn('selected customer id is ', this.selected_customerid);
    const selected_customer = {
      customerid: this.selected_customerid,
      cardId: cardId,
    };
    this.userservice
      .setDefaultCard(this.selected_customerid, cardId)
      // this.http.post('http://localhost:3000/set_default_source', selected_customer)
      .subscribe({
        next: (res: any) => {
          console.log('set default card ', res);
          if (res.success === true) {
            this.toaster.success(res.message, 'Success');

            this.cardForm.get('selectedCard').setValue(cardId);
          }
        },
        error: (error: any) => {
          console.log('set default card error', error);
          this.toaster.error('Something went wrong server error', 'Error');
        },
        complete: () => {
          console.log('Completed set default card');
        },
      });
  }

  ondelete(cardId: string) {
    alert('Are you sure you want to Delete this Card !');
    console.log(this.selected_customerid);
    const index = this.cardDetails.findIndex((card: any) => card.id === cardId);

    const delete_card = {
      customerid: this.selected_customerid,
      cardid: cardId,
    };
    this.userservice
      .deleteSourceCard(this.selected_customerid, cardId)
      // this.http.post<any>('http://localhost:3000/delete_source_card', delete_card)
      .subscribe({
        next: (res: any) => {
          console.log('Delete response', res);

          if (res.success === true) {
            //After delete the default card will be
            // const default_cardId = res.default_cardId
            if (res.default_cardId !== null) {
              this.cardForm.get('selectedCard').setValue(res.default_cardId);
            }
            const index = this.cardDetails.findIndex(
              (card: any) => card.id === cardId
            );
            this.cardDetails.splice(index, 1);
          }
        },
        error: (error: any) => {
          console.log('delete card from user ', error);
          this.toaster.error('Something went wrong', 'Error');
        },
        complete: () => {},
      });
  }
}
