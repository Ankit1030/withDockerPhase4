const UserModel = require('../../models/users')
const SettingModel = require('../../models/settings');



const getDefaultCardDetails = async (req,res) => {
    console.log("//get_default_carddetails",req.body);
    try {
      await SettingModel.findOne().then(async (data) => {
        stripe = require('stripe')(data.stripe_privateKey);
    }
    ).catch((error) => console.log("STRIPE",error))

      const customerId = req.body.customerid;
      const cards = await stripe.paymentMethods.list({
        customer: customerId,
        type: 'card',
      });

      const customer = await stripe.customers.retrieve(customerId);
      const default_card = customer.default_source;
      console.log('cards -> ',cards);
      if(default_card){

        res.status(200).json({success:true, default_card:default_card,cardDetails:cards.data})
        return default_card
      }else{
        
        res.status(200).json({success:true, default_card:'not found',cardDetails:cards.data})
      }
      return
      
      console.log("all cards are");
      // return cards.data; // Return an array of card objects
      
      
      
    } catch (error) {
      console.log('Error retrieving customer cards:', error);
      res.status(201).json({error:error,message:'get_default_carddetails Catch Error'})
      throw error;
    }
    
}

//------------2 addCardToCustomer---------------------------------------------------------------------------

const addCardToCustomer = async (req,res) => {
    console.log("***********************--   addCardToCustomer  ---------------------------****************************");
    console.log(req.body);
    try{
      const {customerid, tokenid} = req.body;

      await SettingModel.findOne().then(async (data) => {
        stripe = require('stripe')(data.stripe_privateKey);
    }
    ).catch((error) => console.log("STRIPE",error))
      // const charge = await stripe.charges.create({
      //   amount: 999999, // Amount in cents ($20.00)
      //   currency: 'usd',
      //   source: tokenid, // Use the 4000000000000077 test card
      //   description: 'Adding funds to Stripe account balance',
      // });
      // console.log('charge',charge);
      const carddata = await stripe.customers.createSource(customerid, {
        source: tokenid
      });
      // console.log();
      console.log('Card added to customer:', carddata);
      res.status(200).json({success:true , message:"New card details saved successfully", data:carddata})
      
  
    }catch(error){
      console.log("addcardToCustomer Stripe error",error);
      
    }
}

const setDefaultCard = async(req,res) => {
    try {
        const { customerid, cardId } = req.body;
        await SettingModel.findOne().then(async (data) => {
          stripe = require('stripe')(data.stripe_privateKey);
      }
      ).catch((error) => console.log("STRIPE",error))
        // Update the customer's default payment source
        const customer = await stripe.customers.update(customerid, {
          default_source: cardId
        });
        
        if(customer){
          
          res.status(200).json({ success: true, message: 'Default source set successfully' });
          return
        }else{
          
          res.status(500).json({ success: false, message: 'Error setting default source' });
        }
        
      } catch (error) {
        console.log('Error setting default source:', error);
        res.status(500).json({ success: false, message: 'Error setting default source' });
    }
}


const deleteSourceCard = async(req,res) => {
    try {
      await SettingModel.findOne().then(async (data) => {
        stripe = require('stripe')(data.stripe_privateKey);
    }
    ).catch((error) => console.log("STRIPE",error))

        console.log('/delete_source_card',req.body);
        const {customerid, cardid} = req.body;
        const deletedSource = await stripe.customers.deleteSource(customerid, cardid);
        const customer = await stripe.customers.retrieve(customerid);
        const default_cardId = customer.default_source;
        if(deletedSource.deleted === true){
            console.log('Deleted after recedue',customer);
            res.status(200).json({success:true,default_cardId:default_cardId})
        }
        return
    } catch (error) {
        console.log("Delete source error",error);
        res.status(500).json({ success: false, message: 'Something went wrong Server Error' });
      }
}
module.exports = {getDefaultCardDetails, addCardToCustomer, setDefaultCard, deleteSourceCard }