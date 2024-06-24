// router.put('/updateVehicle/:id' ,upload,
const VehicleModel = require('../../models/vehicletype')
const path = require('path')
const fs = require('fs')

function deleteimg(filename){
    const vehicle_folder_path = path.join(__dirname, '../../uploads/vehicles');
    console.log("Deleteimg is called");
    const imagePath = path.join(vehicle_folder_path, filename);
  
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.log(`Error deleting image: ${err.message}`);
        } else {
          console.log(`Image '${filename}' deleted successfully.`);
        }
      });
  }

  
 const updateVehicle = async (req, res) => {
    let imagepath,olduserdata;
   try {
    console.log("UPDATE vehicle route VISITED ------------------------------------------------------------------------------------------------");
    const id = req.params.id; // Extract vehicle ID from request parameters
    const { vname } = req.body; 
    if(req.file){
      imagepath = req.file.filename;
      olduserdata = await VehicleModel.findOne({ _id : id})
      // deleteimg(olduserdata.image)
      console.log(`OLD uPDATE USER IMAGE DATAis:- ${olduserdata}`);
    }
    const updatedUser = await VehicleModel.findByIdAndUpdate(
      { _id: id },
      {
        $set: {
          vname: vname,
          ...(req.file && { vimage: imagepath}),
        },
      },
      { new: true }
      );

      if (!updatedUser) {
        return res.status(404).json({success:false, message: 'Vehicle not found' });
      }
        if(req.file){
          deleteimg(olduserdata.vimage)
        }
        console.log(updatedUser);
        res.status(200).json({success:true,data:updatedUser,message:':) Vehicle updated Successfully '})
   
    } catch (error) {
      console.log("Vehicle type error ");
      
      if (error.code === 11000) {
        if(req.file){
          deleteimg(imagepath)
        }
        console.log(error.code);
    
        res.status(401).json({ success: false, message: 'Duplicate vehicle name.' });
    } else {
          console.log("else ",error.code);
       
        console.log(' Not saved vehicle to DB :', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
      }
    }}

    module.exports = updateVehicle;