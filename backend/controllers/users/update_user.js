const UserModel = require('../../models/users')
const path = require('path');
const fs = require('fs');


const {deleteuserimg}= require('./save_user')


const updateUser = async (req,res) => {
    let olduser,imgflag,newimage = 0 ;
    try {
      const { uname,uemail,uphone,ccode } = req.body;
    
      if (req.file) {
        // uimage = req.file.filename;
        newimage = req.file.filename;
        console.log('newimage',newimage);
        imgflag = 1;
        const olduser1 = await UserModel.findOne({_id:req.body._id},{uimage:1})
        olduser = olduser1.uimage
      }
      
        console.log("FIND ONE AND UPDATE ROUTE");
        console.log(req.body);
        const id = req.body._id;
        const existingRecord = await UserModel.findOne({    
           $and: [
                  { _id: { $ne: id } },
                  { ccode: ccode },
                  { uphone: uphone }
                  ] 
              });
        if(existingRecord){
          if(imgflag === 1){
            deleteuserimg(newimage)
          }
          console.log("DUPLicate phone number ",existingRecord);
          res.status(401).json({success:false, message:"Phone number already exists"}) //Duplicate phone number
          return
        }
        const updatedUser = await UserModel.findByIdAndUpdate(
          { _id: id },
          {
            $set: {
              uname: uname,
              uemail:uemail,
              uphone:uphone,
              ...(req.file && { uimage: newimage}),
            },
          },
          { new: true }
          ).populate({path:'ccode',select:'ccallcode'});
          console.log('updatedUser------->>>>> ',updatedUser);

          if(updatedUser){
            if (imgflag === 1 && olduser) {
              deleteuserimg(olduser);
            
            }
            console.log("old image deleted",updatedUser);
            return res.status(200).json({success:true,data:updatedUser,message:'User Updated successfully'});
          }else{
            return res.status(404).json({success:false, message: 'User not found to update' });
          }        
        }catch (error) {
            console.log('Update',error);
            if (error.code === 11000) {
              console.log("11000",error); 
              console.log('imgflag is --->>',imgflag);
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
    }

    module.exports = {updateUser}