const UserModel = require('../../models/users')


const {issearch,totalcountDocuments} = require('./get_users')


const deleteUser = async (req,res)=> {
    try {
        console.log("DELETE USER VISITED");
        await SettingModel.findOne().then(async (data) => {
          stripe = require('stripe')(data.stripe_privateKey);
      }
      ).catch((error) => console.log("STRIPE",error))

        const deletedDocument = await UserModel.findByIdAndDelete(req.body._id);
        if(deletedDocument){
          
          stripe.customers.del(deletedDocument.customerid, (err, confirmation) => {
            if (err) {
              console.log(' Error deleting Stripe customer:', err);
            } else {
              console.log('Customer deleted:', confirmation);
            }
          });

          if(req.body.currentNumber){
          //-----------------------SEND SINGLE DATA--------------------
          let singledata,totalCount,searchField;
          let sort ;
        const { sortcol, sortval } = req.body;
        if (sortval === 0) {
          sort = null;
        } else {
          // sort = {};
          // sort[sortcol]= sortval
          sort = {[sortcol]:sortval}
          console.log('sort-------------------->>> ', sort)
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
            singledata = await UserModel.findOne(searchField)
            .collation({ locale: "en", strength: 2 })
            .sort(sort)
            .skip(currentNumber)
            .populate({
              path: 'ccode',
              select: 'ccallcode' 
            })
            .exec();
          
          console.log('deletedDocument',deletedDocument);
          res.status(200).json({success:true,data:singledata,totalCount:totalCount,message:'User Deleted Successfully'})
        }else{
          const totalCount = await totalcountDocuments()
          console.log("NO need to send dataaa ----------------------------------");
          res.status(200).json({success:true,data:[],totalCount:totalCount,message:'User Deleted Successfully'})

        }
        }else{
          res.status(201).json({success:false,message:'User Not Found'})
          return
          
    }
  } catch (error) {
    res.status(500).json({success:false,message:'Internal Server Error'})
    
  }
}
module.exports = {deleteUser}