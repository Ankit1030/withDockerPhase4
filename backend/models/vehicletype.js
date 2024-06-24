const mongoose = require('mongoose');

const dataSchema = new mongoose.Schema({
    vname: {
        type :String,
        required : true, 
        unique : true,
        collation: { locale: 'en', strength: 2 }
    },
    vimage: {
        type :String,
        required : true, 
        unique : true
    }, // Store image as Buffer
}, { versionKey: '__v' });

const VehicleModel = mongoose.model('Vehicle', dataSchema);
module.exports = VehicleModel;
