const mongoose = require('mongoose');
const Counter = require('../models/counter')

const countrySchema = new mongoose.Schema({

    country_no: { type: Number, unique: true },

    cname: {
        type :String,
        unique : true,
        required : true, 
    },
    ccurr: {
        type :String,
        required : true, 
    }, // Store image as Buffer
    ccode: {
        type :String,
        required : true, 
    },
    ccallcode: {
        type :String,
        required : true, 
    },
    tzone: {
        type :String,
        required : true, 
    },
    flag: {
        type :String,
        unique : true,
       
    }
}       );

countrySchema.pre('save', async function(next) { 
    const doc = this;
  
    if (doc.isNew) {
        try {
            const counter = await Counter.findOneAndUpdate(
              { _id: 'country_no' },
                { $inc: { seq: 1 } },
                { new: true, upsert: true }
            );
            doc.country_no = counter.seq;
            next();
        } catch (error) {
            next(error);
        }
    } else {
        next();
    }
  });
const Country = mongoose.model('Country', countrySchema);
module.exports = Country;