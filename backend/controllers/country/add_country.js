const CountryModel = require('../../models/country');

 const addCountry = async (req, res) => {
    try {
      console.log(req.body);
      const { cname, ccurr, ccode, ccallcode,tzone,flag } = req.body;

      const matchedData = await CountryModel.findOne({
        $or: [
          { cname: cname },
          { ccurr: ccurr },
          { ccode: ccode },
          { ccallcode: ccallcode }
        ]
      });

      if(matchedData){
        return res.status(409).json({success:false, message:'The Country Data is already exists'})
      }
      const newCountry = new CountryModel({cname,ccurr,ccode,ccallcode,tzone,flag});
      const savedCountry = await newCountry.save();
      res.status(201).json({success:true, data:savedCountry});
      
    } catch (error) {
      console.log(error);
    if(error.code === 11000) {
      return res.status(409).json({ success: false, message: 'The Country Data is already exists.' });
  } else{
      console.log('Error saving country:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
    
}}

module.exports = addCountry;
