const express = require('express');
const router = express.Router();
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const db = require('../db/dynamodb');
const s3 = require('../db/s3');

// Cấu hình multer để xử lý upload file (lưu trong memory)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // Giới hạn 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

function requireLogin(req, res, next) {
  if (!req.session.userId) {
    return res.redirect('/auth/login');
  }
  next();
}

// Hiển thị danh sách sản phẩm
router.get('/', requireLogin, async (req, res) => {
  try {
    const products = await db.getAllProducts();
    res.render('products', { products, username: req.session.username });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).send('Error loading products');
  }
});

// Thêm sản phẩm mới
router.post('/add', requireLogin, upload.single('image'), async (req, res) => {
  try {
    const { name, price, quantity } = req.body;
    
    let imageUrl = null;
    if (req.file) {
      imageUrl = await s3.uploadImage(req.file);
    }

    const product = {
      id: uuidv4(),
      name,
      price: parseFloat(price),
      quantity: parseInt(quantity),
      imageUrl,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await db.createProduct(product);
    res.redirect('/');
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).send('Error adding product');
  }
});

// Hiển thị form chỉnh sửa
router.get('/edit/:id', requireLogin, async (req, res) => {
  try {
    const { id } = req.params;
    const product = await db.getProductById(id);
    
    if (!product) {
      return res.status(404).send('Product not found');
    }
    
    res.render('edit', { product });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).send('Error loading product');
  }
});

// Cập nhật sản phẩm
router.post('/edit/:id', requireLogin, upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, quantity } = req.body;
    
    const existingProduct = await db.getProductById(id);
    if (!existingProduct) {
      return res.status(404).send('Product not found');
    }

    let imageUrl = existingProduct.imageUrl;
    
    // Nếu có ảnh mới được upload
    if (req.file) {
      // Xóa ảnh cũ nếu có
      if (existingProduct.imageUrl) {
        await s3.deleteImage(existingProduct.imageUrl);
      }
      // Upload ảnh mới
      imageUrl = await s3.uploadImage(req.file);
    }

    await db.updateProduct(id, name, price, quantity, imageUrl);
    res.redirect('/');
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).send('Error updating product');
  }
});

// Xóa sản phẩm
router.get('/delete/:id', requireLogin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Lấy thông tin sản phẩm để xóa ảnh
    const product = await db.getProductById(id);
    if (product && product.imageUrl) {
      await s3.deleteImage(product.imageUrl);
    }
    
    await db.deleteProduct(id);
    res.redirect('/');
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).send('Error deleting product');
  }
});

module.exports = router;
