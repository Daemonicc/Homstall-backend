const express = require('express');

const router = express.Router();
const { multerUploads } = require('../middlewares/multer');

const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  rateProduct
} = require('../controllers/productController');

const { protect, authorize } = require('../middlewares/verifyAuth');

router
  .route('/')
  .get(getProducts)
  .post(protect, authorize('farmer', 'admin'), multerUploads, createProduct);

router
  .route('/:slug')
  .get(getProduct)
  .put(protect, updateProduct)
  .delete(protect, deleteProduct);

router
  .route('/:slug/rate')
  .post(protect, authorize('farmer', 'user', 'admin'), rateProduct);

module.exports = router;
