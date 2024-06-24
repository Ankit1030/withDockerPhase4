const mongoose = require("mongoose");
const { Payment } = require("../../controllers/rides/make_payment");
const { sendEmail } = require("../../utils/nodemailer");
const { sendSms } = require("../../utils/twillio");

const UserModel = require("../../models/users");
const CreateRideModel = require("../../models/create_ride");
const DriverModel = require("../../models/driver");
const SettingsModel = require("../../models/settings");
const { cronefn } = require("../../utils/nearestcrone");

const getAllRunningRequests = async (req, res) => {
  try {
    const pipeline = [
      {
        $match: { ridestatus: { $eq: 1 } },
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
          driverDetails: 1,
          userDetails: 1,
          vehicleDetails: 1,
          _id: 1,
          fromLocation: 1,
          toLocation: 1,
          waypointsLocation: 1,
          bookDateandTime: 1,
          bookDate: 1,
          bookTime: 1,
          ridestatus: 1,
        },
      },
    ];
    const data = await CreateRideModel.aggregate(pipeline);
    // res.send(data)
    return res.status(200).json({
      success: true,
      data: data,
      message: "All Running Requests received successfully",
    });
  } catch (error) {
    console.log("Erro getAllRunningRequests", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

const rejectRequest = async (req, res) => {
  try {
    console.log("req.body", req.body);
    const rideid = req.body.rideid;
    // const driverid = req.body.driverid;
    const result = await rejectRequestFn(rideid);
    console.log("ROUTER Result", result);
    if (result) {
      return res.status(200).json({
        success: true,
        message: "Ride and Driver Status Updated Successfully",
      });
    } else {
      res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  } catch (error) {
    console.log("Error rejectRequest Route", error);
  }
};

const rejectRequestFn = async (rideid) => {
  // Fn called inside reject API
  //Called inside rejectRequest API

  try {
    console.log("01 step inside REjectFn----BTOooo");
    const updateRidedata = await CreateRideModel.findById(rideid);
    console.log("0 Find Ride", updateRidedata);

    if (updateRidedata.driver) {
      const updateDriverstatus = await DriverModel.findByIdAndUpdate(
        updateRidedata.driver,
        { assign: 0 },
        { new: true }
      );
      console.log("1 UPDATED DRIVER STATUS ", updateDriverstatus);
      let updateRide;

      if (updateRidedata.nearest === true) {
        //CRONE LOGIC HERE
        updateRide = await CreateRideModel.findByIdAndUpdate(
          rideid,
          {
            driver: null,
            assigntime: null,
            $push: {
              driverArray: new mongoose.Types.ObjectId(updateRidedata.driver),
            },
          },
          { new: true }
        );
        cronefn();
      } else {
        updateRide = await CreateRideModel.findByIdAndUpdate(
          rideid,
          { driver: null, assigntime: null, ridestatus: 0 },
          { new: true }
        );
        console.log("02 -> ELSE UPDATE RIDE", updateRide);
        const senddata = {
          _id: updateRide._id,
          ridestatus: updateRide.ridestatus,
          driverDetails: null,
        };
        global.io.emit("setNotification", global.incrementNotification());
        global.io.emit("NoDriverFound", { data: senddata });
      }
      // }

      if (updateRide && updateDriverstatus) {
        return true;
      } else {
        return false;
      }
    }
  } catch (error) {
    console.log("Error rejectRequestFunction", error);
    return false;
  }
};

const AcceptRide = async (req, res) => {
  try {
    console.log("AcceptRide", req.body);
    const { rideid, driverid } = req.body;
    const mongoosedriver = new mongoose.Types.ObjectId(driverid);
    // const verifyRide = await CreateRideModel.findOne({_id:rideid})
    // console.log('verifyRide--verifyRide',verifyRide);
    // console.log("Accept Request11",verifyRide);
    // if(!verifyRide){
    //   return res.status(400).json({ success: false, message: "Bad Request Invalid Driver or Ride Details" });
    // }
    // const verifyDriver = await DriverModel.findOne({_id:driverid,assign:1,status:true,dcity:verifyRide.cityid,servicetype:verifyRide.vehicleid})
    // console.log("Accept Driver Request",verifyDriver);
    // if(!verifyRide || !verifyDriver){
    //   return res.status(400).json({ success: false, message: "Bad Request Invalid Driver or Ride Details" });    }
    const updateRide = await CreateRideModel.findOneAndUpdate(
      { _id: rideid, driver: driverid, ridestatus: 1 },
      {
        ridestatus: 3,
        assigntime: null,
        driver: mongoosedriver,
        nearest: false,
        driverArray: [],
      },
      { new: true, select: "_id ridestatus cityid vehicleid driver" }
    ).populate({path:"driver", select:"dname"});
    console.log("Accept UPDATE RIDE", updateRide);
    if (!updateRide) {
      return res.status(200).json({
        success: false,
        message: "Failed to Accept the Ride  ",
      });
    }
    const updatedriver = await DriverModel.findOneAndUpdate(
      {
        _id: driverid,
        assign: 1,
        status: true,
        dcity: updateRide.cityid,
        servicetype: updateRide.vehicleid,
      },
      { assign: 2 },
      { new: true }
    );
    if (!updatedriver) {
      return res.status(200).json({
        success: false,
        message: "Failed to Accept the  Driver ",
      });
    }
    const senddata = {
      _id: updateRide._id,
      driverDetails: updatedriver,
      ridestatus: updateRide.ridestatus,
    };
    global.io.emit("acceptRide", senddata);
    return res.status(200).json({
      success: true,
      data: updateRide,
      message: "Ride and Driver Status Accepted Successfully",
    });
  } catch (error) {
    console.log("AcceptRide Error", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

const ArrivedRide = async (req, res) => {
  try {
    console.log("ArrivedRide", req.body);
    const { rideid, driverid } = req.body;
    const verifyRide = await CreateRideModel.findOne({ _id: rideid });
    console.log("verifyRide--verifyRide", verifyRide);
    const updateRide = await CreateRideModel.findOneAndUpdate(
      { _id: rideid, driver: driverid, ridestatus: 3 },
      { ridestatus: 4 },
      { new: true, select: "_id ridestatus" }
    );
    console.log("Arrived update-->>", updateRide);
    if (updateRide) {
      global.io.emit("updateRideStatus", updateRide);
      return res.status(200).json({
        success: true,
        data: updateRide,
        message: "Ride and Driver Status ArrivedRide Successfully",
      });
    } else {
      return res.status(200).json({
        success: false,
        message:
          "Bad Request Failed to update ArrivedRide the Ride and Driver ",
      });
    }
  } catch (error) {
    console.log("ArrivedRide Error", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

const CancelRide = async (req, res) => {
  try {
    console.log("CancelRideis called --->", req.body);
    const { rideid, driverid } = req.body;
    const updateRide = await CreateRideModel.findOneAndUpdate(
      { _id: rideid, driver: null, ridestatus: 0 },
      { ridestatus: 7 },
      { new: true, select: "_id ridestatus" }
    );
    if (updateRide) {
      global.io.emit("updateRideStatus", updateRide);
      return res.status(200).json({
        success: true,
        data: updateRide,
        message: "Ride Status CancelRide Successfully",
      });
    } else {
      return res.status(200).json({
        success: false,
        message: "Failed to CancelRide the Ride Due to unmatched Data passed",
      });
    }
  } catch (error) {
    console.log("CancelRide Error", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const PickedRide = async (req, res) => {
  try {
    console.log("PickedRide", req.body);
    const { rideid, driverid } = req.body;
    const updateRide = await CreateRideModel.findOneAndUpdate(
      { _id: rideid, driver: driverid, ridestatus: 4 },
      { ridestatus: 5 },
      { new: true, select: "_id ridestatus" }
    );
    // const updatedriver = await DriverModel.findByIdAndUpdate(driverid,{assign:2})
    if (updateRide) {
      global.io.emit("updateRideStatus", updateRide);
      return res.status(200).json({
        success: true,
        data: updateRide,
        message: "Ride and Driver Status PickedRide Successfully",
      });
    } else {
      return res
        .status(200)
        .json({ success: false, message: "Failed to PickedRide the Ride " });
    }
  } catch (error) {
    console.log("PickedRide Error", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

const CompletedRide = async (req, res) => {
  try {
    console.log("CompletedRide", req.body);
    const { rideid, driverid } = req.body;
    // const verifyRide = await CreateRideModel.findOne({_id:rideid,driver:driverid,ridestatus:5})
    // if(!verifyRide){
    //   return res.status(400).json({ success: false, message: "Bad Request Invalid Driver or Ride Details" });
    // }
    // const verifyDriver = await DriverModel.findOne({_id:driverid,assign:1,status:true,dcity:verifyRide.cityid,servicetype:verifyRide.vehicleid})
    // if(!verifyDriver){
    //   return res.status(400).json({ success: false, message: "Bad Request Invalid Driver or Ride Details" });
    // }

    const updateRide = await CreateRideModel.findOneAndUpdate(
      { _id: rideid, driver: driverid, ridestatus: 5 },
      { ridestatus: 6 },
      { new: true }
    ).populate({ path: "userid", select: "customerid" });
    if (!updateRide || updateRide.driver != driverid) {
      return res.status(200).json({
        success: false,
        message: "Failed to CompletedRide the Ride and Driver ",
      });
    }
    const updateDriver = await DriverModel.findByIdAndUpdate(
      {
        _id: updateRide.driver,
        assign: 1,
        status: true,
        dcity: updateRide.cityid,
        servicetype: updateRide.vehicleid,
      },
      { assign: 0 },
      { new: true }
    );
    if (!updateDriver) {
      return res.status(200).json({
        success: false,
        message: "Failed to CompletedRide the Ride and Driver ",
      });
    }

    // if (updateRide && updateDriver) {
    console.log("updateRide11111---", updateRide);
    console.log("updateDriver1222---", updateDriver);

    const result = await Payment(updateRide.userid, updateDriver, updateRide); //status 3 for failure
    console.log("result--->>><<<---", result);
    global.io.emit("updateRideStatus", updateRide);

    return res.status(200).json({
      success: true,
      data: result,
      message: "Ride and Driver Status CompletedRide Successfully",
    });
    // } else {
    // res.status(200).json({
    // success: false,
    // message: "Failed to CompletedRide the Ride and Driver ",
    // });
    // }

    // IMP // Nodemailer service from Utils

    // const n_recipient = "20ce029.ankit.dabhi@vvpedulink.ac.in";
    // const n_subject = "Hello from Node.js";
    // const n_message ="This is a test email sent from a Node.js script using Nodemailer as a utility.";

    // const mailService = await sendEmail(n_recipient, n_subject, n_message);
    // console.log("Email successfully sent:", mailService.response);

    // // Twillio service from Utils
    // const t_message = "Your Ride has successfully completed !";
    // const messageInstance = await sendSms("+917802041909", t_message);
    // console.log("SMS Twillio sent successfully:", messageInstance.sid);
  } catch (error) {
    console.log("CompletedRide Error", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const getApprovalTime = async (req, res) => {
  try {
    const data = await SettingsModel.findOne();
    if (data) {
      const timeout = data.ride_approvalTime;
      res.status(200).json({
        success: true,
        data: timeout,
        message: "Timeout of Running Request success",
      });
    } else {
      res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  } catch (error) {
    console.log("getApprovalTime Error", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

module.exports = {
  getAllRunningRequests,
  rejectRequest,
  rejectRequestFn,
  AcceptRide,
  ArrivedRide,
  PickedRide,
  CompletedRide,
  CancelRide,
  getApprovalTime,
};
