const VehiclePricingModel = require('../../models/vehicle_pricing')
const DriverModel = require('../../models/driver')
const availableService = async (req,res) => {
    try {
        console.log("/------Send the service of the driver---------------------------------------------");
          const { _id } = req.body;
          const selected_service = await DriverModel.findById(
            { _id },
            { servicetype: 1 ,dcity:1}
          );
          console.log('selected_service------ >',selected_service);
          const cityidofdriver = selected_service.dcity
          console.log('cityidofdriver------ >',cityidofdriver);
        const allvehicles = await VehiclePricingModel.aggregate(
          [ {
            $match: {
              cityid : cityidofdriver
            }
          },
          {
            $group: {
              _id: "$cityid", 
              allVehiclesArray: { $push: "$vehicleid" }
            }
          },
          {
            $lookup: {
              from: "vehicles",
              localField: "allVehiclesArray",
              foreignField: "_id",
              as: "allVehiclesArray"
            }
          }
         ]
        );
        console.log('selected_service->',selected_service);
        console.log('allvehicles ->>',allvehicles);

        if(allvehicles.length !== 0){
          return res.status(200).json({success: true,allvehicles:allvehicles[0].allVehiclesArray,data: selected_service,message: "Allready selected service received successfully"});
          
        }else{
          return res.status(200).json({success: true,allvehicles:[],message: "No vehicle Services available in this City"}); 
        }
    
      } catch (error) {
        console.log("clicked_driver_status Error",error);
        return res.status(500).json({ success: false, message: error });
      }
}
module.exports = {availableService}