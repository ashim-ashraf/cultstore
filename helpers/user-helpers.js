const { ObjectId } = require("mongodb");
const cart = require("../models/cart");
const product = require("../models/product");
const wishlist = require("../models/wishlist");

module.exports = {
  

  

  removeWishlistProduct: async (proId , user) => {
    
    return new Promise(async (resolve, reject) => {
      await wishlist
        .updateOne(
          { user: user._id , "products.item": proId },
          { $pull: { products: { item: proId } } }
        )
        .then((response) => {
          resolve({ removeProduct: true });
        });
    });
  },
};
