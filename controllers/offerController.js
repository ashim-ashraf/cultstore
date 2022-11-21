const { getAllCoupons, getAllBanner } = require("../helpers/offer-helpers");
const banner = require("../models/banner");
const Coupon = require("../models/coupon");

module.exports = {
    couponDashboard: async (req,res) => {
        await getAllCoupons().then((coupons) => {
          console.log(coupons);
         res.render("admin/couponManagement",{coupons})
        })
     },

  addCouponPage: (req, res) => {
    res.render("admin/addCoupon");
  },

  createCoupon: (req, res) => {
    const couponData = new Coupon(req.body);
    couponData.save((err, data) => {
      if (err) {
        return res.status(400).json({
          error: errorHandler(err),
        });
      }
      res.redirect("/admin/couponManagement");
    });
  },

  
  deleteCoupon: async (req, res) => {
    let couponData = req.params.couponId;
    await Coupon.deleteOne({ _id: couponData });
    res.redirect("/admin/couponManagement");
  },

  displayAddProductForm: (req,res) => {
    let product = req.product;
    res.render("admin/addProductOffer", {product})
   },

  bannerDashboard: async(re,res) => {
    await getAllBanner().then((banner) => {
      res.render("admin/bannerManagement",{banner})
     })
  },

  displayAddBannerForm: (req,res) => {
    res.render("admin/addBanner")
  },

  addBannerData: async (req,res) => {
    console.log("aaa");
    let imageName = req.files.map(fileName);
    function fileName(files) {
      return files.filename;
    }
    let bannerDetails = req.body;
    bannerDetails.ImageFileName = imageName;
    let bannerData = new banner(req.body);
    bannerData.save((err, result) => {
      if (err) {
        return res.status(400).json({
          err: errorHandler(err),
        });
      }
      res.redirect("/admin/bannerManagement");
    });
  },

  deleteBanner: async (req, res) => {
    let bannerId = req.params.bannerId;
    await banner.deleteOne({ _id: bannerId });
    res.redirect("/admin/bannerManagement");
  },
};
