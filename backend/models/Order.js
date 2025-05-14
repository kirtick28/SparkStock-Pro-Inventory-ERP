const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Company'
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Customer'
  },
  cartitems: [
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
  gst: {
    status: { type: Boolean, required: true },
    percentage: { type: Number },
    amount: { type: Number }
  },
  discount: { type: Number, required: true },
  total: { type: Number, required: true },
  grandtotal: { type: Number, required: true },
  invoicepdf: { type: String },
  createdat: { type: Date, default: Date.now }
});

module.exports = orderSchema;
