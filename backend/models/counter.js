const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
    _id: { type: String, required: true }, // The name of the counter (e.g., 'rideNo')
    seq: { type: Number, default: 0 }      // The sequence value
});

const Counter = mongoose.model('Counter', counterSchema);

module.exports = Counter;
