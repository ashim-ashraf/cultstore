var db = require("../config/connection");
var collection = require("../config/collections");
const { ObjectId } = require("mongodb");
const user = require("../models/user");
const order = require("../models/order");
const category = require("../models/category");

module.exports = {
  getAllUsers: () => {
    return new Promise(async (resolve, reject) => {
      let users = await user.find();
      console.log(users);
      resolve(users);
    });
  },

  addUser: (userData) => {
    return new Promise(async (resolve, reject) => {
      userData.password = await bcrypt.hash(userData.password, 10);
      db.get()
        .collection(collection.USER_COLLECTION)
        .insertOne(userData)
        .then((data) => {
          resolve("Password Insert");
        });
    });
  },

  deleteUser: (userId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.USER_COLLECTION)
        .deleteOne({ _id: ObjectId(userId) })
        .then((response) => {
          resolve(response);
        });
    });
  },

  getUserDetails: (userId) => {
    return new Promise((resolve, reject) => {
      user.findOne({ _id: ObjectId(userId) }).then((user) => {
        resolve(user);
      });
    });
  },

  getAllOrders: () => {
    return new Promise(async (resolve, reject) => {
      let orders = await order.aggregate([
        {
          $project: {
            _id: 1,
            userId: 1,
            products: 1,
            deliveryDetails: 1,
            paymentMethod: 1,
            paymentStatus: 1,
            totalAmount: 1,
            date: { $dateToString: { format: "%d-%m-%Y", date: "$date" } },
          },
        },
      ]);
      console.log(orders);
      resolve(orders);
    });
  },

  getAllSales: () => {
    return new Promise(async (resolve, reject) => {
      let orders = await order.aggregate([
        {
          $project: {
            _id: 1,
            userId: 1,
            paymentMethod: 1,
            deliveryDetails: 1,
            totalAmount: 1,
            date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          },
        },
      ]);
      console.log("allsales", orders);
      resolve(orders);
    });
  },

  getPaymentData: () => {
    return new Promise(async (resolve, reject) => {
      let data = await order.aggregate([
        { $group: { _id: "$paymentMethod", total: { $count: {} } } },
      ]);
      resolve(data);
    });
  },

  getYearlyGraphData: (dateData) => {
    return new Promise(async (resolve, reject) => {
      console.log(dateData);
      let data = await order.aggregate([
        {
          $project: {
            _id: 0,
            date: { $dateToString: { format: "%Y", date: "$date" } },
            month: { $dateToString: { format: "%m", date: "$date" } },
          },
        },
        {
          $match: { date: dateData.year },
        },
        {
          $group: { _id: "$month", total: { $count: {} } },
        },      ]);
      console.log("aaaa", data);
      resolve(data);
    });
  },

  //todo
  // linechart : async (req, res) => {
  //   const years = await MongoOrder.aggregate([
  //     { $match: { $and: [{ CancelOrder: 0 }, { DeliveryStatus: "delivered" }] } },
  //     { $project: { year: { $year: "$realDate" }, TotalAmount: 1 } },
  //     { $group: { _id: "$year", sum: { $sum: "$TotalAmount" } } },
  //     { $sort: { _id: 1 } },
  //   ]);

  //   let y = 0,
  //     count = 0,
  //     yearcount = [],
  //     revenue = [];

  //   for (i = years[0]._id; i <= years[years.length - 1]._id; i++) {
  //     if (i == years[y]._id) {
  //       yearcount[count] = i;
  //       revenue[count] = years[y].sum;
  //       count++;
  //       y++;
  //     } else {
  //       yearcount[count] = i;
  //       revenue[count] = 0;
  //       count++;
  //     }
  //   }

  //   res.json({
  //     years: yearcount,

  //     revenue: revenue,
  //   });
  // },
  //todo

  getOrdersByDate: (fromDate,toDate) => {
    console.log(fromDate,toDate);
    return new Promise(async (resolve, reject) => {
      let orders = await order.aggregate([
        {
          $project: {
            _id: 0,
            // userId: 1,
            products:1,
            paymentMethod: 1,
            paymentStatus:1,
            // deliveryDetails: 1,
            // totalAmount: 1,
            date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          },
        },
        {
          $match: { date: { $gte: fromDate, $lte: toDate } , paymentStatus: "success"},
        },
        {
          $unwind:"$products"
        },
        {
          $group:{_id: "$products.item", quantity: {$sum: "$products.quantity"} }
        },
        {
          $lookup:{
            from: "products",
            localField: "_id",
            foreignField: "_id",
            as: "productDetails"
          }
        },{
          $project: {
            quantity:1,
            product: { $arrayElemAt : ["$productDetails",0]},
          },      
        },
        {
          $addFields:{
            total : {$multiply: ["$quantity","$product.price"]}
          }   
        }
      ]);
      console.log(orders);
      resolve(orders);
    });
  },

  getOrdersByMonth: (dateData) => {
    console.log(dateData);
    return new Promise(async (resolve, reject) => {
      let orders = await order.aggregate([
        {
          $project: {
            _id: 0,
            products:1,
            paymentMethod: 1,
            paymentStatus:1,
            totalAmount: 1,
            date: { $dateToString: { format: "%d-%m-%Y", date: "$date" } },
            month: { $dateToString: { format: "%Y-%m", date: "$date" } }
          },
        },
        {
          $match: { month: dateData , paymentStatus: "success"},
        },
        {
          $unwind:"$products"
        },
        {
          $group:{_id:"$date" , quantity: {$sum: "$products.quantity"},total: {$sum: "$totalAmount"} }
        },
      ]);
      console.log(orders);
      resolve(orders);
    });
  },

  getOrdersByYear: (dateData) => {
    console.log(dateData);
    return new Promise(async (resolve, reject) => {
      let orders = await order.aggregate([
        {
          $project: {
            _id: 0,
            paymentStatus:1,
            paymentMethod: 1,
            products:1,
            totalAmount: 1,
            year: { $dateToString: { format: "%Y", date: "$date" } },
            month: { $dateToString: { format: "%Y-%m", date: "$date" } },
          },
        },
        {
          $match: { year: dateData , paymentStatus: "success"},
        },
        {
          $unwind:"$products"
        },
        {
          $group:{_id:"$month" , quantity: {$sum: "$products.quantity"},total: {$sum: "$totalAmount"} }
        },
      ]);
      console.log(orders);
      resolve(orders);
    });
  },

  getSalesByYear: (dateData) => {
    console.log(dateData);
    return new Promise(async (resolve, reject) => {
      let orders = await order.aggregate([
        {
          $project: {
            _id: 1,
            userId: 1,
            paymentMethod: 1,
            deliveryDetails: 1,
            totalAmount: 1,
            date: { $dateToString: { format: "%Y", date: "$date" } },
          },
        },
        // {
        //   $match: { date: dateData },
        // },
        // {
        //   $group : {
        //     _id: "$date",
        //     count:{$sum:1},
        //     total:{$sum:'$totalAmount'}
        //   }
        // }
      ]);
      console.log(orders);
      resolve(orders);
    });
  },

  getAllCategory: () => {
    return new Promise(async (resolve, reject) => {
      let categoryDetails = await category.find();
      resolve(categoryDetails);
    });
  },
};
