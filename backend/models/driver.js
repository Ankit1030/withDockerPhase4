const mongoose = require("mongoose");
const Counter = require("../models/counter");
const driverSchema = new mongoose.Schema({
  driver_no: { type: Number, unique: true },
  dname: {
    type: String,
    required: true,
  },
  demail: {
    type: String,
    unique: true,
    required: true,
  },
  dimage: {
    type: String,
    required: true,
  },
  servicetype: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vehicle",
    default: null,
  },
  status: {
    type: Boolean,
    default: false,
  },
  ccode: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Country",
    required: true,
  },
  dcity: {
    // type: String,
    type: mongoose.Schema.Types.ObjectId,
    ref: "CityZone",
    required: true,
  },
  dphone: {
    type: String,
    // unique:true,
    required: true,
  },
  assign: {
    type: Number,
    default: 0,
  },
  customerid: {
    type: String,
  },
  bankstatus: {
    type: Boolean,
    default: 0,
  },
});

driverSchema.pre("save", async function (next) {
  const doc = this;

  if (doc.isNew) {
    try {
      const counter = await Counter.findOneAndUpdate(
        { _id: "driver_no" },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      doc.driver_no = counter.seq;
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

const DriverModel = mongoose.model("DriverModel", driverSchema);

module.exports = DriverModel;
