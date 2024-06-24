const mongoose = require('mongoose');
const Counter = require('../models/counter')

const userSchema = new mongoose.Schema({
  user_no: { type: Number, unique: true },

  uname: {
    type: String,
    required: true,
  },
  uemail: {
    type: String,
    required: true,
    unique:true
  },
  customerid : {
    type: String,
    unique:true
  },
  uimage: {
    type: String,
    required: true,
  },
  ccode: {
    type: mongoose.Schema.Types.ObjectId,
    ref:'Country',   
    required: true,
  },
  new_arr : {
    type : Array,
    default : []
  },
  uphone: {
    type: String,
    required: true,
  }
})

userSchema.pre('save', async function(next) { 
  const doc = this;

  if (doc.isNew) {
      try {
          const counter = await Counter.findOneAndUpdate(
            { _id: 'user_no' },
              { $inc: { seq: 1 } },
              { new: true, upsert: true }
          );
          doc.user_no = counter.seq;
          next();
      } catch (error) {
          next(error);
      }
  } else {
      next();
  }
});
const UserModel = mongoose.model('UserModel', userSchema);
module.exports = UserModel;