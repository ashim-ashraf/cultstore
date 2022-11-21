const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      maxlength: 32,
    },
    discount: Number,
    minPurchase: Number,
    priceCap:Number,
    expiry:Date
  },
  { versionKey: false }
);

module.exports = mongoose.model("Coupon", couponSchema);