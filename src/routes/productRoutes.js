const express = require("express");

const router = express.Router();

const {
    createProduct,
    getProducts,
    getProductByPid,
    updateProduct,
    deleteProduct
} = require("../controllers/productController");

router.post("/", createProduct);

router.get("/", getProducts);

router.get("/:pid", getProductByPid);

router.put("/:pid", updateProduct);

router.delete("/:pid", deleteProduct);

module.exports = router;