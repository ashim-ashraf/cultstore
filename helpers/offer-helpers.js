const { reject } = require("lodash");
const banner = require("../models/banner");
const coupon = require("../models/coupon");

module.exports = {
  getAllCoupons: () => {
    return new Promise(async (resolve, reject) => {
      let couponDetails = await coupon.find(
        // {}
        // ,
        // {
        //   _id: 1,
        //   name: 1,
        //   discount: 1,
        //   minPurchase: 1,
        //   priceCap: 1,
        //   expiryDate: { $dateToString: { format: "%d-%m-%Y", date: "$expiry" } },
        // }
      );
      resolve(couponDetails);
    });
  },

  getAllBanner: () => {
    return new Promise(async (resolve, reject) => {
      let bannerDetails = await banner.find();
      resolve(bannerDetails);
    });
  },
};
