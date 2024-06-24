const VehiclePricingModel = require('../../models/vehicle_pricing')

const saveNewVehiclePricing = async (req,res) => {
    try {
        const { countryid, cityid,vehicleid, driverProfit,minFare,distanceBasePrice,basePrice,pricePerUnitDistance,pricePerUnitTime,maxSpace}= req.body
        const allreadyaddedPricing = await VehiclePricingModel.findOne({cityid:cityid,vehicleid:vehicleid})
        if(allreadyaddedPricing){
            return res.status(401).json({message:"Pricing for this vehicle in this city already added"});
        }
        const newpricing = new VehiclePricingModel({...req.body})
        const saved = await newpricing.save()
        if(saved){
          console.log("SUCCESS ---> SAVED TO DB");
          res.status(200).json({success:true, _id : saved._id ,message:"New Pricing saved successfully"})
          return
        } 
        
    } catch (error) {
        console.log("SAVE pricing catcj Error",error);
        res.status(500).json({success:false,error:"Internal Server Error "})

    }

}
module.exports = {saveNewVehiclePricing}