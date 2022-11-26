const adminHelpers = require("../helpers/admin-helpers");
const User = require("../models/user");
const mongoose = require("mongoose");
const { getAllOrders, getOrdersByDate, getOrdersByMonth, getOrdersByYear, getSalesByYear, getAllSales, getPaymentData, getYearlyGraphData } = require("../helpers/admin-helpers");
const { getProductsByOrders } = require("../helpers/product-helpers");
const data = process.env.ADMIN_USERNAME;
const password = process.env.ADMIN_PASSWORD;

module.exports = {
  
  admindashboard: (req, res, next) => {
    // req.session.adminloggedIn = true;
    if (req.session.adminloggedIn) {
      res.render("admin/index");
    } else {
      res.render("admin/admin-login", { loginErr: req.session.adminLoginErr });
      req.session.adminLoginErr = false;
    }
  },

  adminLogin: (req, res) => {
    if (req.body.userName == data && req.body.password == password) {
      req.session.admin = req.body;
      req.session.adminloggedIn = true;
      console.log(req.session.admin);
      res.redirect("/admin");
    } else {
      console.log("erroe part else");
      req.session.adminLoginErr = "Invalid Username or Password";
      res.redirect("/admin");
    }
  },

  adminLogout: (req, res) => {
    req.session.adminloggedIn = false;
    console.log("session destroyed");
    res.redirect("/admin");
  },

  userDashboard: (req, res) => {
    adminHelpers.getAllUsers(req.body).then((users) => {
      res.render("admin/userManagement", { users });
    });
  },

  userBlock: async (req, res) => {
    let user = req.profile;
    console.log(user._id);
    if (user.status) {
      await User.updateOne({ _id: user._id }, { $set: { status: false } });
      res.redirect("/admin/userManagement");
    } else {
      await User.updateOne({ _id: user._id }, { $set: { status: true } });
      res.redirect("/admin/userManagement");
    }
  },

  orderDashboard : async (req,res) => {
    await getAllOrders().then((orders) => {
      res.render("admin/orderManagement", {orders})
    })
  },


  productsByOrderId : async (req, res) => {
    await getProductsByOrders(req.query.Id).then((products) => {
      console.log(products);
      res.render("admin/orderDetails",{products})
    })
  },

  paymentMethodStatistics : async (req,res) => {
    
     await getPaymentData().then((data) => {
      
      
      let name = data.map(function filename(file) {
        return file._id;
      });
      let value = data.map(function filename(file) {
        return file.total;
      });
      console.log(name,value);
      res.json({name, value})
     })
  },

  salesByYearSatistics :  async (req,res) => {
    
     await getYearlyGraphData(req.body).then((year) => {
     let graphData = Array(12).fill(0);
     for(let date of year){
      graphData[date._id - 1] = date.total
     }
      res.json({graphData})
     })
  },

  getAllSalesReport : async (req,res,next) => {
    await getAllSales().then((report) => {
      res.render("admin/salesreport", {report})
    })
    },

  reportByDate : async (req,res) => {
    await getOrdersByDate(req.query.fromDate, req.query.toDate).then((dailyReport) => {
      res.render("admin/salesreport", {dailyReport})
    })
    },
  
  reportByMonth : async (req,res) => {
    await getOrdersByMonth(req.query.month).then((monthlyReport) => {
      res.render("admin/salesreport", {monthlyReport})
    })
    },

  reportByYear : async (req,res) => {
    await getOrdersByYear(req.query.year).then((yearlyReport) => {
      res.render("admin/salesreport", {yearlyReport})
    })
    },

  getPieChartData : async (req,res,next) => {
    await getSalesByYear(2022).then((report) => {
      next();
    })
    },

  


};
