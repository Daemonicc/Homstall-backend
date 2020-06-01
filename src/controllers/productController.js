const ErrorResponse = require('../helpers/errorResponse');
const asyncHandler = require('../middlewares/async');
const Product = require('../models/Product');
const Rating = require('../models/Rating');
const { dataUri } = require('../middlewares/multer');
const { uploader } = require('../config/cloudinaryConfig');

// @desc      Get all products
// @route     GET /api/v1/products
// @access    Public
exports.getProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({});
  res.status(200).json({ success: true, data: products });
});

// @desc      Get single product
// @route     GET /api/v1/products/:slug
// @access    Public
exports.getProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.find({ slug: req.params.slug });

  if (!product) {
    return next(new ErrorResponse(`Product not found with slug of ${req.params.slug}`, 404));
  }

  res.status(200).json({ success: true, data: product });
});

// @desc      Create new product
// @route     POST /api/v1/products
// @access    Private
exports.createProduct = asyncHandler(async (req, res, next) => {
  // Add user to req,body
  req.body.user = req.user.id;
  if (req.file) {
    const file = dataUri(req).content;
    const result = await uploader.upload(file);
    req.body.photoUrl = result.url;
  }
  const product = await Product.create(req.body);

  return res.status(201).json({
    success: true,
    data: product
  });
});

// @desc      Update product
// @route     PUT /api/v1/products/:slug
// @access    Private
exports.updateProduct = asyncHandler(async (req, res, next) => {
  let product = await Product.findOne({ slug: req.params.slug });

  if (!product) {
    return next(new ErrorResponse(`Product not found with slug of ${req.params.slug}`, 404));
  }

  // Make sure user is product owner
  if (product.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`User ${req.params.id} is not authorized to update this product`, 401));
  }

  if (req.file) {
    const file = dataUri(req).content;
    const result = await uploader.upload(file);
    req.body.photoUrl = result.url;
  }

  product = await Product.findOneAndUpdate({ slug: req.params.slug }, req.body, {
    new: true,
    runValidators: true
  });

  return res.status(200).json({ success: true, data: product });
});

// @desc      Delete product
// @route     DELETE /api/v1/products/:slug
// @access    Private
exports.deleteProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findOne({ slug: req.params.slug });

  if (!product) {
    return next(new ErrorResponse(`Product not found with slug of ${req.params.slug}`, 404));
  }

  // Make sure user is product owner
  if (product.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to delete this product`, 401));
  }

  product.remove();

  return res.status(200).json({ success: true, data: {} });
});

// @desc      Rate product
// @route     POST /api/v1/products/:slug/rate
// @access    Private
exports.rateProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findOne({ slug: req.params.slug });

  if (!product) {
    return next(new ErrorResponse(`Product not found with slug of ${req.params.slug}`, 404));
  }

  //Ensure user cannot rate his own product

  if(product.user.toString() === req.user.id){
    return next(new ErrorResponse(`Product cannot be rated by user`, 401));
  }
  // check if rating by user exist already
  let rating = await Rating.findOne({ product: product.id, user: req.user.id });
  if (rating) {
    return next(new ErrorResponse(`Product ${req.params.slug} already rated by user`, 401));
  }

  rating = await Rating.create({
    user: req.user.id,
    product: product.id,
    rating: req.body.rating
  });

  return res.status(200).json({ success: true, data: rating });
});
