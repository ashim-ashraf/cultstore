const mongoose = require("mongoose");
const { Date, Number } = require("mongoose/lib/schema/index");

const walletSchema = new mongoose.Schema(
  {
    user: mongoose.ObjectId,
    email: String,
    balance: Number,
    history: Array,
  },
  { versionKey: false }
);

module.exports = mongoose.model("Wallet", walletSchema);
