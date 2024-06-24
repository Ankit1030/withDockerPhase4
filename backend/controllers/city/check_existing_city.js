const CityModel = require('../../models/city_zone');

const verifyExistingCity = async(req,res)=>{
    console.log("---------Verify the Existing City name already exists--------------- "); 
    try {
      const {city} = req.body
      const existingCity = await CityModel.findOne({ city });
      console.log(existingCity);
      if(existingCity){
        return res.status(200).json({success:true,data:existingCity,message:'City already exists in DB'})
      }else{
        return res.status(200).json({success:false,message:'No matching Data found'})
      }
    } catch (error) {
      console.log('findOne CityModel_err :',error);
      return res.status(500).json({success:false,message:'Internal Server Error'})
    }
  }  


  module.exports = {verifyExistingCity}