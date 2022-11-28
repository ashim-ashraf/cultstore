const express = require("express");
const router = express.Router();
const {
  createProduct,
  productById,
  readProduct,
  deleteProduct,
  updateProduct,
  displayAddProductForm,
  displayEditProductForm,
  displayProductOfferForm,
  productOfferSubmit,
} = require("../controllers/productController");
const { userById } = require("../controllers/userController");
const { multipleUpload } = require("../controllers/upload");
const product = require("../models/product");

router.get("/read", readProduct);

router.get("/editProduct/:productId", displayEditProductForm);

router.post("/editProduct", multipleUpload, async (req, res) => {
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
    console.log("if called");
    product.replaceOne({ _id: productDetails._id }, productDetails).then(() => {
      res.redirect("/admin/productManagement");
    });
  } else {
    console.log("else called");
    product
      .updateOne(
        { _id: productDetails._id },
        {
          name: productDetails.name,
          description: productDetails.description,
          actualprice: productDetails.actualprice,
          price: productDetails.price,
          category: productDetails.category,
          quantity: productDetails.quantity,
        }
      )
      .then(() => {
        res.redirect("/admin/productManagement");
      });
  }
});

router.get("/addProductOffer/:productId", displayProductOfferForm);

router.post("/addOfferPrice", productOfferSubmit);

router.get("/addProduct", displayAddProductForm);

router.post("/addProduct", multipleUpload, createProduct);

router.get("/deleteProduct/:productId", deleteProduct);

router.param("userId", userById);

router.param("productId", productById);

module.exports = router;
