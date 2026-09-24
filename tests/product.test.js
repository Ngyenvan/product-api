const request = require("supertest");
const mongoose = require("mongoose");

const app = require("../app");
const Product = require("../src/models/Product");

const TEST_MONGO_URI =
"mongodb://127.0.0.1:27017/productdb_test";

beforeAll(async () => {
await mongoose.connect(TEST_MONGO_URI, {
serverSelectionTimeoutMS: 5000,
});
}, 10000);

beforeEach(async () => {
await Product.deleteMany({});
});

afterAll(async () => {
await Product.deleteMany({});
await mongoose.disconnect();
}, 10000);

describe("Product CRUD API", () => {

test("CREATE - tạo Product", async () => {
    const response = await request(app)
        .post("/api/products")
        .send({
            pid: "P001",
            pname: "Pen Blue",
            price: 10000,
            quantity: 20
        });

    expect(response.statusCode).toBe(201);
    expect(response.body.pid).toBe("P001");
});

test("READ ALL - lấy danh sách Product", async () => {
    await Product.create({
        pid: "P002",
        pname: "Pen Red",
        price: 12000,
        quantity: 10
    });

    const response = await request(app)
        .get("/api/products");

    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(1);
});

test("READ ONE - tìm Product theo pid", async () => {
    await Product.create({
        pid: "P003",
        pname: "Pen Black",
        price: 15000,
        quantity: 5
    });

    const response = await request(app)
        .get("/api/products/P003");

    expect(response.statusCode).toBe(200);
    expect(response.body.pid).toBe("P003");
});

test("UPDATE - cập nhật Product", async () => {
    await Product.create({
        pid: "P004",
        pname: "Pen Green",
        price: 9000,
        quantity: 10
    });

    const response = await request(app)
        .put("/api/products/P004")
        .send({
            pname: "Pen Green Updated",
            price: 11000,
            quantity: 30
        });

    expect(response.statusCode).toBe(200);
    expect(response.body.quantity).toBe(30);
});

test("DELETE - xóa Product", async () => {
    await Product.create({
        pid: "P005",
        pname: "Pen Yellow",
        price: 8000,
        quantity: 15
    });

    const response = await request(app)
        .delete("/api/products/P005");

    expect(response.statusCode).toBe(200);

    const product = await Product.findOne({
        pid: "P005"
    });

    expect(product).toBeNull();
});

});