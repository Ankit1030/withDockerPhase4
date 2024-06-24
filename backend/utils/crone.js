const { io } = require("socket.io-client");
const CreateRideModel = require("../models/create_ride");
const DriverModel = require("../models/driver");
const cron = require("node-cron");

// const job = cron.schedule(
//   "*/1 * * * * *",
//   () => {
//     cronefn();
//     console.log("Running---------22222----------------------- task...");
//   },
//   { scheduled: false }
// );

const cronefnsimple = async () => {
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
          ridestatus: 1,
          nearest: false,
          assigntime: { $ne: null },
          $expr: {
            $gte: [
              { $abs: { $subtract: [new Date().getTime(), "$assigntime"] } },
              { $multiply: [1000, "$settings.ride_approvalTime"] },
            ],
          },
        },
      },

      {
        $project: {
          _id: 1,
          driver: 1,
        },
      },
    ];


    const data = await CreateRideModel.aggregate(pipeline);
    // console.log("CRONE DATA-->>>", data);
    if (data.length === 1) {
      console.log("ONlu single data requesed", data[0]._id);
      const rideid = data[0]._id;
      const driverid = data[0].driver;

      const updateDriverstatus = await DriverModel.findByIdAndUpdate(
        driverid,
        { assign: 0 },
        { new: true }
      );

      const updateRide = await CreateRideModel.findByIdAndUpdate(
        rideid,
        { driver: null, assigntime: null, ridestatus: 0 },
        { new: true }
      );
      const senddata = {
        _id: updateRide._id,
        ridestatus: updateRide.ridestatus,
        driverDetails: null,
      };

      global.io.emit("setNotification", global.incrementNotification());

      global.io.emit("NoDriverFound", { data: senddata });
    }

    if (data.length > 1) {
      for (i = 0; i < data.length; i++) {
        const rideid = data[i]._id;
        const driverid = data[i].driver;

        const updateDriverstatus = await DriverModel.findByIdAndUpdate(
          driverid,
          { assign: 0 },
          { new: true }
        );

        updateRide = await CreateRideModel.findByIdAndUpdate(
          rideid,
          { driver: null, assigntime: null, ridestatus: 0 },
          { new: true }
        );
        const senddata = {
          _id: updateRide._id,
          ridestatus: updateRide.ridestatus,
          driverDetails: null,
        };

        global.io.emit("setNotification", global.incrementNotification());
        console.log("NODRIVERFOUND sendata", senddata);
        global.io.emit("NoDriverFound", { data: senddata });
      }
    }
  } catch (error) {
    console.log("cronefnsimple ERROR", error);
  }
};

module.exports = { cronefnsimple };
