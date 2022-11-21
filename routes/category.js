const express = require("express");
const router = express.Router();
const {
  createCategory,
  categoryById,
  updateCategory,
  deleteCategory,
  displayEditCategoryForm,
  addCategoryForm,
  displayCategoryOfferForm,
  updateCategoryOffer,
} = require("../controllers/categoryController");

router.get("/addcategory", addCategoryForm);

router.post("/create", createCategory);

router.get("/editCategory/:categoryId", displayEditCategoryForm);

router.get("/addCategoryOffer/:categoryId" , displayCategoryOfferForm)

router.post("/addCategoryOffer/:categoryId", updateCategoryOffer)

router.post("/updateCategory/:categoryId", updateCategory);

router.get("/deleteCategory/:categoryId", deleteCategory);

router.param("categoryId", categoryById);

module.exports = router;
