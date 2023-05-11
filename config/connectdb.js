const mongoose = require("mongoose");

const connectDatabase = async (DB_URL) => {
  try {
    await mongoose.connect(DB_URL, { dbName: "shopconal" });
    console.log("Connected successfully!");
  } catch (error) {
    console.log(error);
  }
};

module.exports = connectDatabase;
