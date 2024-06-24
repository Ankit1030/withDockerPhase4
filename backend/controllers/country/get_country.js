const CountryModel = require('../../models/country');
function regex(sterm)  {
  return  {$or: [
    // { $expr: { $regexMatch: { input: { $toString: "$country_no" }, regex: new RegExp(sterm) } } },

      { cname: { $regex: new RegExp(sterm, 'i') } },
      { ccurr: { $regex: new RegExp(sterm, 'i') } },
      { ccode: { $regex: new RegExp(sterm, 'i') } },
      { ccallcode: { $regex: new RegExp(sterm, 'i') } },
      { tzone: { $regex: new RegExp(sterm, 'i') } },
     ]
    }}
// To fetch the all countries on pageload and search results both 
 const getAllCounties = async (req, res) => {
    console.log("GET all countries-------------------------------------");
    try {
        let search;
      
        if(req.body.sterm !== ''){
          const sterm = req.body.sterm;
          search = regex(sterm)
        }else{
          search = {}
        }
      console.log('search is ',search);
      const data = await CountryModel.find(search);
      console.log('data searchcountry',data);
      if(data.length != 0){
        return res.status(200).json({data:data,success:true,message:'allcountries'});
      } 
      return res.status(200).json({data:null,success:true,message:'No matching countries'});
    } catch (error) {
      console.log('Error fetching country data:', error);
      return res.status(500).json({success:false, message: error });
    }
 }

 
module.exports = getAllCounties;