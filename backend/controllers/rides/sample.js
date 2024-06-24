[
  {
    fromLocation: "Rajkot, Gujarat, India",
    toLocation: "Gondal, Gujarat, India",
    waypointsLocation: [],
    bookTime: "23:59",
    bookDate: "2024-05-14",
    bookDateandTime: 1715711340000,
    ridestatus: 1,
    driverDetails: {
      _id: "6642feded37df4e3d0927396",
      dname: "vivek",
      dphone: "2222222222",
      assign: 1,
    },
    userDetails: {
      _id: "663cd1465ea8118e6f60a475",
      uname: "bhavesh",

      uimage: "2-1715261766355.jpg",

      uphone: "2222222222",
    },
    vehicleDetails: {
      _id: "6620df43bd9b67d8efc554ba",
      vname: "XUV",
      vimage: "2-1713430465856-.jpg",
    },
    rideid: "664315f252d70aa8a830bb7b",
  },
];
const {Payment} = require('../../controllers/rides/make_payment')
const mongoose = require("mongoose");
const CreateRideModel = require("../../models/create_ride");

// const bookdateCondition = { bookDate: bookDate }
// const sample1 = async (req, res) => {
//   try {
//     // const allRides = await CreateRideModel.find({ridestatus:0})
//     console.log("req.body getAllRudes", req.body);
//     let matchConditions = [];

//     let MainOriginalPipeline = [];

//     let lookupPipeline = [
//       {
//         $lookup: {
//           from: "usermodels",
//           localField: "userid",
//           foreignField: "_id",
//           as: "user",
//         },
//       },
//       {
//         $unwind: "$user",
//       },
//     ];

//     let insideOrPipeline = [];
//     let insideAndPipeline = [];
//     const { idandname, vehicleid, ridestatus, bookDate } = req.body;
//     const searchdata = idandname;

//     let flag = 0;
//     if (searchdata || vehicleid || ridestatus || bookDate) {
//       flag = 1;
//       if (bookDate) {
//         insideAndPipeline.push({ bookDate: bookDate });
//       }

//       if (vehicleid) {
//         insideAndPipeline.push({
//           vehicleid: new mongoose.Types.ObjectId(vehicleid),
//         });
//       }

//       if (searchdata) {
//         // MainOriginalPipeline.unshift(...lookupPipeline);
//         insideOrPipeline.push(
//           {
//             _id: mongoose.Types.ObjectId.isValid(searchdata)
//               ? new mongoose.Types.ObjectId(searchdata)
//               : null,
//           },
//           { "user.uname": { $regex: new RegExp(searchdata, "i") } },
//           { "user.uphone": { $regex: new RegExp(searchdata, "i") } },
//           { "user.uemail": { $regex: new RegExp(searchdata, "i") } }
//         );
//       }
//       if (ridestatus) {
//         insideAndPipeline.push({
//           $and: [
//             { ridestatus: { $nin: [6, 7] } },
//             { ridestatus: Number(ridestatus) },
//           ],
//         });
//       } else {
//         insideAndPipeline.push({ ridestatus: { $nin: [6, 7] } });
//       }

//       if (insideAndPipeline.length > 0 && insideOrPipeline.length > 0) {
//         matchConditions = [
//           { $match: { $and: [...insideAndPipeline, { $or: insideOrPipeline }] } },
//         ];
//       } else if (insideAndPipeline.length > 0) {
//         matchConditions = [{ $match: { $and: [...insideAndPipeline] } }];
//       } else if (insideOrPipeline.length > 0) {
//         matchConditions = [{ $match: { $or: [...insideOrPipeline] } }];
//       }

      
//     } else {
//       matchConditions = [{ $match: { ridestatus: { $nin: [6, 7] } } }];
//     }

//     //-----------------------------------------------------------------
//     // if (insideAndPipeline.length > 0 && insideOrPipeline.length > 0) {
//     //   matchConditions = [
//     //     { $match: { $and: [...insideAndPipeline, { $or: insideOrPipeline }] } },
//     //   ];
//     // } else if (insideAndPipeline.length > 0) {
//     //   matchConditions = [{ $match: { $and: [...insideAndPipeline] } }];
//     // } else if (insideOrPipeline.length > 0) {
//     //   matchConditions = [{ $match: { $or: [...insideOrPipeline] } }];
//     // } else {
//     //   matchConditions = [{ $match: { ridestatus: { $nin: [6, 7] } } }];
//     // }

//     MainOriginalPipeline = [
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
//         $lookup: {
//           from: "cityzones",
//           localField: "cityid",
//           foreignField: "_id",
//           as: "cityDetails",
//         },
//       },
//       {
//         $unwind: "$cityDetails",
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
//           //[0].ccallcode
//           from: "countries",
//           localField: "userDetails.ccode",
//           foreignField: "_id",
//           as: "country",
//         },
//       },
//       {
//         $lookup: {
//           from: "drivermodels",
//           localField: "driver",
//           foreignField: "_id",
//           as: "driverDetails",
//         },
//       },
//       {
//         $addFields: {
//           driverDetails: { $arrayElemAt: ["$driverDetails", 0] },
//         },
//       },
//       {
//         $project: {
//           _id: 1,
//           driverDetails: 1,
//           callcode: { $arrayElemAt: ["$country.ccallcode", 0] },
//           userDetails: 1,
//           vehicleDetails: 1,
//           cityname: "$cityDetails.city",
//           cityid: 1,
//           fromLocation: 1,
//           toLocation: 1,
//           waypointsLocation: 1,
//           rideDistance: 1,
//           estimatedTime: 1,
//           estimatedFarePrice: 1,
//           bookDateandTime: 1,
//           bookDate: 1,
//           bookTime: 1,
//           ridestatus: 1,
//           ride_no:1,
//         },
//       },
//     ];

//     console.log("MainOriginalPipeline", MainOriginalPipeline);
//     MainOriginalPipeline.unshift(...matchConditions);
//     console.log("MainOriginalPipeline", MainOriginalPipeline);
//     //   if(searchdata)     MainOriginalPipeline.unshift(...lookupPipeline);
//     let pipe = [];
//     if (flag === 1) {
//       pipe = [...lookupPipeline, ...MainOriginalPipeline];
//     } else {
//       pipe = [...MainOriginalPipeline];
//     }
//     console.log("PIPE", pipe);
//     const allRides = await CreateRideModel.aggregate(pipe);
//     // const allRides = await CreateRideModel.aggregate(MainOriginalPipeline);
//     console.log("allRides-->>>>>", allRides);
//     res.status(200).json({ success: true, data: allRides });
//   } catch (error) {
//     console.log("getAllrides error", error);
//     res.status(500).json({ success: false, message: "Internal Server Error" });
//   }
// };

const sample1 = async(req,res)=>{
  try {
    const userdata = {
      "_id":  "665abe42070fb6dba31ecb53",
      
      "uname": "bhavesh",
      "uemail": "bhavesh@gmail.com",
      "uimage": "1-1717222978187.jpg",
      "ccode": {
        "$oid": "66220ba612b766761fbf0ae2"
      },
      "uphone": "5454544445",
      "user_no": 6,
      "__v": 0,
      "customerid": "cus_QDBiAAEGBPjaNm"
    }
    const driverdata = {
      "_id":  "66597275ea05f9584293bfe4",
      "dname": "bhavesh",
      "demail": "bhavesh@gmail.com",
      "dimage": "21-1717138037381.jfif",
      "servicetype":  "6620df43bd9b67d8efc554ba"
      ,
      "status": true,
      "ccode": "66220ba612b766761fbf0ae2"
      ,
      "dcity":  "664ed654e354326064a8c821"
      ,
      "dphone": "4545777454",
      "assign": 2,
      "bankstatus": true,
      "driver_no": 4,
      "__v": 0,
      "customerid": "acct_1PMPFCPSedcNKpRF"
    }
  
    const ridedata = {
      "_id":  "665d5ac76290603a979fe411",
      "userid":  "665abe42070fb6dba31ecb53",
      "cityid":  "664ed654e354326064a8c821",
      "fromLocation": "Rajkot, Gujarat, India",
      "toLocation": "Gondal, Gujarat, India",
      "waypointsLocation": [],
      "vehicleid":  "6620df43bd9b67d8efc554ba",
      "paymentType": "card",
      "estimatedFarePrice": 481.91,
      "estimatedTime": "1 hr 0 min",
      "rideDistance": 40.08,
      "rideDuration": 60.3,
      "bookTime": "11:25",
      "bookDate": "2024-06-03",
      "bookDateandTime": 1717394119327,
      "ridestatus": 3,
      "driver":  "66597275ea05f9584293bfe4",
      "nearest": false,
      "driverArray": [],
      "assigntime": null,
      "ride_no": 5,
      "__v": 0
    }
  
  const result = await Payment(userdata,driverdata,ridedata)
  console.log("Payment Result is ",result);
  res.send(result)
  
  } catch (error) {
    console.log("PAyment11",error);
  }
}
module.exports = { sample1 };
