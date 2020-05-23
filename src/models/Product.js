const mongoose = require('mongoose');
const slugify = require('slugify');
const unique = require('unique-slug');

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    unique: true,
    trim: true,
    maxlength: [50, 'Name can not be more than 50 characters']
  },
  slug: {
    type: String,
    unique: true
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [500, 'Description can not be more than 500 characters']
  },

  amount: {
    type: Number,
    required: [true, 'Please add product cost']
  },

  quantity: {
    type: Number,
    required: [true, 'Please add Product quantity']
  },
  averageRating: {
    type: Number,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating must can not be more than 5']
  },
  photoUrl: {
    type: String,
    default: 'https://via.placeholder.com/150'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  url: {
    type: String
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  }
});

// Create product slug from the name
ProductSchema.pre('save', function (next) {
  const slugValue = `${slugify(this.name, { lower: true })}-${unique()}`;
  this.slug = slugValue;
  this.url = `/api/v1/products/${slugValue}`;
  next();
});

module.exports = mongoose.model('Product', ProductSchema);
