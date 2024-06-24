const DriverModel = require('../../models/driver')
const mongoose = require('mongoose')
const path = require('path');
const fs = require('fs');


const {deletedriverimg}= require('./save_driver')


const updateDriver = async (req,res) => {

    let olduser,newimage,imgflag=0;
    console.log("UPDATE DRIVER ISCALLED ---------");
    try {
        console.log('req.body',req.body);
// return
      const { dname, demail, dphone,dcity,ccode } = req.body;
  
    //   const dcity = new mongoose.Types.ObjectId(req.body.dcity)
    //   const ccode = new mongoose.Types.ObjectId(req.body.ccode)
  
      console.log({dcity,ccode});
      
      if (req.file) {
        // dimage = req.file.filename;
        newimage = req.file.filename;
        console.log('newimage',newimage);
        imgflag = 1;
        const olduser1 = await DriverModel.findById({_id:req.body._id},{dimage:1})
        olduser = olduser1.dimage
  
      }
        console.log('req.body',req.body);
        const id = req.body._id;
        const existingRecord = await DriverModel.findOne({
          $and: [
            { _id: { $ne: id } }, // Exclude the document with the provided userId
            { ccode: ccode },
            { dphone: dphone },
          ],
        });
  
        if (existingRecord) {
          if(imgflag === 1){
            deletedriverimg(newimage)
          }
          console.log("DUPLicate phone number ", existingRecord);
          res
            .status(401)
            .json({ success: false, message: "Phone number already exists" }); //Duplicate phone number
          return;
        }
        console.log("FIND ONE AND UPDATE ROUTE");
        console.log(req.body);
        const existingUser = await DriverModel.findById(id);
        

// if (existingUser) {
  const updates = {
    dname: dname,
    demail: demail,
    dphone: dphone,
    // dcity: new mongoose.Types.ObjectId(dcity) ,
    ...(req.file && { dimage: newimage }),
  };
console.log('THis dcity',dcity);
  // Check if the dcity is unchanged
  if (existingUser.dcity !== dcity) {
    updates.dcity = new mongoose.Types.ObjectId(dcity)
    updates.servicetype = null;
  }else{

  }
  console.log("UPDATE PIPELINE->",updates);
        const updatedUser = await DriverModel.findByIdAndUpdate(
          { _id: id },
          {
            $set:updates,
          },
          { new: true }
        ).populate({
          path: 'dcity ccode servicetype',
          select: 'city ccallcode vname' 
        })
        // .populate({
        //   path: 'ccode',
        //   select: 'ccallcode' 
        // });
        console.log("updatedUser------->>>>> ", updatedUser);
        if (updatedUser) {
          if (imgflag === 1 && olduser) {
            deletedriverimg(olduser);
          }
          console.log("old image deleted", updatedUser);
          res.status(200).json({
            success: true,
            data: updatedUser,
            message: "User Updated successfully",
          });
        } else {
          res
            .status(500)
            .json({ success: false, message: "User Not updated Server Error" });
        }
    
      
  } catch (error) {
    console.log("Update driver", error);
    if (error.code === 11000) {
      console.log("11000", error);
      if (imgflag === 1 && newimage) {
        deletedriverimg(newimage);
      }
      const duplicateKeyError = {message: "Duplicate email or phone already in USE",code: "DUPLICATE_KEY",duplicateKeyDetails: error.keyPattern};
      console.log("401Error --------------------------------");
      return res.status(401).json({success: false,message: "duplicate",error: duplicateKeyError,});
    }
    return res.status(500).json({ success: false, message: error });
  }
}

module.exports = {updateDriver}