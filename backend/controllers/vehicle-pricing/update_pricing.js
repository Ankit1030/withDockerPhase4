const VehiclePricingModel = require('../../models/vehicle_pricing')

const  updatePricing = async (req,res) => {
    try {
        console.log("Update Pricing is called -->>");
        console.log(req.body);
      
        const {_id, driverProfit,minFare,distanceBasePrice,basePrice,pricePerUnitDistance,pricePerUnitTime,maxSpace } =req.body
          const update = await VehiclePricingModel.findByIdAndUpdate(
            {_id: _id },
            {
              $set: {
                driverProfit,minFare,distanceBasePrice,basePrice,pricePerUnitDistance,pricePerUnitTime,maxSpace
              },
            },
            { new: true }
            );
    console.log('updateupdate',update);
            if(update){
              console.log("update success",update);
              res.status(200).json({success:"updated",updateddata:update,message:"updated successfully"})
            }else{
              res.status(500).json({success:false,message:"Error on updating the edit"})
              
            }
          
        } catch (error) {
            console.log('update pricing ERror',error);
          res.status(500).json({success:false,message:"Interrnal Server Error"})
      }

}

module.exports = {updatePricing}