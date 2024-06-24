const VehiclePricingModel = require("../../models/vehicle_pricing");
const UserModel = require("../../models/users");
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const CreateRideModel = require("../../models/create_ride");
const SettingModel = require("../../models/settings");
const StripePrivatekey = process.env.STRIPE_PRIVATE_KEY;
const stripe = require("stripe")(StripePrivatekey);

const CityZone = require("../../models/city_zone");

const getCallCodes = async (req, res) => {
  try {
    const allcountries = await VehiclePricingModel.aggregate([
      // contains _id, countryid:{cname,ccurr,ccode, ccallcode,tzone, }
      {
        $group: {
          _id: "$countryid",
        },
      },
      {
        $lookup: {
          from: "countries",
          localField: "_id",
          foreignField: "_id",
          as: "countryid",
        },
      },
      {
        $unwind: "$countryid",
      },
      {
        $project: {
          _id: 0,
          countryid: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: allcountries,
      message: "All country call codes received successfully",
    });
    // res.send(allcountries)
  } catch (error) {
    console.log("getCallCodes Error", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const isUser = async (req, res) => {
  try {
    console.log("isUser route us called", req.body);
    const { countryid, phone } = req.body;
    let isUser;
    isUser = await UserModel.findOne({
      $and: [{ ccode: countryid }, { uphone: phone }],
    });

    console.log("isUser->>", isUser);
    const stopCount = await SettingModel.findOne();
    if (isUser) {
      const isAllreadybookedRide = await CreateRideModel.findOne({
        userid: isUser._id,
      });
      if (isAllreadybookedRide) {
        console.log("isAllreadybookedRide", isAllreadybookedRide);
        if (
          isAllreadybookedRide.ridestatus !== 6 &&
          isAllreadybookedRide.ridestatus !== 7
        ) {
          return res
            .status(200)
            .json({
              success: false,
              message: "This User has not completed Previous Ride",
            });
        }
      }
      let stripe;
      await SettingModel.findOne()
        .then(async (data) => {
          stripe = require("stripe")(data.stripe_privateKey);
        })
        .catch((error) => console.log("STRIPE Errorr", error));

      const cards = await stripe.customers.listSources(isUser.customerid, {
        object: "card",
      });
      console.log("cards->>", cards);
      const hasCard = cards.data.length > 0 ? true : false;
      res
        .status(200)
        .json({
          success: true,
          data: { user: isUser, hasCard: hasCard, stopCount: stopCount.ride_stops },
          message: "User found successfully",
        });
      return;
    }

    return res.status(404).json({ success: false, error: "User Not found " });

    // res.send(isUser)
  } catch (error) {
    console.log("isUser Error", error);
    return res
      .status(500)
      .json({ success: false, error: "Internal Server Error " });
  }
};

const sampletesting = async (req, res) => {
  try {
    // const countryid = req.id
    const allLatOfCities = await VehiclePricingModel.aggregate([
      {
        $match: {
          countryid: new mongoose.Types.ObjectId("66220ba612b766761fbf0ae2"),
        },
      },
      {
        $group: {
          _id: "$cityid",
        },
      },
      {
        $lookup: {
          from: "cityzones",
          localField: "_id",
          foreignField: "_id",
          as: "citylat",
        },
      },

      {
        $project: {
          _id: 1,
          zone: {
            $arrayElemAt: ["$citylat.zone", 0],
          },
        },
      },

    ]);

    // const allLatArray = allLatOfCities[0].latArray

    // res.send(allLatArray)
    res.send(allLatOfCities);
  } catch (error) {
    console.log("sample testing error", error);
  }
};

const isLocationInsideZone = async (req, res) => {
  try {
    console.log("REQ BODY islocationinside ", req.body);
    const { lat, lng } = req.body;
    const verify = await CityZone.findOne({
      zone: {
        $geoIntersects: {
          $geometry: {
            type: "Point",
            coordinates: [lng, lat],
          },
        },
      },
    });
    console.log("VERIFY ZONE IS INSIDE", verify);
    if (verify) {
      console.log(
        "--------------------------------------------------------------------"
      );
      console.log(
        "--------------------------------------------------------------------"
      );
      return res
        .status(200)
        .json({
          success: true,
          cityid: verify._id,
          message: "Place is Inside the Zone ",
        });
    } else {
      return res
        .status(200)
        .json({
          success: false,
          message: "Sorry Bro place is OUTSIDE the Zone ",
        });
    }
  } catch (error) {
    console.log("isLocationInsideZone-->", error);
  }
};

const getAllVehiclesPricing = async (req, res) => {
  try {
    console.log("req.body", req.body);
    const id = new mongoose.Types.ObjectId(req.body.id);
    const alldata = await VehiclePricingModel.aggregate([
      {
        $match: {
          cityid: id,
        },
      },
      {
        $lookup: {
          from: "vehicles",
          localField: "vehicleid",
          foreignField: "_id",
          as: "vehicleData",
        },
      },
      {
        $unwind: "$vehicleData",
      },
    ]);
    console.log("alldata", alldata);
    return res
      .status(200)
      .json({
        success: "true",
        data: alldata,
        message: "All vehicles of this city got successfully",
      });
    // res.send(alldata)
  } catch (error) {
    console.log("getAllVehiclesPricing", error);
  }
};

const bookRide = async (req, res) => {
  try {
    // const io = req.app.get('io');
    console.log("bookRide -> ", req.body);

    const data = new CreateRideModel(req.body);
    // const status = 1;
    const status = await data.save();
    console.log("FINAL BOOKED RIDE ->>", status);
    if (!status) {
      return res
        .status(500)
        .json({ success: false, message: "Failed to book your Ride " });
    }

    console.log("STATUS ID ", status);
    const thisRide = await CreateRideModel.aggregate([
      {
        $match: { _id: status._id },
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
          as: "driver",
        },
      },
      {
        $addFields: {
          driver: { $arrayElemAt: ["$driver", 0] },
        },
      },
      {
        $project: {
          driver: 1,
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
    ]);

    console.log("thisRide ____---------->", thisRide[0]);
    global.io.emit("testme", thisRide[0]);
    res
      .status(200)
      .json({ success: true,data:status, message: "Ride booked Successfully" });
  } catch (error) {
    console.log("bookRide-Error", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to book your Ride " });
  }
};

module.exports = {
  getCallCodes,
  isUser,
  sampletesting,
  getAllVehiclesPricing,
  bookRide,
  isLocationInsideZone,
};
