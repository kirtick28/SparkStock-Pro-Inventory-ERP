const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  id: {
    required: true,
    type: String
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Company'
  },
  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Product'
      },
      quantity: { type: Number, required: true }
    }
  ],
  giftboxes: [
    {
      giftBoxId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'GiftBox'
      },
      quantity: { type: Number, required: true }
    }
  ],
  discount: { type: Number, required: true },
  total: { type: Number, required: true },
  gst: {
    status: { type: Boolean, required: true },
    percentage: { type: Number },
    amount: { type: Number }
  },
  grandtotal: { type: Number, required: true }
});

module.exports = cartSchema;
