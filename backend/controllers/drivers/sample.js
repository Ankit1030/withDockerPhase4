const DriverModel = require('../../models/driver')
const SettingModel = require('../../models/settings')



const sampleDriver= async(req,res)=>{
    try {
      await SettingModel.findOne().then(async (data) => {
        stripe = require('stripe')(data.stripe_privateKey);
    }
    ).catch((error) => console.log("STRIPE",error))

        const {customerid,tokenid} = req.body;
       const res1 = await isDefaultCard3DSecure(customerid)
       const link = await stripe.paymentIntents.create({
           amount: 1000, // Amount in cents
           customer:customerid,
           currency: 'usd',
           payment_method_types: ['card'],
           payment_method: 'card_1PLnz9A9DbTl3x7cH9X8j3Kv', // Use the ID of the default source
        })
        const bookRidePaymenttype = 'card';
        if(bookRidePaymenttype === 'card' && res1){
            
        }
           res.send(link)
    //    const create = await stripe.accounts.create({
    //         type: 'custom',
    //         country: 'US',
    //         email: 'example@example.com',
    //         business_type: 'individual',
    //         individual: {
    //           first_name: 'John',
    //           last_name: 'Doe',
    //           email: 'john.doe@example.com',
    //           phone: '+18887776666', // Use the valid test phone number
    //           dob: {
    //             day: 1,
    //             month: 1,
    //             year: 1980,
    //           },
    //           address: {
    //             line1: '123 Main St',
    //             city: 'Anytown',
    //             state: 'CA',
    //             postal_code: '12345',
    //             country: 'US',
    //           },
    //         //   verification: {
    //         //     document: {
    //         //       front: 'file_12345',
    //         //       back: 'file_67890',
    //         //     },
    //         //   },
    //         },
    //         business_profile: {
    //           mcc: '5734',
    //           url: 'https://www.elluminatiinc.com/',
    //         },
    //         tos_acceptance: {
    //           date: Math.floor(Date.now() / 1000),
    //           ip: '192.168.1.1',
    //         },
    //         capabilities: {
    //           card_payments: {
    //             requested: true,
    //           },
    //           transfers: {
    //             requested: true,
    //           },
    //         },
    //       });
    // const create = await stripe.accounts.del(customerid)

    //       res.send(create)
    
    } catch (error) {
    console.log("SAMPLE DRIVER",error);       
    }
}
module.exports = {sampleDriver}