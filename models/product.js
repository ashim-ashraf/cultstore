const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      maxlength: 32,
    },

    description: {
      type: String,
      required: true,
      maxlength: 2000,
    },

    actualprice : {
      type: Number,
      trim: true,
      required: true,
      maxlength: 32,
    },

    price: {
      type: Number,
      trim: true,
      required: true,
      maxlength: 32,
    },

    discount:Number,

    category: {
      type: String,
    },

    quantity: {
      type: Number,
    },

    ImageFileName: {
      type: Array,
    },
  },
  { versionKey: false }
);

module.exports = mongoose.model("Product", productSchema);
