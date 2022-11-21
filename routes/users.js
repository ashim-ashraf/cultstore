const express = require("express");
const {
  productDetailPage,
  homePage,
  verifyOtp,
  otpEntryForm,
  requestOtp,
  otpLogin,
  userLoginSubmit,
  userLogin,
  userSignUpSubmit,
  userSignUp,
  verifyLogin,
  displayCart,
  cartEntry,
  productQuantity,
  deleteCartProduct,
  userOrders,
  addressPage,
  placeUserOrder,
  addDeliveryAddress,
  userProfile,
  paymentVerification,
  orderSuccess,
  productsByOrder,
  changeProductStatus,
  userCoupon,
  displayWishlist,
  addItemToWishlist,
  deleteWishlistProduct,
  paypalSuccess,
  orderFailed,
  logout,
} = require("../controllers/userController");
const router = express.Router();
const { userSignupValidator } = require("../validator/customValidation");
const { productById } = require("../controllers/productController");
const order = require("../models/order");

// signUp process
router.get("/signUp", userSignUp);

router.post("/signUp", userSignupValidator, userSignUpSubmit);

/* login process */
router.get("/login", userLogin);

router.post("/login", userLoginSubmit);

// otp login process
router.get("/otpLogin", otpLogin);

router.post("/phoneNumberSubmit", requestOtp);

router.get("/codeEntryForm", otpEntryForm);

router.post("/otpSubmit", verifyOtp);

//rendering homepage
router.get("/homePage", homePage);

//rendering product details page
router.get("/productDetailPage", productDetailPage);

/*Wishlist*/
router.post("/addToWishlist", verifyLogin, addItemToWishlist);

router.get("/displayWishlist", verifyLogin, displayWishlist);

router.post("/removeProductFromWishlist", deleteWishlistProduct);

/*Rendering the cart */
router.post("/addToCart", verifyLogin, cartEntry);

router.get("/displayCart", verifyLogin, displayCart);

router.post("/applyCoupon", userCoupon);

router.post("/changeCartProductQuantity", productQuantity);

router.post("/deletCartProduct", deleteCartProduct);

router.get("/checkout", verifyLogin, addressPage);

router.post("/addAddress", addDeliveryAddress);

router.post("/proceedToPayment", verifyLogin, placeUserOrder);

router.post("/verifyPayment", paymentVerification);

router.get("/orderSuccess-paypal", paypalSuccess);

router.get("/orderSuccess", orderSuccess);

router.get("/orderFailed", orderFailed);

router.get("/orders", verifyLogin, paginatedResults(order), userOrders);

function paginatedResults(model) {
  return async (req, res, next) => {
    let user = req.session.user;
    const page = parseInt(req.query.page);
    const limit = 5;

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const results = {};

    if (endIndex < (await model.countDocuments().exec())) {
      results.next = {
        page: page + 1,
        limit: limit,
      };
    }

    if (startIndex > 0) {
      results.previous = {
        page: page - 1,
        limit: limit,
      };
    }
    try {
      results.results = await model
        .find({ userId: user._id })
        .limit(limit)
        .skip(startIndex)
        .exec();

      results.count = await model
      .find({ userId: user._id })
      .count();
      
      results.totalPages = Math.ceil(results.count / limit); 
      results.pageNos = [] ;
      if (results.count < 1){
        results.pageNos= [{page:1 , currentPage: true}]
      }  else {
        for (i = 1; i <= results.totalPages; i++) {
          if (page == i) {
            results.pageNos.push({
              page: i,
              currentPage: true,
            });
          } else {
            results.pageNos.push({
              page: i,
              currentPage: false,
            });
          }
        }
      }

      res.paginatedResults = results;
      console.log(results);
      next();
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  };
}

router.get("/getProductsByOrderId", verifyLogin, productsByOrder);

//changing ordered product status , function called from order details page through ajax
router.post("/changeOrderProductStatus", changeProductStatus);

router.param("productId", productById);

router.get("/profile", userProfile);

//user logout button
router.get("/logout", logout );

module.exports = router;
