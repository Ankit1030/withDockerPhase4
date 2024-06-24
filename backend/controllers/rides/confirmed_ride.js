const CreateRideModel = require("../../models/create_ride");
const DriverModel = require("../../models/driver");
const mongoose = require("mongoose");
const UserModel = require("../../models/users");

const getAllRides = async (req, res) => {
  try {
    // const allRides = await CreateRideModel.find({ridestatus:0})
    console.log("req.body getAllRudes", req.body);

    const MainOriginalPipeline = [
      {
        $match: { ridestatus: { $nin: [6, 7] } },
      },
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
          // Add a new field "firstElement" which represents the value at index 0 of the "arrayField" array
          driverDetails: { $arrayElemAt: ["$driverDetails", 0] },
        },
      },
      // {
      //   $unwind: "$driverDetails",
      // },

      {
        $project: {
          _id: 1,
          driverDetails: 1,
          // driver:1,
          // _id:1, // request id
          // driver: 1,
          // "driver.dname": 1,
          // "driver.dphone": 1,
          // "driver.assign": 1,
          // "userDetails.uname": 1,
          // "userDetails.uimage": 1,
          // "userDetails.uphone": 1,
          // "vehicleDetails.vname": 1,
          // "vehicleDetails.vimage": 1,
          // requestid: "$_id",
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

          // uname: "$username.uname",
          // uimage:"$username.uimage",
          // uemail : "$username.email",
          // uphone : "$username.uphone",

          // vehicleid: "$vehicleid._id",
          // vname:"$vehicleid.vname" ,
          // vimage: "$vehicleid.vimage",
        },
      },
    ];
    const allRides = await CreateRideModel.aggregate(MainOriginalPipeline);
    console.log("allRides-->>>>>", allRides);
    // res.send(allRides)
    res.status(200).json({ success: true, data: allRides });
  } catch (error) {
    console.log("getAllrides error", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const getfilteredRides = async (req, res) => {
  try {
    // const allRides = await CreateRideModel.find({ridestatus:0})
    console.log("req.body getAllRudes", req.body);
    let matchConditions = [];

    let MainOriginalPipeline = [];

    let lookupPipeline = [
      {
        $lookup: {
          from: "usermodels",
          localField: "userid",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
    ];

    let insideOrPipeline = [];
    let insideAndPipeline = [];
    const { idandname, vehicleid, ridestatus, bookDate } = req.body;
    const searchdata = idandname;

    let flag = 0;
    if (searchdata || vehicleid || ridestatus || bookDate) {
      flag = 1;
      if (bookDate) {
        insideAndPipeline.push({ bookDate: bookDate });
      }

      if (vehicleid) {
        insideAndPipeline.push({
          vehicleid: new mongoose.Types.ObjectId(vehicleid),
        });
      }

      if (searchdata) {
        // MainOriginalPipeline.unshift(...lookupPipeline);
        insideOrPipeline.push(
          { $expr: { $regexMatch: { input: { $toString: "$ride_no" }, regex: new RegExp(searchdata) } } },
          { "user.uname": { $regex: new RegExp(searchdata, "i") } },
          { "user.uphone": { $regex: new RegExp(searchdata, "i") } },
          { "user.uemail": { $regex: new RegExp(searchdata, "i") } }
        );
      }

      if (ridestatus) {
        insideAndPipeline.push({ ridestatus: Number(ridestatus) },{ ridestatus: { $nin: [6, 7] } });
      } else {
        insideAndPipeline.push({ ridestatus: { $nin: [6, 7] } });
      }

      if (insideAndPipeline.length > 0 && insideOrPipeline.length > 0) {
        matchConditions.push(
          {
            $match: { $and: [...insideAndPipeline, { $or: insideOrPipeline }] },
          },
        )
      } else if (insideAndPipeline.length > 0) {
        matchConditions.push({ $match: { $and: [...insideAndPipeline] } })
      } else if (insideOrPipeline.length > 0) {
        matchConditions.push({ $match: { $or: [...insideOrPipeline] } })
      }
    } else {
      matchConditions.push({ $match: { ridestatus: { $nin: [6, 7] } } })
    }

    //-----------------------------------------------------------------
    // if (insideAndPipeline.length > 0 && insideOrPipeline.length > 0) {
    //   matchConditions = [
    //     { $match: { $and: [...insideAndPipeline, { $or: insideOrPipeline }] } },
    //   ];
    // } else if (insideAndPipeline.length > 0) {
    //   matchConditions = [{ $match: { $and: [...insideAndPipeline] } }];
    // } else if (insideOrPipeline.length > 0) {
    //   matchConditions = [{ $match: { $or: [...insideOrPipeline] } }];
    // } else {
    //   matchConditions = [{ $match: { ridestatus: { $nin: [6, 7] } } }];
    // }

    MainOriginalPipeline = [
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
        },
      },
    ];

    console.log("MainOriginalPipeline", MainOriginalPipeline);
    MainOriginalPipeline.unshift(...matchConditions);
    console.log("MainOriginalPipeline", MainOriginalPipeline);
    //   if(searchdata)     MainOriginalPipeline.unshift(...lookupPipeline);
    let pipe = [];
    if (flag === 1) {
      pipe = [...lookupPipeline, ...MainOriginalPipeline];
    } else {
      pipe = [...MainOriginalPipeline];
    }
    console.log("PIPE", pipe);
    const allRides = await CreateRideModel.aggregate(pipe);
    // const allRides = await CreateRideModel.aggregate(MainOriginalPipeline);
    console.log("allRides-->>>>>", allRides);
    res.status(200).json({ success: true, data: allRides });
  } catch (error) {
    console.log("getAllrides error", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const getAllConfirmedRideStatus = async (req,res)=>{
  try {
    const allstatus = await CreateRideModel.aggregate([
      {
        $match: {
          ridestatus:{$in:[0,1,3]}
        }
      },
      {
        $group: {
          _id: "$ridestatus",
       
        }
      },
      {
        $project: {
          ridestatus:1,

        }
      }
      // {ridestatus:{$in:[0,1,3]}}
    ])
    console.log('confirmedRide allstatus',allstatus);
    res.status(200).json({success:true,data:allstatus,message:"All status are fetched successfully"});
  } catch (error) {
    console.log("getAllConfirmedRideStatus error", error);
    res.status(500).json({success:false,message:"Internal Server Error"});
  }
}
// NOT in use currently
const getAllfreeDrivers = async (req, res) => {
  try {
    console.log(
      "getAllfreeDrivers ----------------------------------------------------------"
    );
    const data = req.body;
    // console.log( "REQ data",data);
    // const cityid = new mongoose.Types.ObjectId(data.city);
    // const vehicleid = new mongoose.Types.ObjectId(data.vehicle);
    console.log("REQ data", data);
    const cityid = new mongoose.Types.ObjectId(data.city);
    const vehicleid = new mongoose.Types.ObjectId(data.vehicle);
    // console.log('CREATE---------- RIDE IO io',global.io);
    // global.io.emit('testme','HELLOOOOOOOOO  BHAII------------------->>>>>>>>>>>>>>>>>>>>>>>')
    console.log(cityid, vehicleid);
    const findallAvailableDrivers = [
      {
        $match: {
          dcity: cityid,
          status: true,
          assign: 0,
          servicetype: vehicleid,
        },
      },
      {
        $lookup: {
          from: "cityzones",
          localField: "dcity",
          foreignField: "_id",
          as: "cityDetails",
        },
      },
      {
        $project: {
          profile: "$dimage",
          name: "$dname",
          email: "$demail",
          phone: "$dphone",
        },
      },
    ];
    const allDrivers = await DriverModel.aggregate(findallAvailableDrivers);
    console.log("ALLDRIVERS--------->>", allDrivers);
    // return allDrivers;
    console.log("BEFORE RETURN", allDrivers);
    // res.send(allDrivers)
    return res.status(200).json({
      success: true,
      data: allDrivers,
      message: "Available free Drivers",
    });
  } catch (error) {
    console.log("Error getAllfreeDrivers", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });

    return null;
  }
};

const AssignSpecificDriver = async (req, res) => {
  // const AssignSpecificDriver = async (data) => {
  try {
    const data = req.body;
    console.log("AssignDriver visited");
    const rideId = new mongoose.Types.ObjectId(data.rideid);
    const driverId = new mongoose.Types.ObjectId(data.driverid);
    const isFree = await DriverModel.findById(driverId);
    console.log("isFree", isFree);
    // return
    if (isFree.assign === 0) {
      const driverdata = await DriverModel.findByIdAndUpdate(
        driverId,
        {
          assign: 1,
        },
        { new: true }
      );
      const updateRide = await CreateRideModel.findByIdAndUpdate(
        rideId,
        {
          ridestatus: 1,
          driver: driverId,
          assigntime: new Date().getTime(),
        },
        { new: true }
      );
      const ridedata = await CreateRideModel.aggregate([
        {
          $match: {
            _id: rideId,
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
          $unwind: "$driverDetails",
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
          $project: {
            _id: 1,
            driverDetails: 1,
            userDetails: 1,
            vehicleDetails: 1,
            fromLocation: 1,
            toLocation: 1,
            waypointsLocation: 1,
            // callcode: { $arrayElemAt: ['$country.ccallcode', 0] },
            bookDateandTime: 1,
            bookDate: 1,
            bookTime: 1,
            ridestatus: 1,
            cityid: 1,
            ride_no: 1,
          },
        },
      ]);
      console.log("RIDEDATA-->>", ridedata);

      // senddata = {
      //   _id: updateCreateRideModel._id,
      //   driverDetails: updateDriver,
      //   userDetails: data.userDetails,
      //   vehicleDetails: data.vehicleDetails,
      //   fromLocation: updateCreateRideModel.fromLocation,
      //   toLocation: updateCreateRideModel.toLocation,
      //   waypointsLocation: updateCreateRideModel.waypointsLocation,
      //   bookDateandTime: updateCreateRideModel.bookDateandTime,
      //   bookDate: updateCreateRideModel.bookDate,
      //   bookTime: updateCreateRideModel.bookTime,
      //   ridestatus: updateCreateRideModel.ridestatus,
      //   cityid: data.cityid,
      // };
      const rideData = ridedata[0];
      // const wholedata = {ride:rideData,driver:driverdata}
      global.io.emit("getcurrentRunningRequest", rideData);
      // global.io.emit("crone1", {data:[rideData]});
      res
        .status(200)
        .json({ success: true, message: "Request sended successfully" });
    } else if (isFree.assign === 1) {
      res.status(200).json({
        success: false,
        message: "The Driver is not Free right now Please Try after some time",
      });
    } else {
      res.status(200).json({
        success: false,
        message: "The Driver is already booked with Ride",
      });
    }

    // const data = await CreateRideModel.aggregate([
    //   {
    //   $match : {
    //             _id: rideId,
    //       }
    //   },
    //   {

    //   }
    // ])
  } catch (error) {
    console.log("Error AssignSpecificDriver", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const assignNearestDriver = async (req, res) => {
  try {
    console.log("CRONE SETUP STARTED ", req.body);
    const rideid = req.body.rideid;
    const updateRidedata = await CreateRideModel.findByIdAndUpdate(
      rideid,
      {
        nearest: true,
        ridestatus: 1,
        driverArray: [],
        driver: null,
        assigntime: null,
      },
      { new: true }
    );
    if (!updateRidedata) {
      res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    } else {
      res
        .status(200)
        .json({ success: true, message: "Ride Updated Successfully" });
    }
  } catch (error) {
    console.log("assignNearestDriver-> ", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

module.exports = {
  getAllRides,
  getfilteredRides,
  getAllfreeDrivers,
  AssignSpecificDriver,
  assignNearestDriver,
  getAllConfirmedRideStatus
};
