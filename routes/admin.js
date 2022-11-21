const express = require("express");
const {
  admindashboard,
  userDashboard,
  adminLogout,
  userBlock,
  adminLogin,
  orderDashboard,
  reportByDate,
  reportByMonth,
  reportByYear,
  getPieChartData,
  getAllSalesReport,
  productsByOrderId,
  paymentMethodStatistics,
  salesByYearSatistics,
} = require("../controllers/adminController");
const { categoryDashboard } = require("../controllers/categoryController");
const { couponDashboard, bannerDashboard } = require("../controllers/offerController");
const { productDashboard } = require("../controllers/productController");
const { userById } = require("../controllers/userController");
const router = express.Router();


router.post("/", adminLogin);

router.get("/adminlogout", adminLogout);

router.get("/", getPieChartData ,  admindashboard);

router.get("/userManagement", userDashboard);

router.get("/productManagement", productDashboard);

router.get("/categoryManagement", categoryDashboard);

router.get("/orderManagement", orderDashboard);

router.get("/couponManagement", couponDashboard);

router.get("/bannerManagement",bannerDashboard)

router.get("/getProductsByOrderId", productsByOrderId )

router.get("/salesReport", getAllSalesReport )

router.get("/salesReportByDate" , reportByDate )

router.get("/salesReportByMonth" , reportByMonth )

router.get("/salesReportByYear" , reportByYear )

router.get("/doughnutChart", paymentMethodStatistics )

router.post("/lineChart",  salesByYearSatistics)

router.param("userId", userById);

router.get("/block-user/:userId", userBlock);

module.exports = router;
