const mongoose = require('mongoose');

// Define schema for VehiclePricing model
const vehiclePricingSchema = new mongoose.Schema({
  index_no: { type: Number, unique: true },

    countryid: {
        type: mongoose.Schema.Types.ObjectId, // Reference to Country model
        ref:'Country',
        // type: String,
        required: true
    },
    city: {
        type: String,
       
    },
    cityid:{
        // type:String,
        type: mongoose.Schema.Types.ObjectId, // Reference to Country model
        ref:'CityZone',
        required:true,
    },
    vehicletype: { // DONOT USE WHILE MATCHING AND SENDING RESPONSE
        type: String,
        
       
    },
    vehicleid:{
        // type:String,
        type: mongoose.Schema.Types.ObjectId, // Reference to Country model
        ref:'Vehicle',
        required:true,
    },
    driverProfit: {
        type: Number,
        required: true
      },
      minFare: {
        type: Number,
        required: true
      },
      distanceBasePrice: {
        type: Number,
        required: true
      },
      basePrice: {
        type: Number,
        required: true
      },
      pricePerUnitDistance: {
        type: Number,
        required: true
      },
      pricePerUnitTime: {
        type: Number,
        required: true
      },
      maxSpace: {
        type: Number,
        required: true
      }
}, { versionKey: '__v' });

vehiclePricingSchema.pre('save', async function(next) { 
  const doc = this;

  if (doc.isNew) {
      try {
          const counter = await Counter.findOneAndUpdate(
            { _id: 'index_no' },
              { $inc: { seq: 1 } },
              { new: true, upsert: true }
          );
          doc.index_no = counter.seq;
          next();
      } catch (error) {
          next(error);
      }
  } else {
      next();
  }
});
// Create VehiclePricing model
vehiclePricingSchema.index({countryid: 1,cityid: 1,vehicleid :1}, { unique: true });
const VehiclePricing = mongoose.model('VehiclePricing', vehiclePricingSchema);

module.exports = VehiclePricing;
