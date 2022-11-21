const formidable = require("formidable");
const _ = require("lodash");
const fs = require("fs");
const { errorHandler } = require("../helpers/dbErrorHandlers");
const Product = require("../models/product");
const productHelpers = require("../helpers/product-helpers");
const product = require("../models/product");
const { getAllCategory } = require("../helpers/admin-helpers");

module.exports = {
  productById: (req, res, next, id) => {
    Product.findById(id).exec((err, product) => {
      if (err || !product) {
        return res.status(400).json({
          error: "Product not found",
        });
      }
      req.product = product;
      next();
    });
  },

  readProduct: (req, res) => {
    req.product.photo = undefined;
    return res.json(req.product);
  },

  deleteProduct: (req, res) => {
    let product = req.product;
    product.remove((err, deletedProduct) => {
      if (err) {
        return res.status(400).json({
          error: errorHandler(err),
        });
      }
      res.redirect("/admin/productManagement");
    });
  },

  displayAddProductForm: (req, res) => {
    getAllCategory().then((category) => {
      console.log(category);
      res.render("admin/addProduct", { category });
    });
  },

  displayProductOfferForm: (req,res) => {
    let product = req.product;
    res.render("admin/addProductOffer", {product})
   },

  productOfferSubmit: async (req,res) =>{
    console.log(req.body);
    let user = req.session.user; 
    await updateOfferPrice(req.body).then((response) => {
      console.log(response);
      res.redirect("/admin/productManagement")
    })
  },

  displayEditProductForm: async (req, res) => {
    let product = req.product;
    await getAllCategory().then((category) => {
      console.log(category);
      res.render("admin/editProduct", { category, product });
    });
  },

  updateProduct: async (req, res) => {
    console.log("aaaaaa");
    let imageName = req.files.map(fileName);
    function fileName(files) {
      return files.filename;
    }
    let productDetails = req.body;
    productDetails.ImageFileName = imageName;
    console.log(productDetails);
    console.log(imageName);
    if (imageName[0]) {
      console.log('if called');
      await product
        .replaceOne({ _id: productDetails._id }, productDetails)
        .then((result) => {
          console.log(result);
          
        });
        res.redirect("/admin/productManagement");
    } else {
      console.log('else called');
      await product.updateOne(
        { _id: productDetails._id },
        {
          name: productDetails.name,
          description: productDetails.description,
          actualprice: productDetails.actualprice,
          price: productDetails.price,
          category: productDetails.category,
          quantity: productDetails.quantity,
        }
      ).then((result) => {
        console.log(result); 
      });
      res.redirect("/admin/productManagement");
    }
  },
 
  createProduct: (req, res) => {
    let imageName = req.files.map(fileName);
    function fileName(files) {
      return files.filename;
    }
    let productDetails = req.body;
    productDetails.ImageFileName = imageName;
    let product = new Product(req.body);
    product.save((err, result) => {
      if (err) {
        return res.status(400).json({
          err: errorHandler(err),
        });
      }
      res.redirect("/admin/productManagement");
    });
  },

  productDashboard: (req, res) => {
    getAllCategory().then((category) => {
      let cat = category;

      console.log(cat);
      productHelpers.getAllProducts().then((products) => {
        res.render("admin/productManagement", { products, cat });
      });
    });

    product
      .aggregate([
        {
          $lookup: {
            from: "category",
            localField: "price",
            foreignField: "price",
            as: "inventory_docs",
          },
        },
      ])
      .then((data) => {
        console.log(data);
      });
  },
};
