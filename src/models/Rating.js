const mongoose = require('mongoose');
const User = require('./User');
const Product = require('./Product');

const RatingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    type: mongoose.Schema.ObjectId,
    ref: 'Product',
    required: true
  },
  rating: {
    type: Number,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating must can not be more than 5'],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Prevent user from submitting more than one rating per product
RatingSchema.index({ product: 1, user: 1 }, { unique: true });

// Static method to get avg rating and save
RatingSchema.statics.getAverageRating = async function (productId) {
  const obj = await this.aggregate([
    {
      $match: { product: productId }
    },
    {
      $group: {
        _id: '$product',
        averageRating: { $avg: '$rating' }
      }
    }
  ]);

  try {
    await this.model('Product').findByIdAndUpdate(productId, {
      averageRating: obj[0].averageRating
    });
  } catch (err) {
    console.error(err);
  }
};

// Static method to get avg rating for user
RatingSchema.statics.getAverageUserRating = async function (productId) {
  try {
    const product = await Product.findById(productId);
    const obj = await Product.aggregate([
      {
        $group: {
          _id: '$_id',
          averageRating: { $avg: '$averageRating' }
        }
      }
    ]);
    await this.model('User').findByIdAndUpdate(product.user, {
      rating: obj[0].averageRating
    });
  } catch (err) {
    console.error(err);
  }
};

// Call getAverageCost after save
RatingSchema.post('save', function () {
  this.constructor.getAverageRating(this.product);
  this.constructor.getAverageUserRating(this.product);
});

module.exports = mongoose.model('Rating', RatingSchema);
