const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: true,
      maxlength: 32,
    },

    subTitle: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    
    ImageFileName: {
      type: Array,
    },
  },
  { versionKey: false }
);

module.exports = mongoose.model("Banner", bannerSchema);
