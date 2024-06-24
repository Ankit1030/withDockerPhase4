const DriverModel = require('../../models/driver')

const getAllDrivers = async (req,res) => {
    try {
        let sortStage,SearchField;
        const { currentPage, sortcol, sortval} = req.body;
        const dataPerPage = Number(req.body.dataPerPage);

        if (sortval === 0) {
        console.log("sortStage us {} null object");
        sortStage = null;
        }else {
          sortStage = {[sortcol]:sortval}     
        } 
          if (req.body.searchTerm !== "") {
          //-----------------------------------------------------------------------------------------------------------------------------------
          console.log(" GOT  SEARCHTERM");
          const query = req.body.searchTerm.toString().toLowerCase();
          SearchField = issearch(query);
        }else{
          SearchField = {}
        } 
          console.log(
            " //-------------------------WHEN PAGE LOADS --------------------------------------------------------------------------------------------------------"
          );
          console.log(sortcol,sortval);
          const Result = await searchResult(SearchField, currentPage, dataPerPage, sortStage);
          const totalCount = await totalcountDocuments(SearchField);
          console.log(`Empty result and totalCount us ${Result} and ${totalCount}`);
    
          if (Result)
            res.json({
              success: true,
              data: Result,
              currentPage: currentPage,
              totalCount: totalCount,
              dataPerPage:dataPerPage
            });
          else return res.status(400).json({ message: "No user found Database is Empty" });
          console.log("Empty Search field.............. route is called");
          return;
          
        } catch (error) {
        console.log('get_alldrivers Error');
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
          from: "cityzones", 
          localField: "dcity", 
          foreignField: "_id",
          as: "dcity" 
        }
      },
      {
        $unwind: "$dcity"
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
        $lookup: {
          from: "vehicles", 
          localField: "servicetype", 
          foreignField: "_id",
          as: "servicetype" 
        }
      },
      {
        $addFields: {
          servicetype: { $arrayElemAt: ["$servicetype", 0] },
        },
      },
      {
        $project:{
          dname:1,
          demail:1,
          dphone:1,
          dimage:1,
          servicetype:1,
          status:1,
          "dcity._id":1,
          "dcity.city":1,
          "ccode.ccallcode":1,
          "ccode._id":1,
          customerid:1,
          bankstatus:1,
          driver_no:1,
        }
      }
    ]

    if(sortStage !== null){
      console.log("SORT STAGE IS NOT NULLL ------------->>");
      pipeline.unshift({ $sort: sortStage })
    }
    const filtered_data = await DriverModel.aggregate(pipeline, { collation: { locale: 'en', strength: 2 } });
    return filtered_data;
  }
  async function totalcountDocuments(SearchField) {
    const totalCount = await DriverModel.find(SearchField).countDocuments();
    return totalCount;
  }

  function issearch(data) {
    return {
      $or: [
        // { driver_no: { $eq: parseInt(data) } }, 
        { $expr: { $regexMatch: { input: { $toString: "$driver_no" }, regex: new RegExp(data) } } },
        { dname: { $regex: new RegExp(data.toLowerCase(), "i") } },
        { demail: { $regex: new RegExp(data.toLowerCase(), "i") } },
        { dphone: { $regex: new RegExp(data.toLowerCase(), "i") } },

      ],
    };
  }


  module.exports = {totalcountDocuments, searchResult, issearch, getAllDrivers}