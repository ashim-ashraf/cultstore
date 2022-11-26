const { ObjectId } = require("mongodb");
const cart = require("../models/cart");
const product = require("../models/product");
const wishlist = require("../models/wishlist");

module.exports = {
  

  

  removeWishlistProduct: async (productDetails) => {
    let wishlistId = productDetails.wishlistId;
    let productId = productDetails.productId;
    return new Promise(async (resolve, reject) => {
      await wishlist
        .updateOne(
          { _id: wishlistId, "products.item": productId },
          { $pull: { products: { item: productId } } }
        )
        .then((response) => {
          resolve({ removeProduct: true });
        });
    });
  },
};
