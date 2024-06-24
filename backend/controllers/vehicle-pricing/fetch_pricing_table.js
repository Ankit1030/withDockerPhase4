const VehiclePricingModel = require('../../models/vehicle_pricing')


const get_all_pricing = async (req,res) => {
    try {
      console.log("get all pricing is called now ------------------------");
        console.log("ALLDATA -> visited  all pricing");
        const pipeline =  [{
          $lookup:{
            from:'countries',
            localField:'countryid',
            foreignField:'_id',
            as:'countryObject'
          }
        },
        {
          $lookup:{
            from:'cityzones',
            localField:'cityid',
            foreignField:'_id',
            as:'cityObject'
          }
        },
        {
          $lookup:{
            from:'vehicles',
            localField:'vehicleid',
            foreignField:'_id',
            as:'vehicleObject'
          }
        },
        {
          $project: {
            driverProfit : 1,
            minFare : 1,
            distanceBasePrice : 1,
            basePrice : 1,
            pricePerUnitDistance : 1,
            pricePerUnitTime : 1,
            maxSpace : 1,
            countryid: 1,
            cityid: 1,
            vehicleid: "$vehicleObject.vname" ,
            countryid: "$countryObject.cname",
            cityid: "$cityObject.city" 
          }
        }
      ]
          const alldata = await VehiclePricingModel.aggregate(pipeline) 
          return res.status(200).json({success:true, alldata:alldata,message:"all data fetched successfully"})
          
      } catch (error) {
        return res.status(500).json({success:false,error:"Server Error get all pricing "})
        
      }
}
module.exports = {get_all_pricing}