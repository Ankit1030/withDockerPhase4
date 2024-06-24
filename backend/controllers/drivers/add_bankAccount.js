const DriverModel = require('../../models/driver')
const SettingModel = require('../../models/settings')


const addBankAcc = async (req, res) => {
  try {
    console.log("addBankAcc", req.body);
    let stripe;

    await SettingModel.findOne().then(async (data) => {
      stripe = require('stripe')(data.stripe_privateKey)})
      .catch((error) => console.log("STRIPE",error))

    const { customerid, tokenid } = req.body;
    const findone = await DriverModel.findOne({ customerid: customerid })
            console.log('findone-->',findone);
            if(findone && findone.bankstatus == true){
              return res.status(200).json({success:true,message:"This Driver has allready added Bank Account"})
            } 
    const bankAccount = await stripe.accounts.createExternalAccount(customerid, {
      external_account: tokenid
    });
    console.log('Success bankAccountLinked Stripe->>', bankAccount);
   
    if (!bankAccount) {
      return res.status(200).json({ success: false, message: "Error while linking Bank Account" })
    }
    const updateDriverBankFlag = await DriverModel.findOneAndUpdate({ customerid: customerid }, { $set: { bankstatus: true } })
    return res.status(200).json({ success: true, message: "Bank Account Cerated Successfullt", data: { bankstatus: findone.bankstatus } })

  } catch (error) {
    console.log("DriverAddBankAcc", error);
    // res.send("Error che bhai Kyaak")
    res.status(500).json({ success: false, message: "Internal Server Error" })
  }
}



module.exports = { addBankAcc }