const mongoose = require("mongoose");

async function connectDB() {
    if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI chưa được cấu hình");
    }

    await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 5000
    });

    console.log("MongoDB connected");
}

module.exports = connectDB;