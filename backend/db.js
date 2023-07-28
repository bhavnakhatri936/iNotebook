const mongoose = require("mongoose");

async function connectToMongo() {
    try {
        await mongoose.connect("mongodb://0.0.0.0:27017/inotebook", {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Failed to connect to MongoDB", error);
    }
}

module.exports = connectToMongo;
