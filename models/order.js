const mongoose = require("mongoose");
const { Number, Object } = require("mongoose/lib/schema/index");

const orderSchema = new mongoose.Schema(
  {
    userId: mongoose.ObjectId,
    products: [
      {
        item: mongoose.ObjectId,
        price:Number,
        quantity: Number,
        status: {
          type: String,
          default: "placed",
        },
      },
    ],
    deliveryDetails: Object,
    paymentMethod: String,
    paymentStatus: String,
    totalAmount: Number,
    couponDiscount: Number,
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { versionKey: false }
);
module.exports = mongoose.model("Order", orderSchema);
