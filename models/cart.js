const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    user: mongoose.ObjectId,
    products: [
      {
        item: mongoose.ObjectId,
        price: Number,
        quantity: Number,
      },
    ],
  },
  { versionKey: false }
);

module.exports = mongoose.model("Cart", cartSchema);
