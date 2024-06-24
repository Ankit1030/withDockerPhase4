const mongoose = require('mongoose');
const Counter = require('../models/counter')


const createRideSchema = new mongoose.Schema({
    ride_no: { type: Number, unique: true },
    userid: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'UserModel',
        required: true
    },
    feedback: {
        type:{
            rating:Number,
            message:String,
        },
        default:null
 
      },
    cityid: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'CityZone', 
    },
    fromLocation: {
        type: String,
        required: true
    },
    // fromlatlng: {
    //     type: String,
    //     required: true
    // },
    
    toLocation: {
        type: String,
        required: true
    },
    waypointsLocation: {
        type: [String],
        default: []
    },
    vehicleid: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'Vehicle',
        required:true,
    },
    paymentType: {
        type: String,
        required: true
    },
    estimatedFarePrice: {
        type: Number,
        required: true
    },
    estimatedTime: {
        type: String,
        required: true
    },
    rideDistance: {
        type: Number,
        required: true
    },
    rideDuration: {
        type: Number,
        required: true
    },
    bookTime: {
        type: String,
        required: true
    },
    bookDate: {
        type: String,
        required: true
    },
    bookDateandTime: {
        type: Number,
        required: true
    },
    ridestatus: {
        type: Number,
        default: 0
    },
    driver:{
        type: mongoose.Schema.Types.ObjectId,
        // ref:'Vehicle',
        default:null
        // default:new mongoose.Types.ObjectId('000000000000000000000000')
    },
    nearest:{
        type:Boolean,
        default:false,
    },
    driverArray:{
        type:[ mongoose.Schema.Types.ObjectId],
        default:null
    },
    assigntime:{
        type:Number,
        default:null

    }
//ride_no,feedback,ridestatus,driver,nearest,driverArray,assigntime
});
createRideSchema.pre('save', async function(next) { 
    const doc = this;
  
    if (doc.isNew) {
        try {
            const counter = await Counter.findOneAndUpdate(
              { _id: 'ride_no' },
                { $inc: { seq: 1 } },
                { new: true, upsert: true }
            );
            doc.ride_no = counter.seq;
            next();
        } catch (error) {
            next(error);
        }
    } else {
        next();
    }
  });
const CreateRideModel = mongoose.model('CreateRide', createRideSchema);

module.exports = CreateRideModel;
