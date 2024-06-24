// models/CityZone.js
const Country = require('./country')
const Counter = require('../models/counter')

const mongoose = require('mongoose');

// Define the schema for zone and city
const CityZoneSchema = new mongoose.Schema({
  driver_no: { type: Number, unique: true },

  zone: {
    type: {
        type: String,
        enum: ['Polygon'],
        required: true
    },
    coordinates: {
        type: [[[Number]]],
        required: true
    }
},
  // zone: {
  //   type: [[Number]],
  //   required: true,
  //   index: '2dsphere',
  // },
  city: {
    type: String,
    required: true,
    unique:true
  },
  location: {
    type: {lat:Number,lng:Number},
    required: true,

  },
  countryid:{
    type: mongoose.Schema.Types.ObjectId, // Reference to Country model
    ref: Country, // Name of the referenced model
    // required: true
    // type: String,
    required :true
  }
 
}, { versionKey: '__v' });

CityZoneSchema.pre('save', async function(next) { 
  const doc = this;

  if (doc.isNew) {
      try {
          const counter = await Counter.findOneAndUpdate(
            { _id: 'city_no' },
              { $inc: { seq: 1 } },
              { new: true, upsert: true }
          );
          doc.city_no = counter.seq;
          next();
      } catch (error) {
          next(error);
      }
  } else {
      next();
  }
});
CityZoneSchema.index({ zone: '2dsphere' });
const CityZone = mongoose.model('CityZone', CityZoneSchema);
// Create and export the model
module.exports = CityZone;
