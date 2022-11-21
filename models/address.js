const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
  {
    user: mongoose.ObjectId,
    address: [
      {
        fname: String,
        lname: String,
        address: String,
        pincode:Number,
        mobile:Number
      },
    ],
  },
  { versionKey: false }
);

module.exports = mongoose.model("Address", addressSchema);