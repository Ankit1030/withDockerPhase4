const Setting = require('../models/settings');
const SettingModel = require('../models/settings')
const express = require('express');
const router = express.Router();

// const updateSetting  = async (req,res)=>{
//     try {
//         if(req.body && JSON.stringify(req.body) === '{}'){
          
//           console.log("ALL SETTINGS");
//           const previousSetting = await SettingModel.findOne()
//           console.log(previousSetting);
//           if(previousSetting){
    
//             res.status(200).json({success:true,data:previousSetting})
//           }else{
//             res.status(200).json({success:false,message:"Empty"})
//           }
//           return
//         }
//        console.log("--------------------------------------------------");
//        console.log(req.body);
//        console.log("--------------------------------------------------");
    
//         const { seconds, ride_stops } =req.body 
//         if(req.body._id){
//           const {_id } =req.body 
          
//           const update = await Setting.findByIdAndUpdate(
//           {_id: _id },
//           {
//             $set: {
//               seconds,ride_stops
//             },
//           },
//           { new: true }
//           );
    
//           if (update) {
//             console.log('Settings saved successfully:', update);
//             res.status(200).json({success:true,data:update});
//           }
//           else {
//             console.log("Error occurred while saving settings");
//             console.log('Error occurred while saving settings:', err);
//             res.status(500).json({ error: 'Error while saving settings.' });
//           }
//         }else{
//           //To save the first value
//           const newsave = new Setting({
//             seconds,
//             ride_stops
//           })
//           const status = await newsave.save();
//           if(status){
//             res.status(200).json({success:true,data:status});
//           }
         
//         }
        
//       } catch (error) {
        
//         res.status(500).json({ error: 'An error occurred while saving settings.' });
//       }
// }

const getAllSettings =async (req,res)=>{
  try {
    const alldata = await SettingModel.findOne().select('-_id -__v')
    if(!alldata){
      return res.status(404).json({success:false,message:"Unable to get the data From DB"})
    }
    res.status(200).json({success:true,data:alldata,message:"All setting data received successfully"})
    
  } catch (error) {
    console.log("GEt all settttinf error",error);
    res.status(500).json({success:false,message:'Internal Server Error'})
  }
}

const updateNewSettings = async(req,res)=>{
  try {
    const { stripe_privateKey,stripe_publishKey,twilioSid,twilioAuthToken,twilioNumber,node_email,node_emailPassword,ride_stops,ride_approvalTime} = req.body
    console.log("req.body",req.body);
    if ( Number(ride_stops) > 6 ||  Number(ride_approvalTime) > 300 ) {
      return res.status(400).json({success:false, message: 'Incomplete required data or Invalid Data' });
    }
    console.log("updatenew settomngs");
    const length = await SettingModel.countDocuments()
    if(length != 0){
     
      const update = await SettingModel.findOneAndUpdate({},{
        stripe_privateKey:stripe_privateKey,
        stripe_publishKey:stripe_publishKey,
        twilioSid:twilioSid,
        twilioAuthToken:twilioAuthToken,
        twilioAuthToken:twilioAuthToken,
        twilioNumber:twilioNumber,
        node_email:node_email,
        node_emailPassword:node_emailPassword,
        ride_stops:Number(ride_stops),
        ride_approvalTime:Number(ride_approvalTime),
      },{new:true}).select('-_id -__v')
      return res.status(200).json({success:true,data:update,message:"Settings saved successfully"})
      
    }else{
      // Create a new document to save new data
      const newData = new SettingModel({
        stripe_privateKey:stripe_privateKey,
        stripe_publishKey:stripe_publishKey,
        twilioSid:twilioSid,
        twilioAuthToken:twilioAuthToken,
        twilioNumber:twilioNumber,
        node_email:node_email,
        node_emailPassword:node_emailPassword,
        ride_stops:Number(ride_stops),
        ride_approvalTime:Number(ride_approvalTime),
      })
      console.log("NEW DATAAAA",newData);
      const status = await newData.save();
      console.log("STATUSS ",status);
      delete status._id;
      delete status.__v;
      if(!status){

       return res.status(500).json({success:false,message:"Unable to save Settings data"})
      }
      return res.status(200).json({success:true,data:status,message:"Settings saved successfully"})
      
    }
  } catch (error) {
    console.log("updatenewSetting",error);
    return res.status(500).json({success:false,message:"Internal server error"})
  }
}
router.get('/getAllSettings',getAllSettings)
router.post('/updateSetting',updateNewSettings)

// router.post('',updateSetting)

module.exports = router