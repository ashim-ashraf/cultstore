const User = require("../models/user");
const { errorHandler } = require("../helpers/dbErrorHandlers");
const productHelpers = require("../helpers/product-helpers");
const userHelpers = require("../helpers/user-helpers");
const paypal = require("paypal-rest-sdk");
let referralCodeGenerator = require("referral-code-generator");
const {
  getCartTotal,
  getUserAddress,
  placeOrder,
  getCartItemsList,
  getUserOrders,
  addAddress,
  getProductsByOrders,
  orderProductStatus,
  removeUserCart,
  walletByUser,
  getCartItems,
  applyCoupon,
  userCoupenReg,
  addToCart,
  getProduct,
  addToWishlist,
  getWishlistItems,
  removeFailedOrders,
  productStatus,
  removeCartProduct,
  changeProductQuantity,
  productInCartStatus,
  productInWishlistStatus,
} = require("../helpers/product-helpers");
const {
  generateRazorpay,
  generatePaypal,
  verifyPayment,
  changePaymentStatus,
  payFromWallet,
} = require("../helpers/payment-helper");
const wallet = require("../models/wallet");
const { Number } = require("mongoose/lib/schema/index");
const coupon = require("../models/coupon");
const { getAllBanner } = require("../helpers/offer-helpers");
const {
  removeWishlistProduct,
} = require("../helpers/user-helpers");
const { getAllCategory } = require("../helpers/admin-helpers");
const { response } = require("../app");
const SERVICEID = process.env.SERVICEID;
const ACCOUNT_SID = process.env.ACCOUNT_SID;
const AUTH_TOKEN = process.env.AUTH_TOKEN;
const client = require("twilio")(ACCOUNT_SID, AUTH_TOKEN);
let phoneNumber = Number;

module.exports = {
  //middleware to verify session and user logged in status
  verifyLogin: (req, res, next) => {
    if (req.session.userloggedIn) {
      next();
    } else {
      console.log("no user");
      res.redirect("/login");
    }
  },

  //login page rendered initially
  userLogin: (req, res) => {
    if (req.session.userloggedIn) {
      let user = req.session.user;
      console.log("test");
      res.redirect("/");
    } else {
      console.log("login page called");
      let error = req.query.valid;
      res.render("users/login", { error });
      req.session.userLoginErr = false;
    }
  },

  urlRedirect :  (req, res, next) => {
    req.session.returnToUrl = req.originalUrl
    if (req.session.user) {
      next();
    } else {
      res.redirect("/login");
    }
  },

  //login form data submition
  userLoginSubmit: (req, res, next) => {
    const { email, password } = req.body;
    User.findOne({ email }, (err, user) => {
      if (err || !user) {
        const firstError = encodeURIComponent("Invalid User");
        return res.redirect("/login?valid=" + firstError);
      } else if (user.status == false) {
        const firstError = encodeURIComponent("User Blocked!");
        return res.redirect("/login?valid=" + firstError);
      } else if (!user.authenticate(password)) {
        const firstError = encodeURIComponent("Invalid User Credentials");
        return res.redirect("/login?valid=" + firstError);
      }
      req.session.userloggedIn = true;
      console.log(req.session);
      req.session.user = user;
      const redirect= req.session.returnToUrl || '/'
      req.session.returnToUrl = null;
      res.redirect(redirect)
    });
  },

  //user sign up form loaded
  userSignUp: (req, res) => {
    if (req.session.userloggedIn) {
      const user = req.session.user;
      res.redirect("/");
    } else {
      let error = req.query.valid;
      console.log(error);
      res.render("users/signUp", { error });
    }
  },

  //user signup form data submission
  userSignUpSubmit: async (req, res) => {
    // assigning a refferal code to the new user
    req.body.code = referralCodeGenerator.alpha("uppercase", 6);
    if (req.body.referralCode) {
      //finding the existing user who has matching referal code entered by new user 
      let ref = await User.findOne({ code: req.body.referralCode });  
      if (ref) {
        //creating new user in the db
        const user = new User(req.body);
        user.save(async (err, user) => {
          if (err) {
            return res.status(400).json({
              err: errorHandler(err),
            });
          } else {
            //assigning the new user data by fetching it back from the db to a variable
            let userDetails = await User.findOne({ email: req.body.email });
            console.log(user);
            console.log("first log", userDetails);
            await walletByUser(userDetails._id, userDetails.email).then(
              async (response) => {
                if (req.body.referralCode) {
                  console.log("log called", req.body.referralCode);
                  await User.findOne({ code: req.body.referralCode }).then(
                    async (referredUser) => {
                      if (referredUser) {
                        let historyObj = {
                          type: "Referal Bonus",
                          amount: 1000,
                        };
                        console.log("refffff", referredUser);
                        console.log(referredUser._id);
                        await wallet.updateOne(
                          { user: referredUser._id },
                          { 
                            $inc: { balance: 500 },
                            $push: {
                              history: {
                                type: "Referal Bonus",
                                amount: 1000
                              },
                            },
                          }
                        );
                        await wallet.updateOne(
                          { email: req.body.email },
                          {
                            $inc: { balance: 500 },
                            $push: {
                              history: {
                                type: "Referal Bonus",
                                amount: 500
                              },
                            },
                          }
                        );
                        console.log("last", response);
                        res.redirect("/login");
                      } else {
                        res.redirect("/login");
                      }
                    }
                  );
                }
              }
            );
          }
          user.hashed_password = undefined;
        });
      } else {
        res.redirect("/signUp");
      }
    } else {
      const user = new User(req.body);
      user.save(async (err, user) => {
        if (err) {
          return res.status(400).json({
            err: errorHandler(err),
          });
        } else {
          let userDetails = await User.findOne({ email: req.body.email });
          await walletByUser(userDetails._id, userDetails.email);
          res.redirect("/login");
        }
      });
    }
  },

  //rendering homepage initially , all products are ftched and loaded using get all products function
  homePage: async (req, res) => {
    productHelpers.getAllProducts(req.body).then(async (products) => {
      let user = req.session.user;
      let banner = await getAllBanner();
      let category = await getAllCategory();
      console.log(category);
      res.render("users/index", { user, products, banner, category });
    });
  },

  displayShop: async (req, res) => {
    productHelpers.getAllProducts(req.body).then(async (products) => {
      let user = req.session.user;
      let banner = await getAllBanner();
      let category = await getAllCategory();
      res.render("users/shop", { user, products, banner, category });
    });
  },

  //product detail page , three images are loaded with image zoom
  productDetailPage: async (req, res) => {
    await getProduct(req.query.product).then( async (productDetails) => {
      let user = req.session.user;
      let cartExist = false;
      let wishlistExist =false;
      if(req.session.userloggedIn){
        console.log("user found ");
        let cartStatus = await productInCartStatus(req.query.product, user._id)
        let wishlistStatus = await productInWishlistStatus(req.query.product, user._id)
        cartExist = cartStatus;
        wishlistExist = wishlistStatus;
      }
      res.render("users/productDetailPage", { productDetails, user, cartExist , wishlistExist });
    });
  },

  //route called when add to cart clicked in product detail page
  cartEntry: async (req, res) => {
    if (req.session.userloggedIn) {
      let productId = req.body.productId;
      let price = req.body.price;
      await addToCart(req.session.user._id, productId, price).then((status) => {
        console.log("entered loop");
        res.json(true);
      });
    } else {
      res.json(false);
    }
  },

  addItemToWishlist: async (req, res) => {
    console.log(req.body);
    if(req.session.userloggedIn){
      let productId = req.body.productId;
      await addToWishlist(req.session.user._id, productId).then((status) => {
      res.json(true);
      });
    } else{
      res.json(false);
    }
  },

  //wishlist
  displayWishlist: async (req, res) => {
    await getWishlistItems(req.session.user).then(async (wishlistItems) => {
      console.log(wishlistItems);
      let user = req.session.user;
      res.render("users/wishlist", { user, wishlistItems });
    });
  },

  //cart rendered with products added or already existing products in cart
  displayCart: async (req, res) => {
    req.session.discountedPrice = null;
    req.session.coupon = null;
    await getCartItems(req.session.user).then(async (cartProducts) => {
      console.log(cartProducts);
      let user = req.session.user;
      if (cartProducts.length > 0) {
        let totalAmount = await getCartTotal(req.session.user);
        res.render("users/shoppingCart", { user, cartProducts, totalAmount });
      } else {
        res.render("users/shoppingCart", { user });
      }
    });
  },

  //route to change product quantity, changeProductQuantity function called
  productQuantity: (req, res, next) => {
    changeProductQuantity(req.body).then(async (response) => {
      if (response.removeProduct != true) {
        response.totalAmount = await productHelpers.getCartTotal(
          req.session.user
        );
      }
      res.json(response);
    }).catch((result) => {
      console.log(result);
      res.json(result);
    });
  },

  deleteCartProduct: async (req, res) => {
    await removeCartProduct(req.body).then((response) => {
      console.log(response);
      res.json(response);
    });
  },

  deleteWishlistProduct: async (req, res) => {
    let productId = req.body.productId;
    let user = req.session.user;
    await removeWishlistProduct(productId,user).then((response) => {
      console.log(response);
      res.json(response);
    });
  },

  userCoupon: async (req, res) => {
    let user = req.session.user;
    let code = req.body.couponCode;
    let cartItems = await getCartItems(req.session.user);
    let total = await getCartTotal(req.session.user);
    let couponDetails = await coupon.findOne({ name: code });
    if (couponDetails) {
      req.session.coupon = couponDetails;
    }
    console.log(code);
    await applyCoupon(user, code, cartItems, total)
      .then((result) => {
        if (typeof result == "number") {
          req.session.discountedPrice = result;
        }
        res.json(result);
      })
      .catch((err) => {
        res.json(err);
      });
  },

  //address page rendered on a get request
  addressPage: async (req, res) => {
    let total = 0;
    if (req.session.discountedPrice) {
      total = req.session.discountedPrice;
    } else {
      total = await getCartTotal(req.session.user);
    }
    console.log(total);
    if (total == undefined) {
      res.redirect("/");
    } else {
      let address = await getUserAddress(req.session.user);
      let user = req.session.user;
      let walletDetails = await wallet.findOne({ user: user._id });
      let walletError = req.session.walletError;
      res.render("users/address", {
        total,
        user,
        address,
        walletDetails,
        walletError,
      });
      req.session.walletError = null;
    }
  },

  addDeliveryAddress: async (req, res) => {
    await addAddress(req.body).then((response) => {
      res.json(response);
    });
  },

  userOrders: async (req, res) => {
    let orders = res.paginatedResults.results;
    let pageNos = res.paginatedResults.pageNos;
    let previous = res.paginatedResults.previous;
    let next = res.paginatedResults.next;
    let user = req.session.user;
    console.log(orders);
    res.render("users/orders", { user, orders, pageNos, previous, next });
  },

  productsByOrder: async (req, res) => {
    await getProductsByOrders(req.query.Id).then((products) => {
      console.log(products);
      let user = req.session.user;
      res.render("users/orderDetails", { products , user });
    });
  },

  changeProductStatus: async (req, res) => {
    await orderProductStatus(
      req.body.orderId,
      req.body.productId,
      req.body.status
    ).then((response) => {
      console.log("check", response);
      res.json({ status: response });
    });
  },

  placeUserOrder: async (req, res) => {
    console.log("payment form data", req.body);
    let user = req.session.user;
    let cartProducts = await getCartItemsList(user._id);
    let totalAmount = await getCartTotal(req.session.user);
    let coupon = "Nil";
    if (req.session.coupon) {
      coupon = req.session.coupon;
    }
    if (req.session.discountedPrice) {
      totalAmount = req.session.discountedPrice;
    }
    console.log("first");
    await placeOrder(req.body, user, cartProducts, totalAmount, coupon).then(
      (orderId) => {
        console.log("second", req.body);
        console.log(req.body["payment"]);
        if (req.body["payment"] === "COD") {
          res.json({ codSuccess: true });
        } else if (req.body["payment"] === "Razorpay") {
          generateRazorpay(orderId, totalAmount).then((response) => {
            response.Razorpay = true;
            res.json(response);
          });
        } else if (req.body["payment"] === "Paypal") {
          let totalUsd = parseInt(totalAmount * 0.012);
          req.session.paypalAmt = totalUsd ;
          req.session.paypalOderId = orderId;
          generatePaypal(totalUsd, cartProducts).then((response) => {
            console.log("paypal test");
            response.Paypal = true;
            res.json(response);
          });
        } else if (req.body["payment"] === "Wallet") {
          payFromWallet(user, totalAmount)
            .then(async (response) => {
              await changePaymentStatus(orderId).then((response) => {
                res.json({ walletSuccess: true });
              });
            })
            .catch((status) => {
              console.log("catch worked");
              req.session.walletError = status;
              res.json({ walletBalanceError: true });
            });
        }
      }
    ).catch((status) => {
      console.log("catch called due to address error");
      if(status === "paymentSelect"){
        res.json({ payButtonError: true })
      } else if (status === "addressSelect") {
        res.json({ addressError: true })
      }
    });
  },

  paymentVerification: (req, res) => {
    console.log(req.body);
    verifyPayment(req.body)
      .then(() => {
        changePaymentStatus(req.body["order[receipt]"]).then(() => {
          res.json({ status: true });
        });
      })
      .catch((err) => {
        res.json({ status: false });
      });
  },

  paypalSuccess: (req, res) => {
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;
    console.log(req.session.paypalAmt);

    const execute_payment_json = {
      payer_id: payerId,
      transactions: [
        {
          amount: {
            currency: "USD",
            total: req.session.paypalAmt,
          },
        },
      ],
    };

    // Obtains the transaction details from paypal
    paypal.payment.execute(
      paymentId,
      execute_payment_json,
      async function (error, payment) {
        //When error occurs when due to non-existent transaction, throw an error else log the transaction details in the console then send a Success string reposponse to the user.
        if (error) {
          console.log(error.response);
          throw error;
        } else {
          console.log(JSON.stringify(payment));
          await changePaymentStatus(req.session.paypalOderId).then(() => {
            res.redirect("/orderSuccess");
          });
        }
      }
    );
  },

  orderSuccess: async (req, res) => {
    let user = req.session.user;
    let coupon = req.session.coupon;
    console.log(coupon);
    await removeUserCart(user).then(async () => {
      if (req.session.coupon) {
        let result = await userCoupenReg(user, coupon);
        console.log(result);
      }
      req.session.coupon = null;
      req.session.discountedPrice = null;
      // to remove orders with payment status pending
      await removeFailedOrders(user).then((response) => {
        console.log(response);
        res.render("users/orderSuccessfull",{user});
      });
    });
  },

  orderFailed: (req, res) => {
    let user = req.session.user;
    res.render("users/orderFailure",{user});
  },

  logout: (req, res) => {
    req.session.user = null;
    req.session.userloggedIn = null;
    req.session.returnToUrl = null;
    console.log("session destroyed");
    res.redirect("/");
  },

  otpLogin: (req, res) => {
    if (req.session.userloggedIn) {
      res.redirect("/");
    } else {
      let error = req.query.valid;
      console.log(error);
      res.render("users/otpLogin", { error });
    }
  },

  otpEntryForm: (req, res) => {
    if (req.session.userloggedIn) {
      res.redirect("/");
    } else {
      error = req.query.error;
      res.render("users/otpEntryForm", { error });
    }
  },

  requestOtp: (req, res) => {
    phoneNumber = req.body.phone;
    console.log(phoneNumber);
    User.findOne({ phone: phoneNumber }, (err, user) => {
      console.log(user);
      if (user) {
        client.verify.v2
          .services(SERVICEID)
          .verifications.create({ to: "+91" + phoneNumber, channel: "sms" })
          .then((verification) => {
            console.log("11");
            res.redirect("/codeEntryForm");
            
          });
      } else {
        let error = encodeURIComponent(
          "Phone Number not registered, Please Sign Up"
        );
        res.redirect("/otpLogin?valid=" + error);
      }
    });
  },

  verifyOtp: (req, res) => {
    client.verify.v2
      .services(SERVICEID)
      .verificationChecks.create({
        to: "+91" + phoneNumber,
        code: "otp",
        code: req.body.code,
      })
      .then((data) => {
        console.log("then block");
        if (data.status === "approved") {
          User.findOne({ phone: phoneNumber }, (err, user) => {
            console.log("OTP Approved");
            req.session.user = user;
            req.session.userloggedIn = true;
            res.redirect("/");
          });
        } else {
          const firstError = encodeURIComponent("Invalid OTP");
          return res.redirect("/codeEntryForm?error=" + firstError);
        }
      });
  },

  userById: (req, res, next, id) => {
    User.findById(id).exec((err, user) => {
      if (err || !user) {
        return res.status(400).json({
          error: "User not found",
        });
      }
      req.profile = user;
      next();
    });
  },

  userProfile: async (req, res) => {
    let user = req.session.user;
    let walletDetails = await wallet.findOne({ user: user._id });
    console.log(walletDetails);
    res.render("users/profile", { user, walletDetails });
  },

  wishlistCount :  async (req,res) => {
    if(req.session.userloggedIn){
      let userWishlist = await getWishlistItems(req.session.user);
      if(userWishlist){
        let wishlistCount = userWishlist.length;
        res.json(wishlistCount) 
      } else {
        res.json(false);
      }
    } else {
      res.json(false);
    }
  },

  cartCount :  async (req,res) => {
    if(req.session.userloggedIn){
      let userCart = await getCartItems(req.session.user);
      if (userCart){
        let cartCount = userCart.length;
        res.json(cartCount) 
      }else {
        res.json(false);
      }
    } else {
      res.json(false);
    }
  },

}
