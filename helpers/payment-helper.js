const { reject } = require("lodash");
const ObjectId = require("mongoose/lib/schema/objectid");
const Razorpay = require("razorpay");
const order = require("../models/order");
const paypal = require("paypal-rest-sdk");
const wallet = require("../models/wallet");
const { response } = require("../app");

var instance = new Razorpay({
  key_id: process.env.key_id,
  key_secret: process.env.key_secret,
});

paypal.configure({
  mode: "sandbox", //sandbox or live
  client_id: process.env.client_id,
  client_secret: process.env.client_secret,
});

module.exports = {
  //razor pay order generation , has the orderID
  generateRazorpay: (orderId, total) => {
    return new Promise((resolve, reject) => {
      var options = {
        amount: total * 100, // amount in the smallest currency unit
        currency: "INR",
        receipt: "" + orderId,
      };
      instance.orders.create(options, function (err, order) {
        if (err) {
          console.log(err);
        } else {
          console.log("new order : ", order);
          resolve(order);
        }
      });
    });
  },

  //verification after Razorpay paymentgateway
  verifyPayment: (details) => {
    console.log("verify payment route called");
    return new Promise((resolve, reject) => {
      const crypto = require("crypto");
      let hmac = crypto.createHmac("sha256", process.env.key_secret);

      hmac.update(
        details["payment[razorpay_order_id]"] +
          "|" +
          details["payment[razorpay_payment_id]"]
      );
      hmac = hmac.digest("hex");
      if (hmac == details["payment[razorpay_signature]"]) {r,
        console.log(" resolved");
        resolve();
      } else {
        console.log("rejected");
        reject();
      }
    });
  },

  //payment status updation
  changePaymentStatus: (orderId) => {
    console.log("change payment status route called", orderId);
    return new Promise(async (resolve, reject) => {
      await order
        .updateOne({ _id: orderId }, { $set: { paymentStatus: "success" } })
        .then((result) => {
          console.log(result);
          resolve();
        });
    });
  },

  //paypal
  generatePaypal: (totalUsd, cartItems) => {
    console.log(cartItems);
    console.log(totalUsd);
    return new Promise(async (resolve, reject) => {
      const create_payment_json = {
        intent: "sale",
        payer: {
          payment_method: "paypal",
        },
        redirect_urls: {
          return_url: "http://localhost:8000/orderSuccess-paypal",
          cancel_url: "http://localhost:8000/orderFailed",
        },
        transactions: [
          {
            item_list: {
              items: [
                {
                  name: "Redhock Bar Soap",
                  sku: "001",
                  price: totalUsd,
                  currency: "USD",
                  quantity: 1,
                },
              ],
            },
            amount: {
              currency: "USD",
              total: totalUsd,
            },
            description: "Washing Bar soap",
          },
        ],
      };

      paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
          console.log(error, " // Refer to generate paypal function ");
          throw error;
        } else {
          resolve(payment);
        }
      });
    });
  },

  payFromWallet: (user, totalAmount) => {
    return new Promise(async (resolve, reject) => {
      let userWallet = await wallet.find({ user: user._id });
      console.log("userWallet", userWallet);
      if (userWallet[0].balance >= totalAmount ) {
        console.log("if"); 
        await wallet
          .updateOne(
            { user: user._id },
            { $inc: { balance: Math.round(-totalAmount) } }
          )
          .then((result) => {
            console.log(result);
            resolve();
        });
       
      } else {
        console.log("else"); 
        reject("Insufficient Balance In Wallet");
      }
    });
  },
};
