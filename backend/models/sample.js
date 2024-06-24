const mongoose = require('mongoose');
const vehicle = require('./vehicletype');
const SampleSchema = new mongoose.Schema({
    vehicletypes: {
        type :Array,
        unique : true,
        required : true, 
    }
});

const Sample = mongoose.model('Sample', SampleSchema);
module.exports = Sample;