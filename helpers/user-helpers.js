const cart = require("../models/cart");
const wishlist = require("../models/wishlist");

module.exports = {

  
  changeProductQuantity: (userObject) => {
    // console.log(userObject);
    const cartId = userObject.cart;
    const productId = userObject.product;
    const count = parseInt(userObject.count);
    let quantity = parseInt(userObject.quantity);
    // console.log(cartId, productId, count, quantity);
    return new Promise(async (resolve, reject) => {
      if (count == -1 && quantity == 1) {
        await cart
          .updateOne(
            { _id: cartId, "products.item": productId },
            { $pull: { products: { item: productId } } }
          )
          .then((response) => {
            resolve({ removeProduct: true });
          });
      } else {
        let productCount = await cart.updateOne(
          { _id: cartId, "products.item": productId },
          { $inc: { "products.$.quantity": count } }
        );
        resolve({ status: true });
      }
    });
  },

  removeCartProduct: async (productDetails) => {
    let cartId = productDetails.cart;
    let productId = productDetails.product;
    return new Promise(async (resolve, reject) => {
      await cart
        .updateOne(
          { _id: cartId, "products.item": productId },
          { $pull: { products: { item: productId } } }
        )
        .then((response) => {
          resolve({ removeProduct: true });
        });
    });
  },

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
