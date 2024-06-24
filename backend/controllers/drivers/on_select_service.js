const DriverModel = require('../../models/driver')
const mongoose = require('mongoose')

const onSelectService = async (req,res) => {
    try {
        console.log(
          "/on_select_vehicle----------------------------------------------"
        );
        console.log(req.body);
        let vehicleid;
        if (req.body.vehicleid === null) {
          vehicleid = null;
        } else {
          vehicleid = new mongoose.Types.ObjectId(req.body.vehicleid);
        }
        const { driverid } = req.body;
        const setservice = await DriverModel.findByIdAndUpdate(
          { _id: driverid }, 
          { $set: { servicetype: vehicleid } }, 
          { new: true } 
        )
        .populate({
          path: 'servicetype',
          select: '_id vname' 
        });
        console.log('setservice------->>',setservice);
        res.status(200).json({ success: true,data:setservice.servicetype, message: "Service type updated successfully" });
      } catch (error) {
        console.log("on_select_vehicle", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
      }
}

const updateDriverStatus = async (req,res) => {
    try {
        console.log(req.body);
        const { driverid, status } = req.body;
        const setstatus = await DriverModel.findByIdAndUpdate(
          { _id: driverid }, 
          { $set: { status: status } },
          { new: true }
        );
        if (setstatus) {
          res
            .status(200)
            .json({ success: true, message: "Driver status updated Successfully" });
        } else {
          res.status(201).json({ success: false, message: "Something went wrong" });
        }
      } catch (error) {
        res.status(500).json({ success: false, message: "Internal server Error" });
      }
}
module.exports = {onSelectService,updateDriverStatus}