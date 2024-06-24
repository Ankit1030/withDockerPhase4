 const VehicleModel = require('../../models/vehicletype')
//  const mongoose = require('mongoose');
 
 const getAllVehicles = async (req,res)=>{
    try {
      console.log();
      const allvehicles = await VehicleModel.find()
      console.log(allvehicles);
      return res.status(200).json({data:allvehicles,success:true})
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
    }
    module.exports = getAllVehicles;