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


router.get("/read", readProduct);

router.get("/editProduct/:productId", displayEditProductForm)

router.post("/editProduct", multipleUpload, updateProduct );

router.get("/addProductOffer/:productId", displayProductOfferForm )

router.post("/addOfferPrice" , productOfferSubmit)
  
router.get("/addProduct", displayAddProductForm);

router.post("/addProduct", multipleUpload, createProduct);

router.get("/deleteProduct/:productId", deleteProduct);

router.param("userId", userById);

router.param("productId", productById);

module.exports = router;
