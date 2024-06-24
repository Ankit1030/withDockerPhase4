const { io } = require("socket.io-client");
const CreateRideModel = require("../models/create_ride");
const DriverModel = require("../models/driver");
const cron = require("node-cron");
const { cronefnsimple } = require("./crone");

// Define the cron job to run every 10 seconds
const job = cron.schedule(
  "*/1 * * * * *",
  () => {
    // Task to execute
    cronefn();
    cronefnsimple();
    // console.log("Running11111111111-------------------------------- task...");
  },
  { scheduled: false }
);
job.start();
const cronefn = async () => {
  try {
    const pipeline = [
      {
        $lookup: {
          from: "settings",
          pipeline: [],
          as: "settings",
        },
      },
      {
        $unwind: "$settings",
      },
      {
        $match: {
          $and: [
            {
              ridestatus: { $in: [1, 2] },
            },
            {
              nearest: true,
            },
            {
              $or: [
                {
                  driver: null,
                },
                {
                  assigntime: null,
                },
                {
                  $expr: {
                    $gte: [
                      {
                        $abs: {
                          $subtract: [new Date().getTime(), "$assigntime"],
                        },
                      },
                      { $multiply: [1000, "$settings.ride_approvalTime"] },
                    ],
                  },
                },
              ],
            },
          ],
        },
      },
      {
        $lookup: {
          from: "drivermodels",
          let: {
            dcity: "$cityid",
            servicetype: "$vehicleid",
            driverArray: "$driverArray",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: ["$dcity", "$$dcity"],
                    },
                    {
                      $eq: ["$status", true],
                    },
                    {
                      $eq: ["$assign", 0],
                    },
                    {
                      $eq: ["$servicetype", "$$servicetype"],
                    },
                    { $not: { $in: ["$_id", "$$driverArray"] } },
                  ],
                },
              },
            },
          ],
          as: "availableDrivers",
        },
      },
      {
        $addFields: {
          oldDriver: "$driver",
        },
      },
      {
        $set: {
          // oldDriver: "$driver",
          driver: {
            $ifNull: [{ $arrayElemAt: ["$availableDrivers._id", 0] }, null],
          },
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
          oldDriver: 1,
          driverDetails: 1,
          userDetails: 1,
          vehicleDetails: 1,
          cityid: 1,
          driverArray: 1,
          // ridestatus: 1,
          // fromLocation: 1,
          // toLocation: 1,
          // waypointsLocation: 1,
          // bookDateandTime: 1,
          // bookDate: 1,
          // bookTime: 1,
          // ridestatus: 1,
        },
      },
    ];

    const AlldataArray = await CreateRideModel.aggregate(pipeline);
    if (AlldataArray.length === 0) {
      return;
      // return console.log(
      //   "RETURNED NO RIDE FOUND------------------------------"
      // );
    }

    console.log("RESULT LENGTH IS ", AlldataArray.length);
    for (i = 0; i < AlldataArray.length; i++) {
      const data = AlldataArray[i];
      // console.log("DATA-->> ", [i], data);
      if (data.oldDriver) {
        const updateOldDriver = await DriverModel.findByIdAndUpdate(
          data.oldDriver,
          { assign: 0 },
          { new: true }
        );
        console.log("PREVIOUS DRIVER IS FREEED NOW ---------->>>>>>>>>");
      }
      let senddata;
      let updateCreateRideModel,
        updateDriver = null;
      if (data.driverDetails) {
        const status = await DriverModel.findById(data.driverDetails._id);
        if (status.assign === 0) {
          updateDriver = await DriverModel.findByIdAndUpdate(
            data.driverDetails._id,
            { assign: 1 },
            { new: true }
          );
          updateCreateRideModel = await CreateRideModel.findByIdAndUpdate(
            data._id,
            {
              $set: {
                driver: data.driverDetails._id,
                assigntime: new Date().getTime(),
              },
              ridestatus: 1,
              $push: { driverArray: data.driverDetails._id },
            },
            {
              new: true,
              select:
                "_id fromLocation toLocation waypointsLocation bookDateandTime bookDate bookTime ridestatus cityid",
            }
          );
          senddata = {
            _id: updateCreateRideModel._id,
            driverDetails: updateDriver,
            userDetails: data.userDetails,
            vehicleDetails: data.vehicleDetails,
            fromLocation: updateCreateRideModel.fromLocation,
            toLocation: updateCreateRideModel.toLocation,
            waypointsLocation: updateCreateRideModel.waypointsLocation,
            bookDateandTime: updateCreateRideModel.bookDateandTime,
            bookDate: updateCreateRideModel.bookDate,
            bookTime: updateCreateRideModel.bookTime,
            ridestatus: updateCreateRideModel.ridestatus,
            cityid: updateCreateRideModel.cityid,
          };
          console.log("AssignDriverCrone EVENT -->", senddata);
          global.io.emit("AssignDriverCrone", senddata);
          // global.io.emit("crone1", {data:[senddata]});
        }
        if (status.assign === 1) {
          // await cronefn()
          updateCreateRideModel = await NoDriverAvailable(data);
          // senddata = {
          //   _id: updateCreateRideModel._id,
          //   driverDetails: updateDriver,
          //   ridestatus: updateCreateRideModel.ridestatus,
          // }
        }
      } else {
        //If DriverNot available Two possibilities either HOLD or Remove
        updateCreateRideModel = await NoDriverAvailable(data);
        // senddata = {
        //   _id: updateCreateRideModel._id,
        //   driverDetails: updateDriver,
        //   ridestatus: updateCreateRideModel.ridestatus,
        // }
      }
      // global.io.emit("crone1", {data:[senddata]});

      // if()
      // const senddata = {
      //   _id:updateCreateRideModel._id,
      //   driverDetails : updateDriver,
      //   userDetails:data.userDetails,
      //   vehicleDetails:data.vehicleDetails,
      //   fromLocation:updateCreateRideModel.fromLocation,
      //   toLocation:updateCreateRideModel.toLocation,
      //   waypointsLocation:updateCreateRideModel.waypointsLocation,
      //   bookDateandTime:updateCreateRideModel.bookDateandTime,
      //   bookDate:updateCreateRideModel.bookDate,
      //   bookTime:updateCreateRideModel.bookTime,
      //   ridestatus:updateCreateRideModel.ridestatus,
      //   cityid:data.cityid,

      // }
      // console.log("SENDDATA--->>>>>>",senddata);
      // if(1){
      // // if(senddata.ridestatus != 2){

      //   global.io.emit('crone1',senddata)
      // }
    }
    // console.log("AGGREGATE DATA",data);
    // console.log("CRONE DATA",data);
    // console.log("CRONE DATA", data);
    // if single data exists

    //   const customvariable = {}
    //   const croneResultPipeline =[
    //     {
    //         $match : { _id :updateCreateRideModel._id }
    //     },
    //     {
    //         $lookup: {
    //           from: "drivermodels",
    //           localField: "driver",
    //           foreignField: "_id",
    //           as: "driverDetails",
    //         },
    //       },
    //       {
    //         $addFields: {
    //           // Add a new field "firstElement" which represents the value at index 0 of the "arrayField" array
    //           driverDetails: { $arrayElemAt: ["$driverDetails", 0] },
    //         },
    //       },
    //       {
    //         $lookup: {  //[0].ccallcode
    //           from: "countries",
    //           localField: "userDetails.ccode",
    //           foreignField: "_id",
    //           as: "country"
    //         }
    //       },
    //       {
    //         $lookup: {
    //           from: "usermodels",
    //           localField: "userid",
    //           foreignField: "_id",
    //           as: "userDetails",
    //         },
    //       },
    //       {
    //         $unwind: "$userDetails",
    //       },
    //       {
    //         $lookup: {
    //           from: "vehicles",
    //           localField: "vehicleid",
    //           foreignField: "_id",
    //           as: "vehicleDetails",
    //         },
    //       },
    //       {
    //         $unwind: "$vehicleDetails",
    //       },
    //       {
    //         $project: {
    //           driverDetails:1,
    //           userDetails:1,
    //           vehicleDetails:1,
    //             _id: 1,
    //             // rideid: "$_id",
    //             // "driverDetails._id": 1,
    //             // "driverDetails.dname": 1,
    //             // "driverDetails.dphone": 1,
    //             // "driverDetails.assign": 1,
    //             // // "userDetails._id": 1,
    //             // "userDetails.uname": 1,
    //             // "userDetails.uimage": 1,
    //             // "userDetails.uphone": 1,
    //             // // "vehicleDetails._id": 1,
    //             // "vehicleDetails.vname": 1,
    //             // "vehicleDetails.vimage": 1,
    //             fromLocation: 1,
    //             toLocation: 1,
    //             waypointsLocation: 1,
    //             bookDateandTime: 1,
    //             bookDate: 1,
    //             bookTime: 1,
    //             ridestatus: 1,

    //         //   _id: 0,
    //         //   rideid: "$_id",
    //         //   driverDetails:1,
    //         //   userDetails: 1,
    //         //   callcode: { $arrayElemAt: ['$country.ccallcode', 0] },
    //         //   vehicleDetails: 1,
    //         //   fromLocation: 1,
    //         //   toLocation: 1,
    //         //   waypointsLocation: 1,
    //         //   bookDateandTime: 1,
    //         //   bookDate: 1,
    //         //   bookTime: 1,
    //         //   ridestatus:1
    //         },
    //       },

    // ];
    // const senddata1 = await CreateRideModel.aggregate(croneResultPipeline)
    // const senddata = {
    //   _id : updateCreateRideModel._id,
    //   ridestatus:updateCreateRideModel.ridestatus,
    //   driverDetails:updateDriver,

    // };
    // const senddata = senddata1[0]
    // const senddata = {
    //   _id:updateCreateRideModel._id,
    //   driverDetails : updateDriver,
    //   userDetails:data.userDetails,
    //   vehicleDetails:data.vehicleDetails,
    //   fromLocation:updateCreateRideModel.fromLocation,
    //   toLocation:updateCreateRideModel.toLocation,
    //   waypointsLocation:updateCreateRideModel.waypointsLocation,
    //   bookDateandTime:updateCreateRideModel.bookDateandTime,
    //   bookDate:updateCreateRideModel.bookDate,
    //   bookTime:updateCreateRideModel.bookTime,
    //   ridestatus:updateCreateRideModel.ridestatus,
    //   cityid:data.cityid,

    // }
    // console.log("SENDDATA--->>>>>>",senddata);
    // global.io.emit('crone1',senddata)
    // return

    // if (data.length === 1) {
    //   await rejectRequestFn(data[0]._id, data[0].driver);
    // }
    // console.log('updateCreateRideModel',updateCreateRideModel);
    // console.log('updateDriver',updateDriver);

    // if (data.length > 1) {
    //   const transformedData = data.reduce(
    //     (acc, curr) => {
    //       acc._id.push(curr._id);
    //       acc.driverid.push(curr.driver);
    //       return acc;
    //     },
    //     { _id: [], driverid: [] }
    //   );

    //   console.log("CRONE DATA", transformedData);
    //   const rideidArray = transformedData._id;
    //   const driverArray = transformedData.driverid;

    //   const status1 = await CreateRideModel.updateMany(
    //     { _id: { $in: rideidArray } },
    //     {
    //       $set: {
    //         driver: null,
    //         assigntime: null,
    //         ridestatus: 0,
    //       },
    //     }
    //   );
    //   // const status2 = await DriverModel.updateMany(
    //   //   { _id: { $in: driverArray } },
    //   //   {
    //   //     $set: {
    //   //       assign: 0,
    //   //     },
    //   //   }
    //   // );
    //   // console.log(
    //   //   "---------------------------------------------------------------"
    //   // );
    //   // console.log("ALL CREATERIDE staus ARRAY", status1);
    //   // console.log(
    //   //   "--------------------------------------------------------------------"
    //   // );
    //   // if (status1 && status2) {
    //   //   global.io.emit("crone", { data: rideidArray });
    //   // }

    //   // for(i = 0; i < data.length; i++){
    //   //     console.log("Current index ",i,"-> ",data[i]);
    //   // await rejectRequestFn(data[i]._id)
    //   //     // const update = await
    //   // }
    //   // global.io.emit('crone',data)
    // }
  } catch (error) {
    // console.log("CRONE ERROR", error);
  }

  // const data = await CreateRideModel.find({ridestatus:1, assign})
};

async function NoDriverAvailable(data) {
  let updateCreateRideModel;
  const capableFreeDriver = await DriverModel.findOne({
    dcity: data.cityid,
    status: true,
    assign: { $in: [0, 1] },
    servicetype: data.vehicleDetails._id,
    _id: { $nin: data.driverArray },
  });
  if (capableFreeDriver) {
    updateCreateRideModel = await CreateRideModel.findByIdAndUpdate(
      data._id,
      { $set: { driver: null, assigntime: null, ridestatus: 2 } },
      { new: true, select: "_id ridestatus driverDetails" }
    );
    // console.log(
    //   "IF capableFreeDriver++++++++++++++++++++++++++++++++++++++++++",
    //   capableFreeDriver
    // );

    const senddata = {
      _id: data._id,
      driverDetails: null,
      ridestatus: 2,
    };
    // console.log("SEND HOLD data->>", senddata);
    global.io.emit("HoldRide", senddata);
  } else {
    updateCreateRideModel = await CreateRideModel.findByIdAndUpdate(
      data._id,
      {
        $set: {
          driver: null,
          assigntime: null,
          nearest: false,
          ridestatus: 0,
          driverArray: [],
        },
      },
      { new: true, select: "_id ridestatus driverDetails" }
    );
    const senddata = {
      _id: data._id,
      driverDetails: null,
      ridestatus: 0,
    };
    // console.log("ELSE capableFreeDriver-----------------------------------");

    global.io.emit("setNotification", global.incrementNotification());

    global.io.emit("NoDriverFound", { data: senddata });
  }
  return updateCreateRideModel;
}
module.exports = { cronefn };
