const express = require("express");

const productRoutes = require("./src/routes/productRoutes");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "Product API is running"
    });
});

app.get("/health", (req, res) => {
    res.status(200).json({
        status: "ok"
    });
});

app.use("/api/products", productRoutes);

module.exports = app;