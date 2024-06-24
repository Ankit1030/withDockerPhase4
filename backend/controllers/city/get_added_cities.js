const CityModel = require('../../models/city_zone');
const mongoose = require('mongoose')


const getAllreadyAddedCities = async (req,res) => {
    console.log("Visited getAllreadyAdded Cites ------------------------------------");
    try {
        console.log('getCityModel - visited');
        console.log(req.body);
        const selected_country_id = new mongoose.Types.ObjectId(req.body._id)
        const all_inside_cities = await CityModel.aggregate([
          {
            $match: {
              countryid: selected_country_id 
            }
          },
          {
            $group: {
              _id: "$countryid", 
              allcities: { 
                $push: {
                  _id: "$_id", 
                  city: "$city" 
              }
              } 
            }
          },
          {
            $project: {
              _id: 0, 
              countryid: "$_id", 
              allcities: 1 
            }
          }
        ]);
        console.log("Allinside cities  IS -------------  SS ",all_inside_cities);
        if(all_inside_cities.length !== 0){
            const data = all_inside_cities[0].allcities;
            return res.json({success:true,data:data});
        }else{
          return res.json({success:true,data:[],message:"No City Zones Created in this country"});       
        }
      } catch (error) {
        console.log(error);
        return res.status(500).json({success:false, message: "Internal Server Error" });
      }
}

module.exports = {getAllreadyAddedCities}