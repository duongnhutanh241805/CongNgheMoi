const { s3 } = require("../config/aws");
const productModel = require("../models/productModel");
const { v4: uuidv4 } = require("uuid");

const BUCKET = process.env.S3_BUCKET;

exports.list = async (req, res) => {
  const products = await productModel.getAll();
  res.render("index", { products });
};

exports.showAdd = (req, res) => {
  res.render("add");
};

exports.add = async (req, res) => {

  const { id, name, price, quantity } = req.body;

  // kiểm tra dữ liệu
  if (!id || id.trim() === "") {
    return res.send("ID cannot be empty");
  }

  if (!name || name.trim() === "") {
    return res.send("Name cannot be empty");
  }

  if (price <= 0) {
    return res.send("Price must be greater than 0");
  }

  if (quantity < 0) {
    return res.send("Quantity must be >= 0");
  }

  // kiểm tra file ảnh
  let imageUrl = "";

  if (req.file) {

    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];

    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.send("Only JPG, JPEG, PNG images are allowed");
    }

    const params = {
      Bucket: BUCKET,
      Key: uuidv4() + "_" + req.file.originalname,
      Body: req.file.buffer,
      ContentType: req.file.mimetype
    };

    const upload = await s3.upload(params).promise();
    imageUrl = upload.Location;
  }

  const product = {
    id,
    name,
    price: parseFloat(price),
    quantity: parseInt(quantity),
    image: imageUrl
  };

  await productModel.create(product);

  res.redirect("/");
};

exports.delete = async (req, res) => {
  await productModel.remove(req.params.id);
  res.redirect("/");
};

exports.showEdit = async (req, res) => {
  const product = await productModel.getById(req.params.id);
  res.render("edit", { product });
};

exports.edit = async (req, res) => {

  const { id, name, price, quantity, oldImage } = req.body;

  if (!id || id.trim() === "") {
    return res.send("ID cannot be empty");
  }

  if (!name || name.trim() === "") {
    return res.send("Name cannot be empty");
  }

  if (price <= 0) {
    return res.send("Price must be greater than 0");
  }

  if (quantity < 0) {
    return res.send("Quantity must be >= 0");
  }

  let imageUrl = oldImage;

  if (req.file) {

    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];

    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.send("Invalid image format");
    }

    const params = {
      Bucket: BUCKET,
      Key: uuidv4() + "_" + req.file.originalname,
      Body: req.file.buffer,
      ContentType: req.file.mimetype
    };

    const upload = await s3.upload(params).promise();
    imageUrl = upload.Location;
  }

  const product = {
    id,
    name,
    price: parseFloat(price),
    quantity: parseInt(quantity),
    image: imageUrl
  };

  await productModel.update(product);

  res.redirect("/");
};
exports.search = async (req, res) => {

  const keyword = req.query.keyword;

  const products = await productModel.getAll();

  const result = products.filter(p =>
    p.name.toLowerCase().includes(keyword.toLowerCase())
  );

  res.render("index", { products: result });

};