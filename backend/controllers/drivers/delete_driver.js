const DriverModel = require('../../models/driver')
const SettingModel = require('../../models/settings')
const {totalcountDocuments}= require('./get_drivers')


const deleteDriver = async (req,res)=> {
    try {
      await SettingModel.findOne().then(async (data) => {
        stripe = require('stripe')(data.stripe_privateKey);
    }
    ).catch((error) => console.log("STRIPE",error))
        console.log("DELETE USER VISITED");
    
        const deletedDocument = await DriverModel.findByIdAndDelete(req.body._id);
        if (deletedDocument) {
          stripe.accounts.del(deletedDocument.customerid, (err, confirmation) => {
            if (err) {
              console.log(' Error deleting Stripe customer:', err);
            } else {
              console.log('Customer deleted:', confirmation);
            }
          });
          console.log("deletedDocument", deletedDocument);
          if(req.body.currentNumber){
            console.log('req.body.currentNumber',req.body.currentNumber);
          let singledata,totalCount,searchField;
          let sort;
        const { sortcol, sortval } = req.body;
        if (sortval === 0) {
          sort = null;
        } else {
          sort = {[sortcol]:sortval}
          console.log("------------------------------------------+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
        }
        const {currentNumber,currentPage,searchTerm} = req.body
        console.log('currentNumber is ;;;; ',currentNumber);
          if(req.body.searchTerm!==''){
            searchField = issearch(searchTerm)
          }else{
            searchField = {}
          }
            totalCount = await totalcountDocuments(searchField)
            singledata = await DriverModel.findOne(searchField)
            .collation({ locale: "en", strength: 2 })
            .sort(sort)
            .skip(currentNumber)
            .populate({
              path: 'dcity ccode',
              select: 'city ccallcode' 
            })
            .exec();
            return res.status(200).json({ success: true,data:singledata ,totalCount:totalCount ,message: "User Deleted Successfully" });
    
        }else{
          const totalCount = await totalcountDocuments()
          console.log("NO need to send dataaa ----------------------------------");
          return res.status(200).json({success:true,data:[],totalCount:totalCount,message:'User Deleted Successfully'})
        }
        } else {
          return res.status(201).json({ success: false, message: "User Not Found" });
        }
      } catch (error) {
        console.log("delete server->",error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
      }
}
module.exports = {deleteDriver}