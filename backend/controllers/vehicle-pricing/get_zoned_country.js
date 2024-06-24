const CityModel = require('../../models/city_zone');
// To get the countries which had zones created in it
const getZonedAllCountry = async(req,res) => {

    try {
        const allcountries = await CityModel.aggregate([
            {
                $group:{
                    _id:"$countryid"
                }
            },
            {
                $lookup: {
                  from: "countries",
                  localField: "_id",
                  foreignField: "_id",
                  as: "countryid"
                }
            },
            {
                $unwind: "$countryid"
            },
        ])
        if(allcountries){
            res.status(200).json({data:allcountries,success:true,message:'allcountries'});
            return
        }else{
            
            res.status(500).json({success: false,message:"Internal Server Error"})
            return

        }
    } catch (error) {
        console.log("inside city countries Error",error);
        res.status(500).json({success: false,message:"Internal Server Error"})
    }   
}
module.exports = {getZonedAllCountry}