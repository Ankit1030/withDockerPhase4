import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { env } from '../../../environments/environment.development';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [FormsModule,ReactiveFormsModule,CommonModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent {
  // settingForm: FormGroup;
  new_seconds:number;
  new_stops:number;
  data_id:number;
  settingForm: FormGroup;
  // approvalTime: number;
  // numberOfStops: number;
  isSubmitted: boolean = false;
  constructor(private fb: FormBuilder, private http: HttpClient,private toaster:ToastrService) {

  }

  ngOnInit() {
    this.settingForm = this.fb.group({
      stripe_privateKey: ['' ],
      stripe_publishKey: ['' ],
      twilioSid: ['' ],
      twilioAuthToken: ['' ],
      twilioNumber: ['' ],
      node_email: ['', [Validators.email]],
      node_emailPassword: ['' ],
      ride_stops: ['', Validators.required],
      ride_approvalTime: ['', Validators.required],
  });
    // this.sendDatatoServer({});
    this.getAllSettings()
    
 
 
  }
  private backendUrl = env.backendUrl;


  getAllSettings(){
    // this.http.get('http://localhost:3200/settings/getAllSettings').subscribe({
    this.http.get(`${this.backendUrl}/settings/getAllSettings`).subscribe({
      next:(res:any)=>{
        console.log("res setting",res);
        if(res.success){
          if(res.data){
            this.settingForm.setValue(res.data)
          }

          console.log("this.settingform value",this.settingForm.value);
          
        }
        
      },
      error:(error:any)=>{
        console.log("GetallSetting",error);
        
        this.toaster.error(error.message,"Error")
      },
      complete:()=>{},

    })
  }

  submitSettings() {
    if (this.settingForm.invalid) {
      this.toaster.error("Invalid or Incomplete Form Fields ","Error")
    }
      console.log(this.settingForm.value);
      this.http.post(`${this.backendUrl}/settings/updateSetting`,this.settingForm.value).subscribe({
        next:(res:any)=>{
          console.log("SUBBMIT RES",res);
          if(res.success){
            this.toaster.success(res.message,"Success")
            if(res.data){
              this.settingForm.setValue(res.data)
            }
          }
          
        },
        error:(error:any)=>{
          console.log("updateSetting",error);
          
        },
        complete:()=>{},
      })
      // Handle form submission
  }
  


}
