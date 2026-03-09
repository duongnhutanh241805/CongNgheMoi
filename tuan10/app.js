require("dotenv").config();

const express = require("express");
const app = express();

const productRoutes = require("./routes/productRoutes");

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/", productRoutes);

app.listen(process.env.PORT, () => {
  console.log("Server running on port " + process.env.PORT);
});