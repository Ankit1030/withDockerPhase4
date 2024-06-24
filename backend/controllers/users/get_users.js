const UserModel = require('../../models/users')
const getAllUsers = async (req,res) => {
    console.log("---------------<<<<<<<<<<<<<<<<<<<<<<-----------SEARCHING SORTING--ROUTE-----------------<<<<<<>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
  
    console.log(req.body);
    try {
      let sort,SearchField;
      const { currentPage, sortcol, sortval} = req.body;
      const dataPerPage = Number(req.body.dataPerPage)
      if(sortval== 0){
        sort = null;
      }else{
       sort = { [sortcol]:sortval}
        console.log('sortval is not equal to zero',sort);
      }
      console.log("------------------------------------------+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
      if(req.body.searchTerm !== ''){  //-----------------------------------------------------------------------------------------------------------------------------------
        console.log(" GOT  SEARCHTERM",req.body.searchTerm);
        const query =  req.body.searchTerm.toString().toLowerCase();
        console.log('searchterm is ',query);
        SearchField = issearch(query);  
      }else{
        SearchField = {}
      }

        console.log(" //-------------------------WHEN PAGE LOADS --------------------------------------------------------------------------------------------------------");     
        console.log(sort);
        const Result = await searchResult(SearchField,currentPage,dataPerPage,sort);
        const totalCount = await totalcountDocuments(SearchField)
        console.log(`Empty result and totalCount us ${Result} and ${totalCount}`);
        
        if(Result) {
          res.status(200).json({success:true,data:Result ,currentPage:currentPage,totalCount:totalCount,dataPerPage:dataPerPage})   
        }
        else res.status(400).json({message:"No user found Database is Empty"})
        console.log("Empty Search field.............. route is called");
        return
  
    } catch (error) {
      console.log(error);
      if (error instanceof SyntaxError && error.message.includes('Invalid regular expression')) {
        console.log('Invalid search term:');
        return res.status(400).json({ message: 'Invalid search term provided.' });
      } else {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error.' });
      }
    }
}

  async function searchResult(SearchField, currentPage, dataPerPage, sortStage) {

    console.log(`searchResult fn is called here`);
    let pipeline =[
      {
        $match: SearchField 
      },
      {
        $skip: (currentPage - 1) * dataPerPage
      },
      {
        $limit: dataPerPage
      },
      {
        $lookup: {
          from: "countries", 
          localField: "ccode", 
          foreignField: "_id",
          as: "ccode" 
        }
      },
      {
        $unwind: "$ccode"
      },
      {
        $project:{
          uname:1,
          uemail:1,
          uphone:1,
          uimage:1,
          customerid:1,
          "ccode.ccallcode":1,
          "ccode._id":1,
          user_no:1,
        }
      }
    ]
    if(sortStage !== null){
      console.log("SORT STAGE IS NOT NULLL ------------->>");
      pipeline.unshift({ $sort: sortStage })
    }
    console.log("BEFORE CALLING FN");
    const filtered_data = await UserModel.aggregate(pipeline, { collation: { locale: 'en', strength: 2 } });
    console.log("AFETER CALLING FN");
    
    console.log('filtered_data -> ',filtered_data);
  
    return filtered_data;
  }
  async function totalcountDocuments(SearchField) {
    const totalCount = await UserModel.find(SearchField).countDocuments();
    return totalCount;
  }

  function issearch(data){  // passed as a argument inside find method for search result
    return {
      $or: [
        // { sr_no: { $regex: new RegExp(data.toLowerCase(), 'i') } },
        // { $eq: parseInt(data) } }, 
        // { user_no:{ $regex: new RegExp(parseInt(data))} } ,
        { $expr: { $regexMatch: { input: { $toString: "$user_no" }, regex: new RegExp(data) } } },
        { uname: { $regex: new RegExp(data, 'i') } },
        { uemail: { $regex: new RegExp(data, 'i') } },
        { uphone: { $regex: new RegExp(data, 'i') } },
        // { _id: data },
      ]
    };
  }

  module.exports = {getAllUsers,totalcountDocuments,searchResult,issearch}