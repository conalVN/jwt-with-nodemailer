require("dotenv").config();
const cors = require("cors");
const express = require("express");
const connectDatabase = require("./config/connectdb");
const userRoutes = require("./routes/userRoutes");

const app = express();
const port = process.env.PORT || 5050;
const DB_URL = process.env.DATABASE_URL;

app.use(cors());
app.use(express.json());
// database connect
connectDatabase(DB_URL);

// router
app.use("/api/user", userRoutes);

app.listen(port, () => {
  console.log(`Server running port http://localhost:${port}`);
});
