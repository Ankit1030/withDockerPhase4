import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { loadStripe } from '@stripe/stripe-js';

@Component({
  selector: 'app-sample',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './sample.component.html',
  styleUrl: './sample.component.css'
})
export class SampleComponent {

  constructor(
    private http:HttpClient,
    // private stripePublicKey:tring= 'pk_test_51PKFnuA9DbTl3x7cOh2yVgk4GLO2FUV8ozgk38gVI0vdDjx1gUWw4LiGMgnxAQsz90osPzQP1xkANmZzmnNRemG800RuF9gNST',
    
  ){}
  stripe: any;
  elements: any;
  bankAccount: any;

  async ngOnInit() {
    this.stripe = await loadStripe('pk_test_51PKFnuA9DbTl3x7cOh2yVgk4GLO2FUV8ozgk38gVI0vdDjx1gUWw4LiGMgnxAQsz90osPzQP1xkANmZzmnNRemG800RuF9gNST'); // Replace with your publishable key

    const elements = this.stripe.elements();
    const style = {
      base: {
        color: '#32325d',
        lineHeight: '24px',
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        '::placeholder': {
          color: '#aab7c4'
        }
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a'
      }
    };

    this.bankAccount = elements.create('iban', { style });
    this.bankAccount.mount('#bank-account-element');
  }

  async createBankAccountToken() {
    const { token, error } = await this.stripe.createToken(this.bankAccount);

    if (error) {
      console.error(error);
    } else {
      const customerId = 'cus_test_customer_id'; // Replace with actual customer ID
      this.http.post('/create-bank-account', { customerId, bankAccountToken: token.id })
        .subscribe(response => {
          console.log('Bank account added:', response);
        }, error => {
          console.error('Error adding bank account:', error);
        });
    }
  }
  
}
