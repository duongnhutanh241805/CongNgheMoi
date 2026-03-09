const express = require("express");
const router = express.Router();
const multer = require("multer");

const upload = multer();

const controller = require("../controllers/productController");

router.get("/", controller.list);

router.get("/add", controller.showAdd);

router.post("/add", upload.single("image"), controller.add);

router.get("/delete/:id", controller.delete);

router.get("/edit/:id", controller.showEdit);

router.post("/edit", upload.single("image"), controller.edit);

router.get("/search", controller.search);
module.exports = router;