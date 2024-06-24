const CityModel = require("../../models/city_zone");
const mongoose = require("mongoose");

const saveZone = async (req, res) => {
  console.log(req.body);
  if (req.body._id) {
    console.log(
      "-------------------------------TO UPDATE THE CITY ZONE --------------------------"
    );
    try {
      const id = req.body._id;
      const updatedDocument = await CityModel.findByIdAndUpdate(
        { _id: id },
        {
          $set: {
            zone: {
              type: 'Polygon',
              coordinates: req.body.zone
            },
          },
        },
        { new: true }
      );
      if (updatedDocument) {
        console.log("Updated CityModel document:", updatedDocument);
        return res
          .status(200)
          .json({ success: true, message: "City zone Updated Succesfully" });
      } else {
        return res
          .status(404)
          .json({
            success: false,
            message: "Failed to Update as User not found",
          });
      }
    } catch (error) {
      console.log("Error occurred:", error);
      return res
        .status(500)
        .json({
          status: false,
          message: "Failed to Update Internal Server Error",
        });
    }
  }
  //---------------------------------------------------------------------------------------------------------------------------------------------------------
  // console.log("---------------------------- TO SAVE THE NEW ZONE CITY----------------------------------------");
  //---------------------------------------------------------------------------------------------------------------------------------------------------------
  else {
    try {
      const { zone, city, countryid, location } = req.body;
      const newCityModel = new CityModel({
        zone: {
          type: 'Polygon',
          coordinates: zone
        },
        city,
        countryid,
        location,
      });
      const saved = await newCityModel.save();
      if (saved) {
        return res
          .status(201)
          .json({ success: true, message: "CityModel stored successfully" });
      } else {
        return res.status(400).json({ error: "Failed to save zone data" });
      }
    } catch (error) {
      console.log(
        "--- THIS ERROR---------------------------------------------------------------------------------"
      );
      console.log(error);
      if (error.code === 11000) {
        //if user tries to save the zone in allready added city
        return res
          .status(401)
          .json({ success: false, message: "Duplicate Entry Data." });
      }
      return res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  }
};
module.exports = { saveZone };
