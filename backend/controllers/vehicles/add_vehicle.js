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

const addVehicle = async (req,res)=>{
    let filename;
    try {
        console.log("addVehicle route us visited successfully");
        const {vname}  = req.body;
        filename  = req.file.filename;
        const newvehicle = new VehicleModel({ vname, vimage: filename });
        const savedvehicle = await newvehicle.save();
        res.status(201).json({ success: true, data: savedvehicle,message: 'Vehicle added successfully.' });
        return
    } catch (error) {
        console.log('addVehicle error is->',error);
        if (error.code === 11000) {
            res.status(401).json({ success: false, message: 'Duplicate Vehicle Name' });
        } else {
            console.log("addVehicle catch > Else ",error.code);
            // Other errors
            console.log(' Not saved vehicle to DB :', error);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
        return
        //------------------------------------------------------------        
    if(filename) deleteimg(filename)              
    } 
}
module.exports = addVehicle