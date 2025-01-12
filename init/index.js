// const mongoose = require("mongoose");
// const initData = require("./data.js");
// const OverspeedingListing = require("../models/overspeeding.js");

// const MONGO_URL = "mongodb+srv://k213225:p2jQj40WAdzc4EZC@fastcars.kgzrh.mongodb.net/fypproject";



// main()
//     .then(() => {
//         console.log("Connected to MongoDB");
//     })
//     .catch((err) => {
//         console.error("Error connecting to MongoDB:", err);
//     });

// async function main() {
//     await mongoose.connect(MONGO_URL);
// }

// const initDB = async () => {
//     await OverspeedingListing.deleteMany({});
//     await OverspeedingListing.insertMany(initData.data);
//     console.log("data was initialized");
// };

// initDB();