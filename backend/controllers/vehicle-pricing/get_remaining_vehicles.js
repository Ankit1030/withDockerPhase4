const VehiclePricingModel = require('../../models/vehicle_pricing')
const VehicleModel = require('../../models/vehicletype')
const mongoose = require('mongoose')

const getRemainingVehicles = async (req,res) => {
    try {
        console.log('req.body-> ',req.body);  
        const cityId = new mongoose.Types.ObjectId(req.body.cityid)
        const results = await VehiclePricingModel.findOne({ cityid: cityId }).exec();
        console.log('results is -->',results);
        if(!results){
          console.log("NO MATCHING DATA FOUND ---++++++++++++++++++++++");
          const allvehicles = await VehicleModel.find({},{vname:1})
          console.log('allvehicles',allvehicles);
          res.status(200).json({success:true,message:'Remaining city list is received',data:allvehicles})
         return
    }
 

        const result = await VehiclePricingModel.aggregate([
          {
            $match: {
              cityid: cityId ,
          }
          },
          {
            $group: {
              _id:"$cityid" ,
              vehicletypes:{ $addToSet: "$vehicleid" } 
            }
          },
          {
            $project: {
              _id: 0,
              vehicletypes:1
            }
          },
          {
            $lookup: {
              from: "vehicles",
              let: { vehicletypes: "$vehicletypes" },
              pipeline: [
                {
                  $match: {
                     $expr: { $not: { $in: ["$_id", "$$vehicletypes"] } }
                  }
                },
                {
                  $project: {
                    _id: 1,
                    vname: 1
                  }
                }
              ],
              as: "unmatchedDocuments"
            }
          },
          {
            $project: {
              _id: 0,
              unmatchedDocuments: 1
            }
          }
        ])
        const finalresult = result[0].unmatchedDocuments
        console.log(result);
        return res.status(200).json({success:true,message:'Remaining city list is received',data:finalresult})
        
      } catch (error) {
        console.log(error);
        return res.status(500).json({success:false, message: 'Internal Server Error' });
      }
}

module.exports = {getRemainingVehicles}