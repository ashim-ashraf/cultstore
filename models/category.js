const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      maxlength: 32,
    },

    offer: Number,
  },
  { versionKey: false }
);

module.exports = mongoose.model("Category", categorySchema);
