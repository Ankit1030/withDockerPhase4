const CreateRideModel = require("../../models/create_ride");
const DriverModel = require("../../models/driver");
const mongoose = require("mongoose");
const UserModel = require("../../models/users");
const getfilteredRidesHistory = async (req, res) => {
  try {
    // const allRides = await CreateRideModel.find({ridestatus:0})
    console.log("req.body getAllRudes", req.body);
    let matchConditions = [];
    // let MainOriginalPipeline = [];
    let lookupPipeline = [
      {
        $lookup: {
          from: "usermodels",
          localField: "userid",
          foreignField: "_id",
          as: "user",
        },
      },
      // {
      //   $unwind: "$user",
      // },
      {
        $addFields: {
          user: { $arrayElemAt: ["$user", 0] }
        }
      }
    ];

    let insideOrPipeline = [];
    let insideAndPipeline = [];
    const { searchfield, vehicleid, ridestatus, fromDate, toDate } = req.body;
    const searchdata = searchfield;

    let flag = 0;
    if (searchdata || vehicleid || ridestatus || (fromDate && toDate)) {
      flag = 1;
      if (fromDate) {
        insideAndPipeline.push({
          bookDate: {
            $gte: fromDate,
            $lte: toDate,
          },
        });
      }

      if (vehicleid) {
        insideAndPipeline.push({
          vehicleid: new mongoose.Types.ObjectId(vehicleid),
        });
      }

      if (searchdata) {
       console.log("SEARCHDATA -----------");
        insideOrPipeline.push(
          {
            $expr: {
              $regexMatch: {
                input: { $toString: "$ride_no" },
                regex: new RegExp(searchdata),
              },
            },
          },
          { "user.uname": { $regex: new RegExp(searchdata, "i") } },
          { "user.uphone": { $regex: new RegExp(searchdata, "i") } },
          { "user.uemail": { $regex: new RegExp(searchdata, "i") } }
        );
      }

      if (ridestatus) {
        insideAndPipeline.push({ ridestatus: Number(ridestatus) },{ ridestatus: { $in: [6, 7] } });
      } else {
        insideAndPipeline.push({ ridestatus: { $in: [6, 7] } });
      }

      if (insideAndPipeline.length > 0 && insideOrPipeline.length > 0) {
console.log("BOTH BOTH BOTH BOTH BOTH");
        matchConditions.push({
          $match: { $and: [...insideAndPipeline, { $or: insideOrPipeline }] },
        });
      } else if (insideAndPipeline.length > 0) {
        console.log("ONLY INSIDE ANDDDDDD");
        matchConditions.push({ $match: { $and: [...insideAndPipeline] } });
      } else if (insideOrPipeline.length > 0) {
        console.log("ONLY INSIDE ORRRRRR");
        // matchConditions.push({ $match: { $and: [ { $or: insideOrPipeline }] } });
        matchConditions.push({ $match: { $or: [...insideOrPipeline] } });
      }
    } else {
      matchConditions.push({ $match: { ridestatus: { $in: [6, 7] } } });
    }

    let MainOriginalPipeline = [
      {
        $lookup: {
          from: "vehicles",
          localField: "vehicleid",
          foreignField: "_id",
          as: "vehicleDetails",
        },
      },
      {
        $unwind: "$vehicleDetails",
      },
      {
        $lookup: {
          from: "cityzones",
          localField: "cityid",
          foreignField: "_id",
          as: "cityDetails",
        },
      },
      {
        $unwind: "$cityDetails",
      },
      {
        $lookup: {
          from: "usermodels",
          localField: "userid",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $unwind: "$userDetails",
      },
      {
        $lookup: {
          //[0].ccallcode
          from: "countries",
          localField: "userDetails.ccode",
          foreignField: "_id",
          as: "country",
        },
      },
      {
        $lookup: {
          from: "drivermodels",
          localField: "driver",
          foreignField: "_id",
          as: "driverDetails",
        },
      },
      {
        $addFields: {
          driverDetails: { $arrayElemAt: ["$driverDetails", 0] },
        },
      },
      {
        $project: {
          _id: 1,
          driverDetails: 1,
          callcode: { $arrayElemAt: ["$country.ccallcode", 0] },
          userDetails: 1,
          vehicleDetails: 1,
          cityname: "$cityDetails.city",
          cityid: 1,
          fromLocation: 1,
          toLocation: 1,
          waypointsLocation: 1,
          rideDistance: 1,
          estimatedTime: 1,
          estimatedFarePrice: 1,
          bookDateandTime: 1,
          bookDate: 1,
          bookTime: 1,
          ridestatus: 1,
          ride_no: 1,
          feedback:1
        },
      },
    ];

    MainOriginalPipeline.unshift(...matchConditions);
    console.log("insideAndPipeline", insideAndPipeline);
    console.log("insideOrPipeline", insideOrPipeline);
    //   if(searchdata)     MainOriginalPipeline.unshift(...lookupPipeline);
    let pipe = [];
    if (flag === 1) {
      pipe = [...lookupPipeline, ...MainOriginalPipeline];
      // return res.send('1',pipe)
    } else {
      pipe = [...MainOriginalPipeline];
      // return res.send('2',pipe)
    }

    const allRides = await CreateRideModel.aggregate(pipe);

    console.log("allRides-->>>>>", allRides);
    res.status(200).json({ success: true, data: allRides });
  } catch (error) {
    console.log("getAllrides error", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};


const feedbackForm = async(req,res)=>{
  try {
    console.log("req body feedback",req.body);
    const {rideid,rating,feedback} = req.body;
    const ratingNumber = Number(rating)
    if(!(rideid && rating && feedback)){
      return res.status(200).json({success:false,message:"Feedback NotSubmitted something went wrong !"})

    }
    const updateRide = await CreateRideModel.findByIdAndUpdate(rideid,{feedback:{
      rating: ratingNumber,
      message:feedback
    }},{new:true,select:"_id feedback"})
    console.log("UPDATE FEEDBACK",updateRide);
    if(!updateRide){
      return res.status(200).json({success:false,message:"Feedback NotSubmitted something went wrong !"})
    }
    return res.status(200).json({success:true,data:{rating:updateRide.feedback.rating, feedback:updateRide.feedback.message},message:'Feedback Submitted Successfully'})
  } catch (error) {
    console.log("FEEDBACK SUBMITTED ERROR",error);
    return res.status(500).json({success:false,message:"Internal Server Error while submitting the feedback"})
  }
}
module.exports = {getfilteredRidesHistory,feedbackForm}