const product = require("../models/product");
const Cart = require("../models/cart");
const cart = require("../models/cart");
const { ObjectId } = require("mongodb");
const Order = require("../models/order");
const order = require("../models/order");
const Address = require("../models/address");
const { reject } = require("lodash");
const address = require("../models/address");
const wallet = require("../models/wallet");
const coupon = require("../models/coupon");
const user = require("../models/user");
const wishlist = require("../models/wishlist");
const { db } = require("../models/user");

module.exports = {
  removeCartProduct: async (productDetails) => {
    let cartId = productDetails.cart;
    let productId = productDetails.product;
    let cartQuantity =parseInt(productDetails.cartQuantity) ;
    return new Promise(async (resolve, reject) => {
      await cart
        .updateOne(
          { _id: cartId, "products.item": productId },
          { $pull: { products: { item: productId } } }
        )
        .then( async(response) => {
          console.log(productId)
          let result = await product
          .updateOne({_id: productId},{$inc: {quantity: cartQuantity }})
          console.log("hiiiiiiiiiiiiiiiiiii", result);
          resolve({ removeProduct: true });
        });
    });
  },

  changeProductQuantity: (userObject) => {
    // console.log(userObject);
    const cartId = userObject.cart;
    const productId = userObject.product;
    const count = parseInt(userObject.count);
    return new Promise(async (resolve, reject) => {
        let modifier = -(count);
        let productData = await product.findOne({_id: productId})
        if (productData.quantity == 0 && count == 1){
          let resultObj = {
            outOfStock : true,
            productId : productId
          }
          reject(resultObj);
        } else {
          await cart.updateOne(
            { _id: cartId, "products.item": productId },
            { $inc: { "products.$.quantity": count } }
          ).then( async(response) =>{
           let productUpdate = await product
          .updateOne({_id: productId},{$inc: {quantity: modifier }})
          resolve({ status: true });
          });
        }
      })
  },

  getAllProducts: () => {
    return new Promise(async (resolve, reject) => {
      let products = await product.find();
      console.log(products);
      resolve(products);
    });
  },

  updateOfferPrice: (productDetails) => {
    return new Promise(async (resolve, reject) => {
      await product
        .updateOne(
          { _id: productDetails._id },
          {
            price: productDetails.calculatedPrice,
            discount: productDetails.discountPercentage,
          }
        )
        .then((result) => {
          resolve(result);
        });
    });
  },

  getProduct: (productId) => {
    return new Promise(async (resolve, reject) => {
      let productDetails = await product.find({ _id: productId });
      resolve(productDetails);
    });
  },

  productInCartStatus: (productId,userId) => {
    return new Promise(async (resolve, reject) => {
      let userCart = await Cart.findOne({ user: userId });
      if (userCart) {
        let productExist = userCart.products.findIndex(
          (product) => product.item == productId
        );
    
        if (productExist != -1) {
          resolve(true);
        } else{
          resolve(false)
        }
        } else {
          resolve(false)
        }
    })
  },

  productInWishlistStatus: (productId,userId) => {
    return new Promise(async (resolve, reject) => {
      let userwishlist = await wishlist.findOne({ user: userId });
      console.log(userwishlist);
      if (userwishlist) {
        let productExist = userwishlist.products.findIndex(
          (product) => product.item == productId
        );
    
        if (productExist != -1) {
          resolve(true);
        } else{
          resolve(false)
        }
        } else {
          resolve(false)
        }
    })
  },

  walletByUser: (userId, userEmail) => {
    return new Promise(async (resolve, reject) => {
      let userWallet = await wallet.findOne({ user: userId });

      if (userWallet) {
          resolve("wallet exist");
        } else {
        let walletObj = {
          user: ObjectId(userId),
          email: userEmail,
          balance: 0.0,
        };
        console.log("wallet created");
        const userWallet = new wallet(walletObj);
        userWallet.save((err, result) => {
          if (err) {
            return res.status(400).json({
              err: errorHandler(err),
            });
          } else {
            resolve(result);
          }
        });
      }
    });
  },

  addAddress: (addressDetails) => {
    userId = addressDetails.userId;
    console.log(addressDetails);
    let addressObj = {
      fname: addressDetails.fname,
      lname: addressDetails.lname,
      address: addressDetails.address,
      pincode: addressDetails.pincode,
      mobile: addressDetails.mobile,
    };
    return new Promise(async (resolve, reject) => {
      let userAddress = await Address.findOne({ user: addressDetails.userId });

      if (userAddress) {
        console.log(userId);
        console.log("address updated");
        const query = { user: userId };
        const updateDocument = {
          $push: { address: addressObj },
        };
        const result = await Address.updateOne(query, updateDocument);
        resolve({ status: true });
      } else {
        let userAddressObj = {
          user: userId,
          address: [addressObj],
        };
        console.log("new adress added");
        const address = new Address(userAddressObj);
        address.save((err, address) => {
          if (err) {
            return res.status(400).json({
              err: errorHandler(err),
            });
          }
        });
        resolve({ status: true });
      }
    });
  },

  userCoupenReg: (userDetails, couponDetails) => {
    console.log("In product-Helper", userDetails);
    return new Promise(async (resolve, reject) => {
      await user
        .updateOne(
          { _id: userDetails._id },
          { $push: { usedCoupons: couponDetails.name } }
        )
        .then(() => {
          resolve();
        });
    });
  },

  applyCoupon: (userDetails, code, cart, total) => {
    return new Promise(async (resolve, reject) => {
      let couponDetails = await coupon.findOne({ name: code });
      let verify = await user.findOne({
        _id: userDetails._id,
        usedCoupons: code,
      });
      console.log(verify);
      if (verify) {
        reject("used");
      }
      if (couponDetails) {
        if (
          total <= couponDetails.priceCap &&
          total >= couponDetails.minPurchase
        ) {
          let discountedTotal = parseInt(total - (total * couponDetails.discount) / 100) ;
          console.log("aaaaaaaaaaaaaaaaaaaaa222222222222222aaaaaaaa",discountedTotal);
          resolve(discountedTotal);
        } else {
          resolve({
            Error: `Purchase between ${couponDetails.minPurchase} and ${couponDetails.priceCap}`,
          });
        }
      } else {
        resolve("invalid");
      }
    });
  },

  getUserAddress: (user) => {
    return new Promise(async (resolve, reject) => {
      userAddress = await Address.aggregate([
        { $match: { user: ObjectId(user._id) } },
        { $unwind: "$address" },
        { $project: { _id: 0, address: 1 } },
      ]);
      resolve(userAddress);
    });
  },

  addToCart: (userId, productId, price) => {
    let productObj = {
      item: ObjectId(productId),
      price: price,
      quantity: 1,
    };
    return new Promise(async (resolve, reject) => {
      let userCart = await Cart.findOne({ user: userId });

      if (userCart) {
        let productExist = userCart.products.findIndex(
          (product) => product.item == productId
        );
        // let count = await Cart.aggregate({products:{$elemMatch:{$productNo: productId}}})
        

        if (productExist != -1) {
          resolve("product already exist");
        } else {
          console.log("new producted added");
          const query = { user: userId };
          const updateDocument = {
            $push: { products: productObj },
          };
          const result = await cart.updateOne(query, updateDocument);
          resolve(result);
        }
      } else {
        count = 1;
        productNo = productId;
        let cartObj = {
          user: userId,
          products: [productObj],
        };
        console.log("new cart created");
        const cart = new Cart(cartObj);
        cart.save((err, cart) => {
          if (err) {
            return res.status(400).json({
              err: errorHandler(err),
            });
          }
        });
        resolve();
      }
    });
  },

  addToWishlist: (userId, productId) => {
    let productObj = {
      item: ObjectId(productId),
    };
    return new Promise(async (resolve, reject) => {
      let userWishlist = await wishlist.findOne({ user: userId });

      if (userWishlist) {
        let productExist = userWishlist.products.findIndex(
          (product) => product.item == productId
        );
        // let count = await Cart.aggregate({products:{$elemMatch:{$productNo: productId}}})
        console.log(productExist);

        if (productExist != -1) {
          resolve("product already exist");
        } else {
          console.log("new producted added");
          const query = { user: userId };
          const updateDocument = {
            $push: { products: productObj },
          };
          const result = await wishlist.updateOne(query, updateDocument);
          resolve(result);
        }
      } else {
        count = 1;
        productNo = productId;
        let wishlistObj = {
          user: userId,
          products: [productObj],
        };
        console.log("new cart created");
        const wishlistDeatils = new wishlist(wishlistObj);
        wishlistDeatils.save((err, cart) => {
          if (err) {
            return res.status(400).json({
              err: errorHandler(err),
            });
          }
        });
        resolve();
      }
    });
  },

  getCartItems: (user) => {
    return new Promise(async (resolve, reject) => {
      let cartItems = await cart.aggregate([
        { $match: { user: ObjectId(user._id) } },
        { $unwind: "$products" },
        {
          $project: { item: "$products.item", price:"$products.price" , quantity: "$products.quantity" },
        },
        {
          $lookup: {
            from: "products",
            localField: "item",
            foreignField: "_id",
            as: "product",
          },
        },
        {
          $project: {
            item: 1,
            price:1,
            quantity: 1,
            singleTotal:{$multiply : ["$price","$quantity"]},
            product: { $arrayElemAt: ["$product", 0] },
          },
        },
      ]);
      console.log(cartItems);
      resolve(cartItems);
    });
  },

  getWishlistItems: (user) => {
    return new Promise(async (resolve, reject) => {
      let wishlistItems = await wishlist.aggregate([
        { $match: { user: ObjectId(user._id) } },
        { $unwind: "$products" },
        {
          $project: { item: "$products.item", quantity: "$products.quantity" },
        },
        {
          $lookup: {
            from: "products",
            localField: "item",
            foreignField: "_id",
            as: "product",
          },
        },
        {
          $project: {
            item: 1,
            product: { $arrayElemAt: ["$product", 0] },
          },
        },
      ]);
      console.log(wishlistItems);
      resolve(wishlistItems);
    });
  },

  getCartTotal: (user) => {
    return new Promise(async (resolve, reject) => {
      let products = await cart.findOne({ user: user._id });
      if (products) {
        let total = await cart.aggregate([
          { $match: { user: ObjectId(user._id) } },
          { $unwind: "$products" },
          {
            $project: {
              item: "$products.item",
              quantity: "$products.quantity",
            },
          },
          {
            $lookup: {
              from: "products",
              localField: "item",
              foreignField: "_id",
              as: "product",
            },
          },
          {
            $project: {
              item: 1,
              quantity: 1,
              product: { $arrayElemAt: ["$product", 0] },
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: { $multiply: ["$quantity", "$product.price"] } },
            },
          },
        ]);
        resolve(total[0].total);
      } else {
        resolve();
      }
    });
  },

  getCartItemsList: (userId) => {
    return new Promise(async (resolve, reject) => {
      let products = await cart.findOne({ user: userId });
      // console.log(products);
      resolve(products);
    });
  },

  placeOrder: (orderDetails, user, productsDetails, total, coupon) => {
    console.log("in place Order", productsDetails);
    
    return new Promise(async (resolve, reject) => {
      let status = orderDetails["payment"] === "COD" ? "success" : "pending";
      if(orderDetails["payment"]){
        console.log(orderDetails["payment"]);
      } else {
        reject("paymentSelect")
      }
      let fetchedAddress = {};
      if(orderDetails.address){
        let  [{address}] = await Address.aggregate([
          { $unwind: "$address" },
          { $match: { "address._id": ObjectId(orderDetails.address) } },
          { $project: { _id: 0, address: 1 } },
        ]);
        fetchedAddress = address;
        console.log("check" ,address);
        let orderObj = {
          userId: ObjectId(user._id),
          products: productsDetails.products,
          deliveryDetails: fetchedAddress,
          paymentMethod: orderDetails["payment"],
          totalAmount: total,
          paymentStatus: status,
          couponDiscount: coupon.discount,
        };
  
        console.log("order object ", orderObj);
  
        const order = new Order(orderObj);
        order.save(async (err, order) => {
          if (err) {
            console.log(err);
          } 
          let orderId = order._id;
          console.log(orderId);
          resolve(orderId);
        });
      } else {
        reject("addressSelect")
      }
    });
  },

  removeUserCart: async (user) => {
    return new Promise(async (resolve, reject) => {
      await cart
        .deleteOne({ userId: user._id }, function (error, success) {
          if (error) {
            console.log(error);
          } else {
            console.log(success);
          }
        })
        .clone();
      resolve();
    });
  },

  removeFailedOrders: (user) => {
    return new Promise(async (resolve, reject) => {
      await order.deleteMany({_id: user._id, paymentStatus: "pending"}).then((result) => {
        console.log(result);
        resolve(result)
      })
    })
  },

  getUserOrders: (user) => {
    return new Promise(async (resolve, reject) => {
      let orders = await order.find({ userId: user._id });
      console.log(orders);
      resolve(orders);
    });
  },

  getProductsByOrders: (orderId) => {
    return new Promise(async (resolve, reject) => {
      let orderedProducts = await order.aggregate([
        {
          $match: { _id: ObjectId(orderId) },
        },
        {
          $project: {
            _id: 1,
            products: 1,
            date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          },
        },
        {
          $unwind: "$products",
        },
        {
          $lookup: {
            from: "products",
            localField: "products.item",
            foreignField: "_id",
            as: "productDetails",
          },
        },
      ]);
      console.log("query", orderedProducts);
      resolve(orderedProducts);
    });
  },

  orderProductStatus: (orderId, productId, status) => {
    console.log(orderId, productId, status);
    return new Promise(async (resolve, reject) => {  
      if (status == "Refund Approved") {
        let orderDetails = await Order.aggregate([
          { $match: { _id: ObjectId(orderId) } },
          { $unwind: "$products" },
          { $match: { "products.item": ObjectId(productId) } },
          {
            $project: {
              _id: 0,
              userId: 1,
              products: 1,
              totalAmount: 1,
              couponDiscount: 1,
            },
          },
        ]);
        let productDetails = orderDetails[0].products;
        let discount = orderDetails[0].couponDiscount;
        let quantity = productDetails.quantity;
        let refundAmount = typeof discount == "number"  ?  ((productDetails.price * discount) / 100)*quantity : productDetails.price*quantity;
          await wallet
            .updateOne(
              { user: orderDetails[0].userId },
              { $inc: { balance: Math.round(refundAmount) } }
            )
            .then(async (result) => {
              console.log(result);
              let statusUpdate = await order.updateOne(
                { _id: orderId, "products.item": productId },
                { $set: { "products.$.status": status } }
              );
              console.log(statusUpdate);
              resolve(status);
            });

      } else if (status == "Order Cancelled") {
        let orderDetails = await Order.aggregate([
          { $match: { _id: ObjectId(orderId) } },
          { $unwind: "$products" },
          { $match: { "products.item": ObjectId(productId) } },
          {
            $project: {
              _id: 0,
              userId: 1,
              products: 1,
              totalAmount: 1,
              paymentMethod: 1,
              paymentStatus: 1,
              couponDiscount: 1,
            },
          },
        ]);
        console.log(orderDetails);
        if (orderDetails[0].paymentMethod == "COD") {
          let result = await order.updateOne(
            { _id: orderId, "products.item": productId },
            { $set: { "products.$.status": status } }
          );
          console.log(result);
          resolve(status);
        } else {
          let productDetails = orderDetails[0].products;
          let discount = orderDetails[0].couponDiscount;
          let quantity = productDetails.quantity;
          let refundAmount = typeof discount == "number"  ?  ((productDetails.price * discount) / 100)*quantity : productDetails.price*quantity;
          await wallet
            .updateOne(
              { user: orderDetails[0].userId },
              { $inc: { balance: Math.round(refundAmount) },
                $push: {
                  history: {
                    type: "Order Refund",
                    amount: refundAmount,
                  }, 
                }
              })
            .then(async (result) => {
              console.log(result);
              let statusUpdate = await order.updateOne(
                { _id: orderId, "products.item": productId },
                { $set: { "products.$.status": status } }
              );
              console.log(statusUpdate);
              resolve(status);
            });
        }
      } else {
        let result = await order.updateOne(
          { _id: orderId, "products.item": productId },
          { $set: { "products.$.status": status } }
        );
        console.log(result);
        resolve(status);
      }
    });
  },
};
