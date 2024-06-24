const UserModel = require('../../models/users')
const SettingModel = require('../../models/settings')

const mongoose  = require('mongoose')
const path = require('path');
const fs = require('fs');


const {totalcountDocuments,searchResult}= require('./get_users')
const saveUser = async (req,res) => {
    let imgflag,newimage = 0 ;
    try {
      const { uname,uemail,uphone } = req.body;
      const ccode = new mongoose.Types.ObjectId(req.body.ccode)
      if (req.file) {
        // uimage = req.file.filename;
        newimage = req.file.filename;
        console.log('newimage',newimage);
        imgflag = 1;
      }
      const existingRecord = await UserModel.findOne({ ccode, uphone });
      if(existingRecord){
        if(imgflag === 1){
          deleteuserimg(newimage)
        }
        console.log("DUPLicate phone number ",existingRecord);
        res.status(401).json({success:false, message:"Phone number already exists"}) //Duplicate phone number
        return
      }

      console.log(req.body);
      console.log(req.file);
      
      console.log("NEW -------------- USER Submits new data VISITED --------------->>>>>>>>>>>>>");
      // const {sr_no }= req.body;
      const dataPerPage = Number(req.body.dataPerPage)
      const currentPage = Number(req.body.currentPage)
      console.log(dataPerPage,currentPage );
      console.log("NEW -------------- USER Submits new data VISITED --------------->>>>>>>>>>>>>");
      
      const totalData = await totalcountDocuments({})
      
      const newUser = new UserModel({ uname,uimage:newimage,uemail,uphone,ccode})
      console.log(newUser);
      const saved = await newUser.save();
      
      console.log('totalData',totalData);
      console.log(Math.ceil((totalData + 1) / dataPerPage));
      const newPageNumber = Math.ceil((totalData + 1) / dataPerPage);
      console.log('newPageNumber',newPageNumber);
     
      if(saved){
        let stripe;
        await SettingModel.findOne().then(async (data) => {
          stripe = require('stripe')(data.stripe_privateKey);
      }
      ).catch((error) => console.log("STRIPE",error))

        console.log('USER SAVED AND CUSTOMER TURNS START------------------------------->>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
        const customer = await stripe.customers.create({
          email: uemail,
          name: uname
        });
        console.log("User customer",customer);
        let addcardtocustomer=null;
        if(customer){
          console.log('customer',customer);
          const {id }= customer;
           addcardtocustomer = await UserModel.findByIdAndUpdate(
            { _id: saved._id}, // Filter criteria
            { $set: { customerid: id } }, // Update operation to set 'age' field to 30
            { new: true } // Option to return the modified document
        ).populate({path:'ccode',select:'ccallcode'}); 
       
        console.log('addcardtocustomer-->',addcardtocustomer);
        }
        if(currentPage == newPageNumber){
          res.status(200).json({success:true,currentPage:currentPage ,data:addcardtocustomer,message:'User saved successfully'});
          return
        }else{
          const alltable = await searchResult({},newPageNumber,dataPerPage,null)
          console.log("----------------------------------------------------------------------------------------------");
          console.log('alltable',alltable);
          res.status(200).json({success:true,data:alltable,currentPage:newPageNumber,message:'User saved successfully'});
          return
        }
             
        
      }
      else{
        res.status(500).json({success:false,message:"Failed to save User"});
        return
      }
    }catch (error) {
        console.log('SAVE USER',error);
        if (error.code === 11000) {
          console.log("11000",error); 
          if (imgflag === 1 && newimage) {
            deleteuserimg(newimage);
          }

          const duplicateKeyError = {
            message: 'Duplicate email or phone already in USE',
            code: 'DUPLICATE_KEY',
            duplicateKeyDetails: error.keyPattern,
          };
          
          res.status(401).json({success:false,message:"duplicate" ,error: duplicateKeyError });
          return;
        }
        
        res.status(500).json({message:error});
      }
      // const {  uname,uemail, ccode, uphone}= req.body;
      
    
}
// const allusers_folder_path = path.join(__dirname, '../uploads/allusers');
const allusers_folder_path = path.join(__dirname, '../../uploads/allusers');
function deleteuserimg(filename){
    console.log("Deleteimg is called");
    const imagePath = path.join(allusers_folder_path, filename);
  
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.log(`Error deleting image: ${err.message}`);
        } else {
          console.log(`Image '${filename}' deleted successfully.`);
        }
      });
  }

  module.exports = {saveUser,deleteuserimg}