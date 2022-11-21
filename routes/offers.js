const express = require("express");
const { addCouponPage, createCoupon, deleteCoupon, displayAddBannerForm, addBannerData, deleteBanner } = require("../controllers/offerController");
const { multipleUpload } = require("../controllers/upload");
const router = express.Router();

router.get("/addCoupon", addCouponPage )

router.post("/create", createCoupon);

router.get("/deleteCoupon/:couponId", deleteCoupon);

router.get("/addBanner", displayAddBannerForm )

router.post("/addBanner", multipleUpload, addBannerData)

router.get("/deleteBanner/:bannerId", deleteBanner);

module.exports = router;