const mongoose = require('mongoose');

const giftBoxSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Company'
  },
  name: {
    type: String,
    required: true
  },
  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      },
      quantity: {
        type: Number,
        required: true,
        min: 1
      }
    }
  ],
  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  total: {
    type: Number,
    required: true
  },
  grandtotal: {
    type: Number,
    required: true
  },
  stockavailable: {
    type: Number,
    required: true,
    min: 0
  },
  totalsales: {
    type: Number,
    default: 0
  },
  totalrevenue: {
    type: Number,
    default: 0
  },
  status: {
    type: Boolean,
    default: true
  },
  createdat: {
    type: Date,
    default: Date.now
  }
});

giftBoxSchema.index({ companyId: 1, name: 1 }, { unique: true });

module.exports = giftBoxSchema;
