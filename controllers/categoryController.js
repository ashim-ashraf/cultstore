const Category = require("../models/category");
const { errorHandler } = require("../helpers/dbErrorHandlers");
const { getAllCategory } = require("../helpers/admin-helpers");
const product = require("../models/product");

module.exports = {
  createCategory: async (req, res) => {
    let Categoryname = req.body.name;
    await Category.find({
      name: new RegExp("^" + Categoryname + "$", "i"),
    }).then((result) => {
      console.log("hi", result);
      if (result.length != 0) {
        let error = "Already Existing Value";
        res.render("admin/addcategory", { error });
      } else {
        const category = new Category(req.body);
        category.save((err, data) => {
          if (err) {
            return res.status(400).json({
              error: errorHandler(err),
            });
          }
          res.redirect("/admin/categoryManagement");
        });
      }
    });
  },

  updateCategory: async (req, res) => {
    let category = req.category;
    let categoryName = req.body.name;
    await Category.updateOne(
      { _id: category._id },
      { $set: { name: categoryName } }
    );
    res.redirect("/admin/categoryManagement");
  },

  deleteCategory: async (req, res) => {
    let category = req.category;
    await Category.deleteOne({ _id: category._id });
    res.redirect("/admin/categoryManagement");
  },

  categoryById: (req, res, next, id) => {
    Category.findById(id).exec((err, category) => {
      if (err || !category) {
        return res.status(400).json({
          error: "User not found",
        });
      }
      req.category = category;
      next();
    });
  },

  categoryDashboard: (req, res) => {
    getAllCategory().then((category) => {
      res.render("admin/categoryManagement", { category });
    });
  },

  displayEditCategoryForm: (req, res) => {
    category = req.category;
    res.render("admin/editCategory", { category });
  },

  displayCategoryOfferForm: (req, res) => {
    category = req.category;
    res.render("admin/addCategoryOffer", { category });
  },

  updateCategoryOffer: async (req, res) => {
    categoryDetails = req.category;
    let disPercentage = req.body.discountPercentage;
    let factor = 1 - disPercentage / 100;
    console.log(factor);
    await Category.updateOne(
      { name: categoryDetails.name },
      { $set: { offer: disPercentage } }
    );
    await product
      .updateMany({ category: categoryDetails.name }, [
        {
          $project: {
            name: 1,
            description: 1,
            actualprice: 1,
            category: 1,
            quantity: 1,
            ImageFileName: 1,
            price: { $multiply: ["$actualprice", factor] },
          },
        },
        { $set: { price: "$price" } },
      ])
      .then(() => {
        res.redirect("/admin/categoryManagement");
      });
  },

  addCategoryForm: (req, res) => {
    res.render("admin/addCategory");
  },
};
