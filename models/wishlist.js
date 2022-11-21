const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema(
  {
    user: mongoose.ObjectId,
    products: [
      {
        item: mongoose.ObjectId,
      },
    ],
  },
  { versionKey: false }
);

module.exports = mongoose.model("Wishlist", wishlistSchema);
