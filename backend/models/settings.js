const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  stripe_privateKey: {
    type: String,
   default:null
},
stripe_publishKey: {
    type: String,
   default:null
},
twilioSid: {
    type: String,
   default:null
},
twilioAuthToken: {
    type: String,
   default:null
},
twilioNumber: {
    type: String,
   default:null
},
node_email: {
    type: String,
   default:null,
    
},
node_emailPassword: {
    type: String,
   default:null
},
ride_stops: {
    type: Number,
    required: true
},
ride_approvalTime: {
    type: Number,
    required: true
}
}, { versionKey: '__v' });

const Setting = mongoose.model('Setting', settingsSchema);
module.exports = Setting;